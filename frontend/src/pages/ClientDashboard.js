import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ClientDashboard.css';
import Toast from '../components/Toast';
import useToast from '../components/useToast';
import axios from "../utils/axiosInstance";

function ClientDashboard() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Applicants modal state
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: ''
  });

  // ✅ Fetch only this client's projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("/projects/my-projects");
        setProjects(res.data || []);
      } catch (err) {
        console.log("ERROR:", err.response?.data || err.message);
        showToast("Failed to load projects", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  const handlePostProject = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/projects", {
        title: newProject.title,
        description: newProject.description,
        budget: Number(newProject.budget),
        deadline: newProject.deadline,
      });

      showToast("Project posted successfully! 🎉", "success");
      setShowModal(false);
      setNewProject({ title: '', description: '', budget: '', deadline: '' });
      setProjects((prev) => [...prev, res.data]);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create project", "error");
    }
  };

  // ── VIEW APPLICANTS ──
  const handleViewApplicants = async (projectId) => {
    setSelectedProjectId(projectId);
    setShowApplicantsModal(true);
    setApplicantsLoading(true);
    try {
      const res = await axios.get(`/projects/${projectId}/applicants`);
      setApplicants(res.data || []);
    } catch (err) {
      showToast("Failed to load applicants", "error");
    } finally {
      setApplicantsLoading(false);
    }
  };

  // ── SELECT FREELANCER ──
  const handleSelectFreelancer = async (freelancerId) => {
    try {
      await axios.put(`/projects/${selectedProjectId}/select`, { freelancerId });
      showToast("Freelancer selected! Project is now In Progress 🚀", "success");
      setShowApplicantsModal(false);
      // Refresh projects
      const res = await axios.get("/projects/my-projects");
      setProjects(res.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || "Selection failed", "error");
    }
  };

  // ── RELEASE PAYMENT (blockchain) ──
  const handleReleasePayment = async (project) => {
    try {
      await axios.post("/blockchain/release-payment", { projectId: project._id });
      showToast("Payment released successfully 🚀", "success");
      setProjects(prev =>
        prev.map(p => p._id === project._id ? { ...p, status: "Completed" } : p)
      );
    } catch (err) {
      showToast(err.response?.data?.error || "Payment release failed", "error");
    }
  };

  // ── ACCEPT WORK ──
  const handleAcceptWork = async (project) => {
    try {
      const res = await axios.post(`/projects/${project._id}/accept`);
      showToast(`Work accepted & payment released on-chain! TX: ${res.data.txHash?.slice(0, 10)}...`, "success");
      setProjects(prev =>
        prev.map(p => p._id === project._id
          ? { ...p, status: "Completed", submissionStatus: "Accepted" }
          : p
        )
      );
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to accept work", "error");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'In Progress': return 'status-progress';
      case 'Completed':   return 'status-completed';
      case 'Open':        return 'status-open';
      case 'Disputed':    return 'status-disputed';
      default:            return '';
    }
  };

  // Compute escrow amount = sum of budgets for In Progress projects
  const escrowTotal = projects
    .filter(p => p?.status === "In Progress")
    .reduce((sum, p) => sum + (p.budget || 0), 0);

  return (
    <div className="dashboard">

      {/* TOAST */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1>👔 Client Dashboard</h1>
          <p>Welcome back! Manage your projects and payments here.</p>
        </div>
        <button className="post-btn" onClick={() => setShowModal(true)}>
          + Post New Project
        </button>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <span>📋</span>
          <div>
            <h3>{projects?.length || 0}</h3>
            <p>Total Projects</p>
          </div>
        </div>
        <div className="stat-card">
          <span>🔒</span>
          <div>
            <h3>{escrowTotal.toFixed(3)} ETH</h3>
            <p>Funds in Escrow</p>
          </div>
        </div>
        <div className="stat-card">
          <span>✅</span>
          <div>
            <h3>{projects.filter(p => p?.status === "Completed").length}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <span>🔃</span>
          <div>
            <h3>{projects.filter(p => p?.status === "In Progress").length}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="stat-card">
          <span>⚠️</span>
          <div>
            <h3>{projects?.filter(p => p?.status === "Disputed").length}</h3>
            <p>Disputed</p>
          </div>
        </div>
      </div>

      {/* PROJECTS TABLE */}
      <div className="projects-section">
        <h2>My Projects</h2>
        <div className="table-wrapper">
          <table className="projects-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Project Title</th>
                <th>Freelancer</th>
                <th>Budget</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Submission</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8">Loading...</td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                    No projects yet. Post your first project!
                  </td>
                </tr>
              ) : (
                projects.map((project, index) => {
                  if (!project) return null;
                  return (
                    <tr key={project._id}>
                      <td>{index + 1}</td>
                      <td>{project.title}</td>
                      <td>{project.freelancer?.name || "Not Assigned"}</td>
                      <td>{project.budget} ETH</td>
                      <td>{new Date(project.deadline).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                      <td>
                        {project.submissionStatus === "Submitted" && (
                          <span className="status-badge status-progress">
                            📩 Submitted
                          </span>
                        )}
                        {project.submissionStatus === "Accepted" && (
                          <span className="status-badge status-completed">
                            ✅ Accepted
                          </span>
                        )}
                        {(!project.submissionStatus || project.submissionStatus === "None") && (
                          <span style={{ color: '#888' }}>—</span>
                        )}
                      </td>
                      <td className="action-btns">
                        <button
                          className="btn-view"
                          onClick={() => navigate(`/project/${project._id}`)}
                        >
                          View
                        </button>

                        {/* View Applicants button – show when Open */}
                        {project.status === 'Open' && (
                          <button
                            className="btn-release"
                            style={{ background: '#6c5ce7' }}
                            onClick={() => handleViewApplicants(project._id)}
                          >
                            Applicants ({project.applicants?.length || 0})
                          </button>
                        )}

                        {/* Accept Work – show when submission is pending review */}
                        {project.status === 'In Progress' &&
                          project.submissionStatus === 'Submitted' && (
                          <button
                            className="btn-release"
                            onClick={() => handleAcceptWork(project)}
                          >
                            ✅ Accept Work
                          </button>
                        )}

                        {/* Manual Release – for In Progress without submission */}
                        {project.status === 'In Progress' &&
                          project.submissionStatus !== 'Submitted' &&
                          project.submissionStatus !== 'Accepted' && (
                          <button
                            className="btn-release"
                            onClick={() => handleReleasePayment(project)}
                          >
                            Release
                          </button>
                        )}

                        {/* Dispute button */}
                        {(project.status === 'In Progress' || project.status === 'Disputed') && (
                          <button
                            className="btn-dispute"
                            onClick={() => navigate(`/dispute?projectId=${project._id}`)}
                          >
                            Dispute
                          </button>
                        )}

                        {/* Escrow details */}
                        {project.status !== 'Open' && (
                          <button
                            className="btn-view"
                            style={{ background: '#00b894' }}
                            onClick={() => navigate(`/escrow-payment?projectId=${project._id}`)}
                          >
                            Escrow
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POST PROJECT MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Post New Project</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handlePostProject} className="modal-form">
              <div className="form-group">
                <label>Project Title</label>
                <input
                  type="text"
                  name="title"
                  value={newProject.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={newProject.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Budget (ETH)</label>
                  <input
                    type="text"
                    name="budget"
                    value={newProject.budget}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={newProject.deadline}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit">Post Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPLICANTS MODAL */}
      {showApplicantsModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '600px', width: '90%' }}>
            <div className="modal-header">
              <h2>👥 Applicants</h2>
              <button className="close-btn" onClick={() => setShowApplicantsModal(false)}>✕</button>
            </div>

            {applicantsLoading ? (
              <p style={{ padding: '1rem' }}>Loading applicants...</p>
            ) : applicants.length === 0 ? (
              <p style={{ padding: '1rem', color: '#888' }}>No applicants yet.</p>
            ) : (
              <div style={{ padding: '0.5rem 0' }}>
                {applicants.map((app, i) => (
                  <div
                    key={app._id || i}
                    style={{
                      border: '1px solid #333',
                      borderRadius: '8px',
                      padding: '1rem',
                      margin: '0.5rem 1rem',
                      background: '#1a1a2e'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>💻 {app.freelancer?.name || 'Unknown'}</strong>
                        <p style={{ color: '#888', fontSize: '0.85rem', margin: '0.25rem 0' }}>
                          {app.freelancer?.email}
                        </p>
                        {app.proposal && (
                          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}>
                            📝 {app.proposal}
                          </p>
                        )}
                        <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                          Applied: {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        className="btn-release"
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
              <button
                className="btn-view"
                style={{ width: '100%' }}
                onClick={() => setShowApplicantsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ClientDashboard;
