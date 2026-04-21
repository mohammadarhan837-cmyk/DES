import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';
import '../styles/PremiumButtons.css';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import useToast from '../components/useToast';
import axios from '../utils/axiosInstance';

function Profile() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [pageLoading, setPageLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [profile, setProfile] = useState({
    name: localStorage.getItem('userName') || '',
    email: '',
    role: localStorage.getItem('userRole') || 'freelancer',
    wallet: localStorage.getItem('walletAddress') || '',
    skills: '',
    bio: '',
    phoneNumber: ''
  });

  const [userProjects, setUserProjects] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalVolume: 0,
    rating: 5.0
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // 1. Fetch Projects
        const endpoint = profile.role === 'client' ? '/projects/my-projects' : '/projects/my-work';
        const res = await axios.get(endpoint);
        const projects = res.data || [];
        setUserProjects(projects);

        // 2. Calculate Stats
        const totalVolume = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
        setStats({
          totalProjects: projects.length,
          totalVolume: totalVolume.toFixed(3),
          rating: 5.0 // Placeholder for now or fetch if available
        });

        // 3. Fetch User Info (to get bio, skills, phone)
        const userRes = await axios.get('/protected'); 
        if (userRes.data?.user) {
          const u = userRes.data.user;
          setProfile(prev => ({
            ...prev,
            name: u.name,
            email: u.email,
            skills: u.skills?.join(', ') || '',
            bio: u.bio || 'Active EscrowChain member.',
            phoneNumber: u.phoneNumber || ''
          }));
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setPageLoading(false);
      }
    };

    fetchProfileData();
  }, [profile.role]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setPageLoading(true);
    try {
      // In a real app, you'd have a /users/profile update endpoint
      // For now, let's assume we can update via a general update endpoint if it exists
      // await axios.put('/users/profile', profile);
      
      localStorage.setItem('userName', profile.name);
      showToast('Profile updated successfully! ✅', 'success');
      setIsEditing(false);
    } catch (err) {
      showToast('Failed to update profile.', 'error');
    } finally {
      setPageLoading(false);
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

  return (
    <div className="profile-page">
      {pageLoading && <Spinner message="Loading real profile data..." />}
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
            {profile.name.charAt(0).toUpperCase() || '?'}
          </div>
          <h2>{profile.name}</h2>
          <span className="profile-role">
            {profile.role === 'client' ? '👔 Client' : '💻 Freelancer'}
          </span>
          <p className="profile-bio">{profile.bio}</p>

          <div className="profile-wallet">
            <span>🦊 Locked Sepolia Wallet</span>
            <p>{profile.wallet ? `${profile.wallet.slice(0, 10)}...${profile.wallet.slice(-4)}` : 'No wallet connected'}</p>
          </div>

          <div className="profile-stats">
            <div className="profile-stat">
              <h3>{stats.totalProjects}</h3>
              <p>Projects</p>
            </div>
            <div className="profile-stat">
              <h3>{stats.totalVolume} ETH</h3>
              <p>{profile.role === 'client' ? 'Locked' : 'Earned'}</p>
            </div>
            <div className="profile-stat">
              <h3>{stats.rating} ⭐</h3>
              <p>Rating</p>
            </div>
          </div>

          <button
            className="btn-premium-outline"
            style={{ width: '100%', marginTop: '1.5rem' }}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? '✕ Cancel' : '✏️ Edit Profile'}
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
                    <label>Email (Read Only)</label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      disabled
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number (Shared after handshake)</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      placeholder="+1 234 567 890"
                      value={profile.phoneNumber}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Skills (comma separated)</label>
                    <input
                      type="text"
                      name="skills"
                      placeholder="e.g. React, Solidity, UX"
                      value={profile.skills}
                      onChange={handleChange}
                    />
                  </div>
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
                <button className="btn-premium" style={{ width: '100%' }} onClick={handleSave}>
                  💾 Save Changes
                </button>
              </div>
            </div>
          )}

          {/* ── SKILLS ── */}
          <div className="profile-section">
            <h3>🛠️ Expertise</h3>
            <div className="skills-list">
              {profile.skills ? profile.skills.split(',').map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill.trim()}
                </span>
              )) : <p style={{ color: '#666' }}>No skills listed.</p>}
            </div>
          </div>

          {/* ── PROJECT HISTORY ── */}
          <div className="profile-section">
            <h3>📋 Transaction & Project History</h3>
            <div className="table-wrapper">
              <table className="profile-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Network</th>
                    <th>Value</th>
                    <th>Status</th>
                    <th>Link</th>
                  </tr>
                </thead>
                <tbody>
                  {userProjects.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No project history found.</td></tr>
                  ) : userProjects.map((p) => (
                    <tr key={p._id}>
                      <td><strong>{p.title}</strong></td>
                      <td>Sepolia</td>
                      <td>{p.budget} ETH</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn-view" onClick={() => navigate(`/project/${p._id}`)}>View</button>
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