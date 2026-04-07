import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProjectDetail.css';

const project = {
  id: 1,
  title: 'E-commerce Website',
  client: 'Ali Hassan',
  freelancer: 'Sara Khan',
  budget: '0.5 ETH',
  deadline: '2024-05-15',
  status: 'In Progress',
  description: `We need a fully functional e-commerce website with product listing,
    cart, checkout, and payment integration. The website should be mobile
    responsive and built using React.js for frontend and Node.js for backend.`,
  requirements: [
    'React.js frontend with responsive design',
    'Node.js + Express backend',
    'MongoDB database integration',
    'Payment gateway integration',
    'Admin panel for product management',
    'User authentication system'
  ],
  milestones: [
    { id: 1, title: 'UI Design & Wireframes', status: 'Completed', due: '2024-04-20' },
    { id: 2, title: 'Frontend Development', status: 'In Progress', due: '2024-05-01' },
    { id: 3, title: 'Backend Development', status: 'Pending', due: '2024-05-10' },
    { id: 4, title: 'Testing & Deployment', status: 'Pending', due: '2024-05-15' }
  ]
};

function ProjectDetail() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const getMilestoneClass = (status) => {
    switch (status) {
      case 'Completed':   return 'milestone-completed';
      case 'In Progress': return 'milestone-progress';
      case 'Pending':     return 'milestone-pending';
      default:            return '';
    }
  };

  return (
    <div className="detail-page">

      {/* ── TOP BACK BUTTON ── */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* ── PROJECT HEADER ── */}
      <div className="detail-header">
        <div className="detail-header-left">
          <h1>{project.title}</h1>
          <div className="detail-meta">
            <span>👔 Client: <strong>{project.client}</strong></span>
            <span>💻 Freelancer: <strong>{project.freelancer}</strong></span>
            <span>📅 Deadline: <strong>{project.deadline}</strong></span>
          </div>
        </div>
        <div className="detail-header-right">
          <div className="detail-budget">
            <p>Project Budget</p>
            <h2>{project.budget}</h2>
            <span className="status-badge status-progress">{project.status}</span>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
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

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          <div className="content-grid">

            <div className="content-card">
              <h3>📝 Project Description</h3>
              <p>{project.description}</p>
            </div>

            <div className="content-card">
              <h3>✅ Requirements</h3>
              <ul className="requirements-list">
                {project.requirements.map((req, index) => (
                  <li key={index}>
                    <span>✔</span> {req}
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="detail-actions">
            <button
              className="btn-escrow"
              onClick={() => navigate('/escrow-payment')}
            >
              🔒 View Escrow Payment
            </button>
            <button
              className="btn-dispute-action"
              onClick={() => navigate('/dispute')}
            >
              ⚠️ Raise Dispute
            </button>
          </div>
        </div>
      )}

      {/* ── MILESTONES TAB ── */}
      {activeTab === 'milestones' && (
        <div className="tab-content">
          <div className="milestones-list">
            {project.milestones.map((milestone, index) => (
              <div className="milestone-card" key={milestone.id}>
                <div className="milestone-number">{index + 1}</div>
                <div className="milestone-info">
                  <h3>{milestone.title}</h3>
                  <p>Due: {milestone.due}</p>
                </div>
                <span className={`milestone-badge ${getMilestoneClass(milestone.status)}`}>
                  {milestone.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ESCROW TAB ── */}
      {activeTab === 'escrow' && (
        <div className="tab-content">
          <div className="escrow-summary">
            <div className="escrow-card">
              <span>🔒</span>
              <h3>Locked in Escrow</h3>
              <h2>0.5 ETH</h2>
              <p>Funds are safely locked in smart contract</p>
            </div>
            <div className="escrow-card">
              <span>✅</span>
              <h3>Released</h3>
              <h2>0.0 ETH</h2>
              <p>No payments released yet</p>
            </div>
            <div className="escrow-card">
              <span>⏳</span>
              <h3>Remaining</h3>
              <h2>0.5 ETH</h2>
              <p>Pending project completion</p>
            </div>
          </div>
          <button
            className="btn-escrow"
            onClick={() => navigate('/escrow-payment')}
          >
            🔒 Go to Full Escrow Page
          </button>
        </div>
      )}

    </div>
  );
}

export default ProjectDetail;