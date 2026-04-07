import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ClientDashboard.css';
import Toast from '../components/Toast';
import useToast from '../components/useToast';

const dummyProjects = [
  {
    id: 1,
    title: 'E-commerce Website',
    freelancer: 'Ali Hassan',
    budget: '0.5 ETH',
    deadline: '2024-05-15',
    status: 'In Progress'
  },
  {
    id: 2,
    title: 'Mobile App UI Design',
    freelancer: 'Sara Khan',
    budget: '0.3 ETH',
    deadline: '2024-05-20',
    status: 'Completed'
  },
  {
    id: 3,
    title: 'Smart Contract Audit',
    freelancer: 'Not Assigned',
    budget: '0.8 ETH',
    deadline: '2024-06-01',
    status: 'Open'
  },
  {
    id: 4,
    title: 'Backend API Development',
    freelancer: 'Rahul Dev',
    budget: '0.4 ETH',
    deadline: '2024-05-30',
    status: 'Disputed'
  }
];

function ClientDashboard() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: ''
  });

  const handleChange = (e) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  const handlePostProject = (e) => {
    e.preventDefault();
    setShowModal(false);
    setNewProject({ title: '', description: '', budget: '', deadline: '' });
    showToast('Project posted successfully! 🎉', 'success');
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

  return (
    <div className="dashboard">

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      {/* ── HEADER ── */}
      <div className="dashboard-header">
        <div>
          <h1>👔 Client Dashboard</h1>
          <p>Welcome back! Manage your projects and payments here.</p>
        </div>
        <button className="post-btn" onClick={() => setShowModal(true)}>
          + Post New Project
        </button>
      </div>

      {/* ── STATS ── */}
      <div className="stats-grid">
        <div className="stat-card">
          <span>📋</span>
          <div>
            <h3>4</h3>
            <p>Total Projects</p>
          </div>
        </div>
        <div className="stat-card">
          <span>🔒</span>
          <div>
            <h3>1.3 ETH</h3>
            <p>Funds in Escrow</p>
          </div>
        </div>
        <div className="stat-card">
          <span>✅</span>
          <div>
            <h3>1</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <span>⚠️</span>
          <div>
            <h3>1</h3>
            <p>Disputed</p>
          </div>
        </div>
      </div>

      {/* ── PROJECTS TABLE ── */}
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dummyProjects.map((project) => (
                <tr key={project.id}>
                  <td>{project.id}</td>
                  <td>{project.title}</td>
                  <td>{project.freelancer}</td>
                  <td>{project.budget}</td>
                  <td>{project.deadline}</td>
                  <td>
                    <span className={`status-badge
                      ${getStatusClass(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="action-btns">
                    <button
                      className="btn-view"
                      onClick={() => navigate(`/project/${project.id}`)}
                    >
                      View
                    </button>
                    {project.status === 'In Progress' && (
                      <button
                        className="btn-release"
                        onClick={() => navigate('/escrow-payment')}
                      >
                        Release
                      </button>
                    )}
                    {project.status === 'In Progress' && (
                      <button
                        className="btn-dispute"
                        onClick={() => navigate('/dispute')}
                      >
                        Dispute
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
              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handlePostProject} className="modal-form">
              <div className="form-group">
                <label>Project Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Build an E-commerce Website"
                  value={newProject.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Project Description</label>
                <textarea
                  name="description"
                  placeholder="Describe your project requirements..."
                  value={newProject.description}
                  onChange={handleChange}
                  rows="4"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Budget (ETH)</label>
                  <input
                    type="text"
                    name="budget"
                    placeholder="e.g. 0.5"
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
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-post">
                  Post Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default ClientDashboard;