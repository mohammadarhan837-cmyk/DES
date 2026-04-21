import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../utils/axiosInstance';
import '../styles/Login.css';
import Toast from '../components/Toast';
import useToast from '../components/useToast';

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast, showToast, hideToast } = useToast();
  
  const [formData, setFormData] = useState({ otp: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const email = location.state?.email;

  useEffect(() => {
    if (!email) navigate('/forgot-password');
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return showToast("Passwords do not match", "error");
    }

    setLoading(true);
    try {
      await axios.post("/auth/reset-password", { 
        email, 
        otp: formData.otp, 
        newPassword: formData.newPassword 
      });
      showToast("Password reset successful!", "success");
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      showToast(err.response?.data?.message || "Reset failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      
      <div className="auth-box" style={{ maxWidth: '400px', margin: 'auto' }}>
        <h2>🔄 Reset Password</h2>
        <p className="auth-subtitle">Set a new password for <strong>{email}</strong></p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>6-Digit Recovery Code</label>
            <input 
              type="text" 
              maxLength="6"
              placeholder="000000" 
              value={formData.otp} 
              onChange={e => setFormData({ ...formData, otp: e.target.value })} 
              required 
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={formData.newPassword} 
              onChange={e => setFormData({ ...formData, newPassword: e.target.value })} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={formData.confirmPassword} 
              onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} 
              required 
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Resetting...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
