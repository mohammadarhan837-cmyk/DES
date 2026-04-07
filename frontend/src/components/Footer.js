import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

function Footer() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const userRole = localStorage.getItem('userRole');

  return (
    <footer className="footer">

      <div className="footer-top">

        {/* ── BRAND ── */}
        <div className="footer-brand">
          <h2>🔐 EscrowChain</h2>
          <p>
            A secure, transparent and decentralized escrow
            system built on blockchain for freelancers and clients.
          </p>
          <div className="footer-socials">
            <a href="#" className="social-btn">🐦 Twitter</a>
            <a href="#" className="social-btn">💼 LinkedIn</a>
            <a href="#" className="social-btn">🐙 GitHub</a>
          </div>
        </div>

        {/* ── QUICK LINKS ── */}
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">🏠 Home</Link></li>
            {!isLoggedIn && (
              <>
                <li><Link to="/login">🔑 Login</Link></li>
                <li><Link to="/register">📝 Register</Link></li>
              </>
            )}
            {isLoggedIn && userRole === 'client' && (
              <li>
                <Link to="/client-dashboard">📊 Dashboard</Link>
              </li>
            )}
            {isLoggedIn && userRole === 'freelancer' && (
              <li>
                <Link to="/freelancer-dashboard">📊 Dashboard</Link>
              </li>
            )}
            {isLoggedIn && (
              <>
                <li><Link to="/project/1">📋 Projects</Link></li>
                <li><Link to="/profile">👤 Profile</Link></li>
              </>
            )}
          </ul>
        </div>

        {/* ── FEATURES ── */}
        <div className="footer-col">
          <h4>Features</h4>
          <ul>
            <li><Link to="/escrow-payment">🔒 Escrow Payment</Link></li>
            <li><Link to="/dispute">⚠️ Dispute Resolution</Link></li>
            <li><Link to="/notifications">🔔 Notifications</Link></li>
            <li><Link to="/profile">⭐ Reviews & Ratings</Link></li>
          </ul>
        </div>

        {/* ── CONTACT ── */}
        <div className="footer-col">
          <h4>Contact Us</h4>
          <ul>
            <li>📧 support@escrowchain.com</li>
            <li>🌐 www.escrowchain.com</li>
            <li>📍 Mumbai, India</li>
            <li>📞 +91 98765 43210</li>
          </ul>
        </div>

      </div>

      {/* ── DIVIDER ── */}
      <div className="footer-divider"></div>

      {/* ── BOTTOM ── */}
      <div className="footer-bottom">
        <p>© 2024 EscrowChain. All rights reserved.</p>
        <div className="footer-bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookie Policy</a>
        </div>
      </div>

    </footer>
  );
}

export default Footer;