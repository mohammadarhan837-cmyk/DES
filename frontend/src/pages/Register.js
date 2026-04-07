import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Register.css';
import Toast from '../components/Toast';
import useToast from '../components/useToast';

function Register() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      showToast('Passwords do not match!', 'error');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters!');
      showToast('Password must be at least 6 characters!', 'error');
      return;
    }

    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', formData.role);
      localStorage.setItem('userName', formData.name);

      showToast('Account created successfully!', 'success');

      setTimeout(() => {
        if (formData.role === 'client') {
          navigate('/client-dashboard');
        } else {
          navigate('/freelancer-dashboard');
        }
      }, 1000);
    }, 1000);
  };

  return (
    <div className="auth-page">

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      <div className="auth-left">
        <h1>🔐 EscrowChain</h1>
        <p>
          Join thousands of freelancers and clients
          using secure blockchain escrow.
        </p>
        <div className="auth-left-cards">
          <div className="info-card">
            <span>👔</span>
            <div>
              <h4>For Clients</h4>
              <p>Post projects and lock payment securely in smart contracts.</p>
            </div>
          </div>
          <div className="info-card">
            <span>💻</span>
            <div>
              <h4>For Freelancers</h4>
              <p>Get paid fairly and on time. No more payment disputes.</p>
            </div>
          </div>
          <div className="info-card">
            <span>🔗</span>
            <div>
              <h4>Blockchain Powered</h4>
              <p>Every transaction is secure and transparent on-chain.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <h2>Create Account 🚀</h2>
          <p className="auth-subtitle">Register and start today</p>

          <div className="role-selector">
            <button
              type="button"
              className={formData.role === 'client' ? 'role-btn active' : 'role-btn'}
              onClick={() => setFormData({ ...formData, role: 'client' })}
            >
              👔 Client
            </button>
            <button
              type="button"
              className={formData.role === 'freelancer' ? 'role-btn active' : 'role-btn'}
              onClick={() => setFormData({ ...formData, role: 'freelancer' })}
            >
              💻 Freelancer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {error && <p className="error-msg">⚠️ {error}</p>}

            <div className="form-group terms">
              <label>
                <input type="checkbox" required />
                &nbsp; I agree to the <a href="#">Terms & Conditions</a>
              </label>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? '⏳ Creating Account...' : 'Create Account'}
            </button>

          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login">Login here</Link>
          </p>

        </div>
      </div>

    </div>
  );
}

export default Register;
