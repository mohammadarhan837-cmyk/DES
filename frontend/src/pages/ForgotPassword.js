import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../utils/axiosInstance';
import '../styles/Login.css';
import Toast from '../components/Toast';
import useToast from '../components/useToast';

function ForgotPassword() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/auth/forgot-password", { email });
      showToast("Reset code sent! Redirecting...", "success");
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 1500);
    } catch (err) {
      showToast(err.response?.data?.message || "Request failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      
      <div className="auth-box" style={{ maxWidth: '400px', margin: 'auto' }}>
        <h2>🔑 Forgot Password</h2>
        <p className="auth-subtitle">Enter your email and we'll send you a recovery code.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Sending Code...' : 'Send Recovery Code'}
          </button>
        </form>

        <p className="auth-switch">
          Remembered? <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
