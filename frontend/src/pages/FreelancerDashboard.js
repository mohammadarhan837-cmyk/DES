import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FreelancerDashboard.css';
import Toast from '../components/Toast';
import useToast from '../components/useToast';

const availableProjects = [
  {
    id: 1,
    title: 'Build a Portfolio Website',
    client: 'Ahmed Raza',
    budget: '0.3 ETH',
    deadline: '2024-06-10',
    skills: ['React', 'CSS', 'HTML'],
    description: 'Need a modern portfolio website with animations and responsive design.'
  },
  {
    id: 2,
    title: 'Smart Contract Development',
    client: 'Sara Ali',
    budget: '0.7 ETH',
    deadline: '2024-06-20',
    skills: ['Solidity', 'Hardhat', 'Ethereum'],
    description: 'Develop and deploy an ERC-20 token smart contract on Polygon testnet.'
  },
  {
    id: 3,
    title: 'REST API Development',
    client: 'John Doe',
    budget: '0.4 ETH',
    deadline: '2024-07-01',
    skills: ['Node.js', 'Express', 'MongoDB'],
    description: 'Build a complete REST API with authentication and CRUD operations.'
  }
];

const myProjects = [
  {
    id: 1,
    title: 'E-commerce Website',
    client: 'Ali Hassan',
    budget: '0.5 ETH',
    deadline: '2024-05-15',
    status: 'In Progress'
  },
  {
    id: 2,
    title: 'Mobile App UI Design',
    client: 'Sara Khan',
    budget: '0.3 ETH',
    deadline: '2024-05-20',
    status: 'Completed'
  }
];

function FreelancerDashboard() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [activeTab, setActiveTab] = useState('browse');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [submitData, setSubmitData] = useState({
    link: '',
    description: ''
  });

  const handleSubmitChange = (e) => {
    setSubmitData({ ...submitData, [e.target.name]: e.target.value });
  };

  const handleSubmitWork = (e) => {
    e.preventDefault();
    setShowSubmitModal(false);
    setSubmitData({ link: '', description: '' });
    showToast('Work submitted successfully! 🎉', 'success');
  };

  const handleApply = (project) => {
    showToast(`Applied to "${project.title}" successfully!`, 'success');
  };

  const openSubmitModal = (project) => {
    setSelectedProject(project);
    setShowSubmitModal(true);
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
          <h1>💻 Freelancer Dashboard</h1>
          <p>Welcome back! Browse projects and manage your work here.</p>
        </div>
        <div className="wallet-info">
          <span>🦊 MetaMask</span>
          <p>0x1a2b...3c4d</p>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="stats-grid">
        <div className="stat-card">
          <span>💼</span>
          <div>
            <h3>3</h3>
            <p>Available Projects</p>
          </div>
        </div>
        <div className="stat-card">
          <span>⚙️</span>
          <div>
            <h3>1</h3>
            <p>In Progress</p>
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
          <span>💰</span>
          <div>
            <h3>0.3 ETH</h3>
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
          {availableProjects.map((project) => (
            <div className="project-card" key={project.id}>
              <div className="project-card-header">
                <h3>{project.title}</h3>
                <span className="budget-badge">{project.budget}</span>
              </div>
              <p className="project-desc">{project.description}</p>
              <div className="project-meta">
                <span>👤 {project.client}</span>
                <span>📅 {project.deadline}</span>
              </div>
              <div className="skills-list">
                {project.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
              <div className="project-card-actions">
                <button
                  className="btn-view-card"
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  View Details
                </button>
                <button
                  className="btn-apply"
                  onClick={() => handleApply(project)}
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))}
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {myProjects.map((project) => (
                <tr key={project.id}>
                  <td>{project.id}</td>
                  <td>{project.title}</td>
                  <td>{project.client}</td>
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
                        className="btn-submit"
                        onClick={() => openSubmitModal(project)}
                      >
                        Submit Work
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── SUBMIT WORK MODAL ── */}
      {showSubmitModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Submit Work</h2>
              <button
                className="close-btn"
                onClick={() => setShowSubmitModal(false)}
              >
                ✕
              </button>
            </div>
            <p className="modal-project-title">
              📋 {selectedProject?.title}
            </p>
            <form onSubmit={handleSubmitWork} className="modal-form">
              <div className="form-group">
                <label>GitHub / Live Link</label>
                <input
                  type="text"
                  name="link"
                  placeholder="https://github.com/your-repo"
                  value={submitData.link}
                  onChange={handleSubmitChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Work Description</label>
                <textarea
                  name="description"
                  placeholder="Describe what you have completed..."
                  value={submitData.description}
                  onChange={handleSubmitChange}
                  rows="4"
                  required
                />
              </div>
              <div className="form-group">
                <label>Upload File (Optional)</label>
                <input type="file" />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowSubmitModal(false)}
                >
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