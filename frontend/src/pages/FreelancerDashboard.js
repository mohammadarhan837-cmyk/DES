import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FreelancerDashboard.css';
import Toast from '../components/Toast';
import useToast from '../components/useToast';
import axios from '../utils/axiosInstance';

function FreelancerDashboard() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [activeTab, setActiveTab] = useState('browse');

  // ── DATA STATE ──
  const [allProjects, setAllProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [loadingBrowse, setLoadingBrowse] = useState(true);
  const [loadingMy, setLoadingMy] = useState(true);

  // ── APPLY MODAL ──
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyTarget, setApplyTarget] = useState(null);
  const [proposal, setProposal] = useState('');
  const [appliedIds, setAppliedIds] = useState([]);

  // ── SUBMIT WORK MODAL ──
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [submitData, setSubmitData] = useState({ link: '', description: '' });

  // ── FETCH ALL OPEN PROJECTS (Browse tab) ──
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get('/projects');
        // Show only Open projects
        setAllProjects((res.data || []).filter(p => p.status === 'Open'));
      } catch (err) {
        showToast('Failed to load projects', 'error');
      } finally {
        setLoadingBrowse(false);
      }
    };
    fetchAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── FETCH MY ASSIGNED PROJECTS (My Projects tab) ──
  useEffect(() => {
    const fetchMine = async () => {
      try {
        const res = await axios.get('/projects/my-work');
        setMyProjects(res.data || []);
      } catch (err) {
        showToast('Failed to load your projects', 'error');
      } finally {
        setLoadingMy(false);
      }
    };
    fetchMine();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── APPLY ──
  const openApplyModal = (project) => {
    setApplyTarget(project);
    setProposal('');
    setShowApplyModal(true);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/projects/${applyTarget._id}/apply`, { proposal });
      setAppliedIds(prev => [...prev, applyTarget._id]);
      showToast(`Applied to "${applyTarget.title}" successfully! 🎉`, 'success');
      setShowApplyModal(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Apply failed', 'error');
    }
  };

  // ── SUBMIT WORK ──
  const openSubmitModal = (project) => {
    setSelectedProject(project);
    setSubmitData({ link: '', description: '' });
    setShowSubmitModal(true);
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/projects/${selectedProject._id}/submit`, {
        submissionLink: submitData.link,
        submissionNote: submitData.description,
      });
      showToast('Work submitted successfully! 🎉 Waiting for client approval.', 'success');
      setShowSubmitModal(false);
      // Update local state
      setMyProjects(prev =>
        prev.map(p =>
          p._id === selectedProject._id
            ? { ...p, submissionStatus: 'Submitted' }
            : p
        )
      );
    } catch (err) {
      showToast(err.response?.data?.message || 'Submit failed', 'error');
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

  // Computed stats
  const totalEarned = myProjects
    .filter(p => p.status === 'Completed')
    .reduce((sum, p) => sum + (p.budget || 0), 0);

  return (
    <div className="dashboard">

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      {/* ── HEADER ── */}
      <div className="dashboard-header">
        <div>
          <h1>💻 Freelancer Dashboard</h1>
          <p>Welcome back! Browse projects and manage your work here.</p>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="stats-grid">
        <div className="stat-card">
          <span>💼</span>
          <div>
            <h3>{loadingBrowse ? '...' : allProjects.length}</h3>
            <p>Available Projects</p>
          </div>
        </div>
        <div className="stat-card">
          <span>⚙️</span>
          <div>
            <h3>{myProjects.filter(p => p.status === 'In Progress').length}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="stat-card">
          <span>✅</span>
          <div>
            <h3>{myProjects.filter(p => p.status === 'Completed').length}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <span>💰</span>
          <div>
            <h3>{totalEarned.toFixed(3)} ETH</h3>
            <p>Total Earned</p>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="tabs">
        <button
          className={activeTab === 'browse' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('browse')}
        >
          🔍 Browse Projects
        </button>
        <button
          className={activeTab === 'my' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('my')}
        >
          📁 My Projects
        </button>
      </div>

      {/* ── BROWSE TAB ── */}
      {activeTab === 'browse' && (
        <div className="projects-grid">
          {loadingBrowse ? (
            <p style={{ padding: '2rem', color: '#888' }}>Loading projects...</p>
          ) : allProjects.length === 0 ? (
            <p style={{ padding: '2rem', color: '#888' }}>No open projects available right now.</p>
          ) : (
            allProjects.map((project) => (
              <div className="project-card" key={project._id}>
                <div className="project-card-header">
                  <h3>{project.title}</h3>
                  <span className="budget-badge">{project.budget} ETH</span>
                </div>
                <p className="project-desc">{project.description}</p>
                <div className="project-meta">
                  <span>👔 {project.client?.name || 'Client'}</span>
                  <span>📅 {new Date(project.deadline).toLocaleDateString()}</span>
                </div>
                {project.skills && project.skills.length > 0 && (
                  <div className="skills-list">
                    {project.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                )}
                <div className="project-card-actions">
                  <button
                    className="btn-view-card"
                    onClick={() => navigate(`/project/${project._id}`)}
                  >
                    View Details
                  </button>
                  <button
                    className={`btn-apply ${appliedIds.includes(project._id) ? 'applied' : ''}`}
                    onClick={() => {
                      if (!appliedIds.includes(project._id)) openApplyModal(project);
                    }}
                    disabled={appliedIds.includes(project._id)}
                  >
                    {appliedIds.includes(project._id) ? '✅ Applied' : 'Apply Now'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── MY PROJECTS TAB ── */}
      {activeTab === 'my' && (
        <div className="table-wrapper">
          <table className="projects-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Project Title</th>
                <th>Client</th>
                <th>Budget</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Submission</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingMy ? (
                <tr>
                  <td colSpan="8">Loading...</td>
                </tr>
              ) : myProjects.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                    You haven't been assigned to any projects yet.
                  </td>
                </tr>
              ) : (
                myProjects.map((project, index) => (
                  <tr key={project._id}>
                    <td>{index + 1}</td>
                    <td>{project.title}</td>
                    <td>{project.client?.name || '—'}</td>
                    <td>{project.budget} ETH</td>
                    <td>{new Date(project.deadline).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td>
                      {project.submissionStatus === 'Submitted' && (
                        <span className="status-badge status-progress">📩 Pending Review</span>
                      )}
                      {project.submissionStatus === 'Accepted' && (
                        <span className="status-badge status-completed">✅ Accepted</span>
                      )}
                      {(!project.submissionStatus || project.submissionStatus === 'None') && (
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
                      {project.status === 'In Progress' &&
                        project.submissionStatus !== 'Submitted' &&
                        project.submissionStatus !== 'Accepted' && (
                        <button
                          className="btn-submit"
                          onClick={() => openSubmitModal(project)}
                        >
                          Submit Work
                        </button>
                      )}
                      {project.status === 'In Progress' && (
                        <button
                          className="btn-dispute"
                          onClick={() => navigate(`/dispute?projectId=${project._id}`)}
                        >
                          Dispute
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── APPLY MODAL ── */}
      {showApplyModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Apply for Project</h2>
              <button className="close-btn" onClick={() => setShowApplyModal(false)}>✕</button>
            </div>
            <p className="modal-project-title">📋 {applyTarget?.title}</p>
            <form onSubmit={handleApply} className="modal-form">
              <div className="form-group">
                <label>Your Proposal</label>
                <textarea
                  placeholder="Describe your skills and why you're the best fit for this project..."
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                  rows="5"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowApplyModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-post">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SUBMIT WORK MODAL ── */}
      {showSubmitModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Submit Work</h2>
              <button className="close-btn" onClick={() => setShowSubmitModal(false)}>✕</button>
            </div>
            <p className="modal-project-title">📋 {selectedProject?.title}</p>
            <form onSubmit={handleSubmitWork} className="modal-form">
              <div className="form-group">
                <label>GitHub / Live Link</label>
                <input
                  type="text"
                  name="link"
                  placeholder="https://github.com/your-repo"
                  value={submitData.link}
                  onChange={(e) => setSubmitData({ ...submitData, link: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Work Description</label>
                <textarea
                  name="description"
                  placeholder="Describe what you have completed..."
                  value={submitData.description}
                  onChange={(e) => setSubmitData({ ...submitData, description: e.target.value })}
                  rows="4"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowSubmitModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-post">
                  Submit Work
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default FreelancerDashboard;