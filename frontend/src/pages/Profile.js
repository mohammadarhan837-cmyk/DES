import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import useToast from '../components/useToast';

const userProjects = [
  {
    id: 1,
    title: 'E-commerce Website',
    role: 'Freelancer',
    budget: '0.5 ETH',
    status: 'In Progress'
  },
  {
    id: 2,
    title: 'Mobile App UI Design',
    role: 'Freelancer',
    budget: '0.3 ETH',
    status: 'Completed'
  },
  {
    id: 3,
    title: 'Smart Contract Audit',
    role: 'Client',
    budget: '0.8 ETH',
    status: 'Open'
  }
];

function Profile() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [pageLoading, setPageLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: localStorage.getItem('userName') || 'Mohammad Tousif',
    email: 'tousif@example.com',
    role: localStorage.getItem('userRole') || 'Freelancer',
    wallet: '0x1a2b3c4d5e6f7g8h',
    skills: 'React.js, Node.js, Solidity',
    bio: 'Full stack developer with experience in blockchain and Web3 development.'
  });

  useEffect(() => {
    setTimeout(() => {
      setPageLoading(false);
    }, 800);
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setPageLoading(true);
    setTimeout(() => {
      setPageLoading(false);
      setIsEditing(false);
      localStorage.setItem('userName', profile.name);
      showToast('Profile updated successfully! ✅', 'success');
    }, 1000);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'In Progress': return 'status-progress';
      case 'Completed':   return 'status-completed';
      case 'Open':        return 'status-open';
      default:            return '';
    }
  };

  return (
    <div className="profile-page">
      {pageLoading && <Spinner message="Loading profile..." />}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="profile-container">

        {/* ── LEFT PROFILE CARD ── */}
        <div className="profile-card">
          <div className="profile-avatar">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <h2>{profile.name}</h2>
          <span className="profile-role">
            {profile.role === 'client' ? '👔 Client' : '💻 Freelancer'}
          </span>
          <p className="profile-bio">{profile.bio}</p>

          <div className="profile-wallet">
            <span>🦊 Wallet Address</span>
            <p>{profile.wallet.slice(0, 10)}...{profile.wallet.slice(-4)}</p>
          </div>

          <div className="profile-stats">
            <div className="profile-stat">
              <h3>3</h3>
              <p>Projects</p>
            </div>
            <div className="profile-stat">
              <h3>0.3 ETH</h3>
              <p>Earned</p>
            </div>
            <div className="profile-stat">
              <h3>4.8 ⭐</h3>
              <p>Rating</p>
            </div>
          </div>

          <button
            className="edit-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? '✕ Cancel Editing' : '✏️ Edit Profile'}
          </button>
        </div>

        {/* ── RIGHT CONTENT ── */}
        <div className="profile-content">

          {/* ── EDIT FORM ── */}
          {isEditing && (
            <div className="edit-form-box">
              <h3>✏️ Edit Profile</h3>
              <div className="edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Skills (comma separated)</label>
                  <input
                    type="text"
                    name="skills"
                    value={profile.skills}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>
                <button className="save-btn" onClick={handleSave}>
                  💾 Save Changes
                </button>
              </div>
            </div>
          )}

          {/* ── SKILLS ── */}
          <div className="profile-section">
            <h3>🛠️ Skills</h3>
            <div className="skills-list">
              {profile.skills.split(',').map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* ── PROJECT HISTORY ── */}
          <div className="profile-section">
            <h3>📋 Project History</h3>
            <div className="table-wrapper">
              <table className="profile-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Project</th>
                    <th>Role</th>
                    <th>Budget</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userProjects.map((project) => (
                    <tr key={project.id}>
                      <td>{project.id}</td>
                      <td>{project.title}</td>
                      <td>
                        <span className="role-tag">{project.role}</span>
                      </td>
                      <td>{project.budget}</td>
                      <td>
                        <span className={`status-badge
                          ${getStatusClass(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Profile;