import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ESCROW_ABI } from '../utils/contractData';
import { useNavigate } from 'react-router-dom';
import '../styles/ClientDashboard.css';
import '../styles/PremiumButtons.css';
import '../styles/Milestone.css';

import Toast from '../components/Toast';
import useToast from '../components/useToast';
import axios from '../utils/axiosInstance';

function ClientDashboard() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  const [showModal,   setShowModal]   = useState(false);
  const [projects,    setProjects]    = useState([]);
  const [loading,     setLoading]     = useState(true);

  // Applicants modal
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [applicants,          setApplicants]          = useState([]);
  const [applicantsLoading,   setApplicantsLoading]   = useState(false);
  const [selectedProjectId,   setSelectedProjectId]   = useState(null);

  const [newProject, setNewProject] = useState({ title: '', description: '', budget: '', deadline: '' });

  // Termination confirm modal
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [terminateTarget,    setTerminateTarget]    = useState(null);

  const [showReviewModal,    setShowReviewModal]    = useState(false);
  const [reviewTarget,       setReviewTarget]       = useState(null);


  const fetchProjects = async () => {
    try {
      const res = await axios.get('/projects/my-projects');
      setProjects(res.data || []);
    } catch (err) {
      console.log('Fetch error:', err.response?.data || err.message);
      showToast('Failed to load projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => setNewProject({ ...newProject, [e.target.name]: e.target.value });

  const handlePostProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/projects', {
        title: newProject.title, description: newProject.description,
        budget: Number(newProject.budget), deadline: newProject.deadline,
      });
      showToast('Project posted! 🎉 Select a freelancer to begin negotiation.', 'success');
      setShowModal(false);
      setNewProject({ title: '', description: '', budget: '', deadline: '' });
      // Re-fetch so the new project shows with all populated fields
      setLoading(true);
      fetchProjects();
    } catch (err) { showToast(err.response?.data?.message || 'Failed to create project', 'error'); }
  };

  // View applicants
  const handleViewApplicants = async (projectId) => {
    setSelectedProjectId(projectId);
    setShowApplicantsModal(true);
    setApplicantsLoading(true);
    setApplicants([]);
    try {
      const res = await axios.get(`/projects/${projectId}/applicants`);
      console.log('Applicants response:', res.data);
      setApplicants(res.data || []);
    } catch (err) {
      console.error('Applicants error:', err.response?.status, err.response?.data);
      showToast(
        err.response?.status === 403
          ? 'Permission denied — make sure you are logged in as Client'
          : err.response?.data?.message || 'Failed to load applicants',
        'error'
      );
    } finally { setApplicantsLoading(false); }
  };

  // Select freelancer → creates negotiation
  const handleSelectFreelancer = async (freelancerId) => {
    try {
      await axios.put(`/projects/${selectedProjectId}/select`, { freelancerId });
      showToast('Freelancer selected! Negotiation phase started 🤝', 'success');
      setShowApplicantsModal(false);
      const res = await axios.get('/projects/my-projects');
      setProjects(res.data || []);
    } catch (err) { showToast(err.response?.data?.message || 'Selection failed', 'error'); }
  };

  // Accept work → on-chain release
  const handleAcceptWork = async (project) => {
    try {
      if (!window.ethereum) throw new Error("MetaMask not found!");
      if (!project.contractAddress) throw new Error("No contract linked to this project!");

      showToast("🚀 Releasing payment on-chain... Please confirm", "info");

      // 1. Initialize Contract
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(project.contractAddress, ESCROW_ABI, signer);

      // 2. Trigger On-Chain Release
      const tx = await contract.releasePayment();
      await tx.wait();

      // 3. Sync with Backend
      await axios.post(`/projects/${project._id}/accept`);
      showToast(`Work accepted & payment released!`, 'success');
      setProjects(p => p.map(x => x._id === project._id ? { ...x, status: 'Completed', submissionStatus: 'Accepted' } : x));
    } catch (err) {
      console.error("Release error:", err);
      // If it was already released on-chain, sync the DB anyway
      if (err.message?.toLowerCase().includes('already') || err.reason?.toLowerCase().includes('already')) {
        await axios.post(`/projects/${project._id}/accept`);
        setProjects(p => p.map(x => x._id === project._id ? { ...x, status: 'Completed', submissionStatus: 'Accepted' } : x));
        showToast('Syncing: Payment was already released ✅', 'success');
        return;
      }
      showToast(err.reason || err.message || 'Failed to release payment', 'error');
    }
  };

  // Terminate & Refund
  const handleTerminate = async () => {
    try {
      const res = await axios.post('/blockchain/refund', { projectId: terminateTarget._id });
      showToast(`Refund successful! TX: ${res.data.txHash?.slice(0, 10)}...`, 'success');
      setShowTerminateModal(false);
      setProjects(p => p.map(x => x._id === terminateTarget._id ? { ...x, status: 'Disputed' } : x));
    } catch (err) { showToast(err.response?.data?.message || 'Termination failed', 'error'); }
  };

  // Extension respond
  const handleExtension = async (projectId, approved) => {
    try {
      await axios.put('/progress/respond-extension', { projectId, approved });
      showToast(approved ? 'Extension approved ✅' : 'Extension denied ❌', approved ? 'success' : 'info');
      setProjects(p => p.map(x => x._id === projectId
        ? { ...x, extensionStatus: approved ? 'Approved' : 'Denied' }
        : x
      ));
    } catch (err) { showToast(err.response?.data?.message || 'Failed', 'error'); }
  };

  const getStatusClass = (s) => ({
    'In Progress': 'status-progress', Completed: 'status-completed',
    Open: 'status-open', Disputed: 'status-disputed'
  })[s] || '';

  const escrowTotal = projects.filter(p => p?.status === 'In Progress').reduce((s, p) => s + (p.budget || 0), 0);

  return (
    <div className="dashboard">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1>💼 Client Dashboard</h1>
          <p>Manage your projects and hire top talent.</p>
        </div>
        <button className="btn-premium" onClick={() => setShowModal(true)}>
          <span className="icon">➕</span> Post New Project
        </button>
      </div>

      {/* STATS */}


      {/* Extension Approval Banners (projects with pending extensions) */}
      {projects.filter(p => p.extensionStatus === 'Pending').map(p => (
        <div key={p._id} className="extension-banner">
          <p>
            ⏳ <strong>{p.title}</strong> — Freelancer requests extension to{' '}
            <strong>{p.extensionProposedDeadline ? new Date(p.extensionProposedDeadline).toLocaleDateString() : '?'}</strong>
          </p>
          <div className="extension-actions">
            <button className="btn-approve" onClick={() => handleExtension(p._id, true)}>✅ Approve</button>
            <button className="btn-deny"    onClick={() => handleExtension(p._id, false)}>❌ Deny</button>
          </div>
        </div>
      ))}

      {/* STATS */}
      <div className="stats-grid">
        {[
          ['📋', projects.length, 'Total Projects'],
          ['🔒', `${escrowTotal.toFixed(3)} ETH`, 'In Escrow'],
          ['✅', projects.filter(p => p?.status === 'Completed').length, 'Completed'],
          ['🔃', projects.filter(p => p?.status === 'In Progress').length, 'In Progress'],
          ['⚠️', projects.filter(p => p?.status === 'Disputed').length, 'Disputed'],
        ].map(([icon, val, label]) => (
          <div className="stat-card" key={label}>
            <span>{icon}</span><div><h3>{val}</h3><p>{label}</p></div>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="projects-section">
        <h2>My Projects</h2>
        <div className="table-wrapper">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Project Title</th>
                <th>Hired Freelancer</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9">Loading...</td></tr>
              ) : projects.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>No projects yet. Post your first!</td></tr>
              ) : projects.map((project, index) => project && (
                <tr key={project._id}>
                  <td>{project.title}</td>
                  <td>{project.freelancer?.name || 'Not Assigned'}</td>
                  <td>{project.budget} ETH</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(project.status)}`}>{project.status}</span>
                  </td>
                  <td className="action-btns">
                    <button className="btn-premium-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => navigate(`/project/${project._id}`)}>View</button>

                    {project.status === 'Open' && (
                      <button className="btn-premium" style={{ padding: '6px 12px', fontSize: '0.85rem', background: '#6c5ce7' }} onClick={() => handleViewApplicants(project._id)}>
                        👥 Applicants ({project.applicants?.length || 0})
                      </button>
                    )}

                    {project.negotiationStatus && project.negotiationStatus !== 'None' && project.negotiationStatus !== 'FundsLocked' && (
                      <button className="btn-view" style={{ background: '#a29bfe', color: '#1a1a2e' }}
                        onClick={() => navigate(`/project/${project._id}`)}>
                        🤝 Negotiate
                      </button>
                    )}

                    {project.status === 'In Progress' && project.submissionStatus === 'Submitted' && (
                      <button 
                        className="btn-release" 
                        style={{ background: '#00d4ff', color: '#000' }}
                        onClick={() => { setReviewTarget(project); setShowReviewModal(true); }}
                      >
                        📩 Review Work
                      </button>
                    )}


                    {project.terminationEligible && project.status === 'In Progress' && (
                      <button className="btn-terminate" onClick={() => { setTerminateTarget(project); setShowTerminateModal(true); }}>
                        ⚡ Terminate
                      </button>
                    )}

                    {project.status === 'In Progress' && (
                      <button className="btn-dispute" onClick={() => navigate(`/dispute?projectId=${project._id}`)}>Dispute</button>
                    )}
                    {project.status !== 'Open' && (
                      <button className="btn-view" style={{ background: '#00b894' }} onClick={() => navigate(`/escrow-payment?projectId=${project._id}`)}>
                        Escrow
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── POST PROJECT MODAL ── */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Post New Project</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <p style={{ padding: '0 1.5rem 0.5rem', color: '#888', fontSize: '0.85rem' }}>
              💡 No funds locked yet — contract deploys after you negotiate terms with the freelancer.
            </p>
            <form onSubmit={handlePostProject} className="modal-form">
              <div className="form-group">
                <label>Project Title</label>
                <input type="text" name="title" value={newProject.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={newProject.description} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Initial Budget (ETH)</label>
                  <input type="text" name="budget" value={newProject.budget} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Initial Deadline</label>
                  <input type="date" name="deadline" value={newProject.deadline} onChange={handleChange} required />
                </div>
              </div>
              <div className="modal-actions">
                 <button type="button" className="btn-premium-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-premium">Post Project</button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── APPLICANTS MODAL ── */}
      {showApplicantsModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '600px', width: '90%' }}>
            <div className="modal-header">
              <h2>👥 Applicants</h2>
              <button className="close-btn" onClick={() => setShowApplicantsModal(false)}>✕</button>
            </div>
            {applicantsLoading ? (
              <p style={{ padding: '2rem', textAlign: 'center' }}>⌛ Loading applicants...</p>
            ) : applicants.length === 0 ? (
              <p style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No applicants yet.</p>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {applicants.map((app, i) => (
                  <div key={app._id || i} style={{ border: '1px solid #2d3561', borderRadius: '10px', padding: '1.2rem', margin: '0.75rem 1rem', background: '#0f3460' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ color: '#00d4ff', fontSize: '1.1rem' }}>
                          👤 {app.freelancer?.name || 'Unknown User'}
                        </strong>
                        <p style={{ color: '#aaa', fontSize: '0.85rem', margin: '4px 0' }}>
                          📧 {app.freelancer?.email || 'No email provided'}
                        </p>
                        {app.proposal && (
                          <div style={{ marginTop: '10px', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', fontSize: '0.9rem', color: '#ccc' }}>
                            <strong>Proposal:</strong> {app.proposal}
                          </div>
                        )}
                      </div>
                      <button 
                        className="btn-release" 
                        style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                        onClick={() => handleSelectFreelancer(app.freelancer?._id)}
                      >
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ padding: '1rem' }}>
              <button className="btn-view" style={{ width: '100%' }} onClick={() => setShowApplicantsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW WORK MODAL */}
      {showReviewModal && reviewTarget && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>📩 Review Submission</h2>
              <button className="close-btn" onClick={() => setShowReviewModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem' }}>
              <p style={{ color: '#aaa', marginBottom: '1rem' }}>Project: <strong>{reviewTarget.title}</strong></p>
              
              <div className="submission-box" style={{ background: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '10px' }}>
                <label style={{ color: '#00d4ff', fontSize: '0.8rem', textTransform: 'uppercase' }}>Work Link:</label>
                <a href={reviewTarget.submissionData?.link} target="_blank" rel="noreferrer" style={{ display: 'block', color: '#fff', margin: '8px 0 1.5rem', wordBreak: 'break-all' }}>
                  {reviewTarget.submissionData?.link} 🔗
                </a>

                <label style={{ color: '#00d4ff', fontSize: '0.8rem', textTransform: 'uppercase' }}>Freelancer's Note:</label>
                <p style={{ color: '#ccc', marginTop: '8px' }}>
                  {reviewTarget.submissionData?.note || "No note provided."}
                </p>
              </div>

              <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0,212,255,0.1)', borderRadius: '8px', border: '1px solid #00d4ff33' }}>
                <p style={{ fontSize: '0.9rem', color: '#00d4ff', textAlign: 'center' }}>
                  Clicking "Accept" will trigger the Smart Contract and release <strong>{reviewTarget.budget} ETH</strong> to the freelancer.
                </p>
              </div>
            </div>
            <div className="modal-actions" style={{ padding: '1rem', display: 'flex', gap: '1rem' }}>
              <button className="btn-view" style={{ flex: 1 }} onClick={() => setShowReviewModal(false)}>Later</button>
              <button className="btn-release" style={{ flex: 2 }} onClick={() => {
                handleAcceptWork(reviewTarget);
                setShowReviewModal(false);
              }}>
                ✅ Accept & Release
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TERMINATE CONFIRM MODAL ── */}
      {showTerminateModal && terminateTarget && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h2 style={{ color: '#ff6b6b' }}>⚡ Confirm Termination</h2>
              <button className="close-btn" onClick={() => setShowTerminateModal(false)}>✕</button>
            </div>
            <div style={{ padding: '1rem 1.5rem' }}>
              <p style={{ color: '#ccc', lineHeight: 1.6 }}>
                You are about to <strong style={{ color: '#ff6b6b' }}>terminate</strong> project{' '}
                <strong>"{terminateTarget.title}"</strong> and trigger a refund from the smart contract.
              </p>
              <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.75rem' }}>
                ⚠️ This action is irreversible and will call <code>refundClient()</code> on-chain.
              </p>
              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button onClick={() => setShowTerminateModal(false)}>Cancel</button>
                <button style={{ background: '#e53935', borderColor: '#e53935' }} onClick={handleTerminate}>
                  ⚡ Yes, Terminate & Refund
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientDashboard;
