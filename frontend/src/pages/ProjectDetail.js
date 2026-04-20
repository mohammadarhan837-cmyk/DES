import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/ProjectDetail.css';
import axios from '../utils/axiosInstance';

// ✅ Toast
import useToast from '../components/useToast';
import Toast from '../components/Toast';

function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { toast, showToast, hideToast } = useToast();

  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [txHash, setTxHash] = useState(null);
  const [loadingTx, setLoadingTx] = useState(false);

  // ================= FETCH PROJECT =================
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`/projects/${id}`);
        setProject(res.data);
      } catch (err) {
        console.log("ERROR:", err.response?.data || err.message);
      }
    };

    fetchProject();
  }, [id]);

  if (!project) return <p>Loading...</p>;

  // ================= RELEASE PAYMENT =================
  const handleReleasePayment = async () => {
    try {
      setLoadingTx(true);

      const res = await axios.post("/blockchain/release-payment", {
        projectId: project._id,
      });

      setTxHash(res.data.txHash);

      showToast("Payment released successfully 🚀", "success");

      setProject(prev => ({
        ...prev,
        status: "Completed"
      }));

    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;

      if (errorMsg.toLowerCase().includes("already")) {
        showToast("Payment already completed ✅", "info");
      } else {
        showToast(errorMsg, "error");
      }

    } finally {
      setLoadingTx(false);
    }
  };

  // ================= REFUND =================
  const handleRefund = async () => {
    try {
      setLoadingTx(true);

      const res = await axios.post("/blockchain/refund", {
        projectId: project._id,
      });

      setTxHash(res.data.txHash);

      showToast("Refund successful 💸", "success");

      setProject(prev => ({
        ...prev,
        status: "Disputed"
      }));

    } catch (err) {
      showToast(err.response?.data?.error || "Refund failed", "error");
    } finally {
      setLoadingTx(false);
    }
  };

  const getMilestoneClass = (status) => {
    switch (status) {
      case 'Completed': return 'milestone-completed';
      case 'In Progress': return 'milestone-progress';
      case 'Pending': return 'milestone-pending';
      default: return '';
    }
  };

  return (
    <div className="detail-page">

      {/* TOAST */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      {/* BACK */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* HEADER */}
      <div className="detail-header">
        <div className="detail-header-left">
          <h1>{project.title}</h1>

          <div className="detail-meta">
            <span>👔 Client: <strong>{project.client?.name}</strong></span>
            <span>💻 Freelancer: <strong>{project.freelancer?.name || "Not Assigned"}</strong></span>
            <span>📅 Deadline: <strong>{new Date(project.deadline).toLocaleDateString()}</strong></span>
          </div>
        </div>

        <div className="detail-header-right">
          <div className="detail-budget">
            <p>Project Budget</p>
            <h2>{project.budget} ETH</h2>

            <span className={`status-badge ${
              project.status === "Completed"
                ? "status-completed"
                : project.status === "Disputed"
                ? "status-disputed"
                : "status-progress"
            }`}>
              {project.status}
            </span>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs">
        <button
          className={activeTab === 'overview' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('overview')}
        >
          📋 Overview
        </button>

        <button
          className={activeTab === 'milestones' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('milestones')}
        >
          🎯 Milestones
        </button>

        <button
          className={activeTab === 'escrow' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('escrow')}
        >
          🔒 Escrow
        </button>
      </div>

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          <p>{project.description}</p>
        </div>
      )}

      {/* MILESTONES */}
      {activeTab === 'milestones' && (
        <div className="tab-content">
          {project.milestones?.map((m, i) => (
            <div key={m._id || i} className="milestone-card">
              <h3>{m.title}</h3>
              <span className={getMilestoneClass(m.status)}>
                {m.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ESCROW */}
      {activeTab === 'escrow' && (
        <div className="tab-content">

          <div style={{ marginTop: "20px" }}>
            <button
              className="btn-escrow"
              onClick={handleReleasePayment}
              disabled={loadingTx || project.status === "Completed"}
            >
              {project.status === "Completed"
                ? "✅ Payment Completed"
                : loadingTx
                ? "Processing..."
                : "🚀 Release Payment"}
            </button>

            <button
              className="btn-dispute-action"
              onClick={handleRefund}
              disabled={loadingTx || project.status === "Completed"}
              style={{ marginLeft: "10px" }}
            >
              💸 Refund Client
            </button>
          </div>

          {/* TX HASH */}
          {txHash && (
            <div style={{ marginTop: "20px", color: "green" }}>
              <p>✅ Transaction Successful</p>
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
              >
                View on Etherscan 🔗
              </a>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

export default ProjectDetail;

