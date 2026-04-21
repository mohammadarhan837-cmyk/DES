import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "../utils/axiosInstance";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/auth/login", {
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      console.log("LOGIN SUCCESS:", res.data);

      // ✅ Store user data in localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user._id);
      localStorage.setItem("userRole", res.data.user.role);
      localStorage.setItem("userName", res.data.user.name);
      localStorage.setItem("isLoggedIn", "true");

      showToast("Login successful! Redirecting...", "success");

      // Redirect based on role
      setTimeout(() => {
        if (res.data.user.role === "client") {
          navigate("/client-dashboard");
        } else {
          navigate("/freelancer-dashboard");
        }
      }, 1000);

    } catch (err) {
      console.log("LOGIN ERROR:", err.response?.data || err.message);

      showToast(
        err.response?.data?.message || "Login failed",
        "error"
      );

      // If unverified, redirect to OTP page
      if (err.response?.data?.unverified) {
        setTimeout(() => {
          navigate("/verify-otp", { state: { email: formData.email } });
        }, 1500);
      }

    } finally {
      setLoading(false);
    }
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
          <p className="auth-terms">
            By logging in, you agree to our <span className="terms-link">Terms & Conditions</span>
          </p>
        </div>
      </div>

    </div>
  );
}

export default Login;

