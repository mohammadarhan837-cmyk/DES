import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../utils/axiosInstance';
import '../styles/Login.css'; // Reuse auth styles
import Toast from '../components/Toast';
import useToast from '../components/useToast';

function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast, showToast, hideToast } = useToast();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) return showToast("Please enter all 6 digits", "error");

    setLoading(true);
    try {
      const res = await axios.post("/auth/verify-otp", { email, otp: otpCode });
      
      // Store user data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user._id);
      localStorage.setItem("userRole", res.data.user.role);
      localStorage.setItem("userName", res.data.user.name);
      localStorage.setItem("isLoggedIn", "true");

      showToast("Email verified! Final step: Link your wallet.", "success");
      setTimeout(() => {
        navigate("/link-wallet");
      }, 1500);
    } catch (err) {
      showToast(err.response?.data?.message || "Verification failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      
      <div className="auth-box" style={{ maxWidth: '400px', margin: 'auto' }}>
        <h2>🔐 Verify Your Email</h2>
        <p className="auth-subtitle">We sent a 6-digit code to <strong>{email}</strong></p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '2rem 0' }}>
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                style={{
                  width: '45px', height: '55px', textAlign: 'center', fontSize: '1.5rem',
                  background: '#0f3460', border: '1px solid #2d3561', color: '#fff', borderRadius: '8px'
                }}
                value={data}
                onChange={e => handleChange(e.target, index)}
                onFocus={e => e.target.select()}
              />
            ))}
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        <p className="auth-switch" style={{ marginTop: '1.5rem' }}>
          Didn't receive code? <button style={{ background: 'none', border: 'none', color: '#00d4ff', cursor: 'pointer' }}>Resend Code</button>
        </p>
      </div>
    </div>
  );
}

export default VerifyOTP;
