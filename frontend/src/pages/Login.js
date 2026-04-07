import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import Toast from '../components/Toast';
import useToast from '../components/useToast';

function Login() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'client'
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', formData.role);
      localStorage.setItem('userName', 'Mohammad Tousif');

      showToast('Login successful! Redirecting...', 'success');

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
        <p>Secure blockchain-powered escrow for freelancers and clients.</p>
        <ul>
          <li>✅ No middleman</li>
          <li>✅ Smart contract protection</li>
          <li>✅ Transparent transactions</li>
          <li>✅ Fair dispute resolution</li>
        </ul>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <h2>Welcome Back 👋</h2>
          <p className="auth-subtitle">Login to your account</p>

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

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-options">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? '⏳ Logging in...' : 'Login'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>

    </div>
  );
}

export default Login;