import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName');

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">🔐 EscrowChain</Link>
      </div>

      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>

      <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        <li>
          <Link to="/"
            className={isActive('/') ? 'nav-active' : ''}
            onClick={() => setMenuOpen(false)}>
            Home
          </Link>
        </li>

        {/* ── LOGGED IN ── */}
        {isLoggedIn && (
          <>
            {userRole === 'client' && (
              <li>
                <Link to="/client-dashboard"
                  className={isActive('/client-dashboard') ? 'nav-active' : ''}
                  onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
              </li>
            )}
            {userRole === 'freelancer' && (
              <li>
                <Link to="/freelancer-dashboard"
                  className={isActive('/freelancer-dashboard') ? 'nav-active' : ''}
                  onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
              </li>
            )}

            {/* Browse Projects — only for freelancer */}
            {userRole === 'freelancer' && (
              <li>
                <Link to="/browse-projects"
                  className={isActive('/browse-projects') ? 'nav-active' : ''}
                  onClick={() => setMenuOpen(false)}>
                  Browse
                </Link>
              </li>
            )}

            <li>
              <Link to="/project/1"
                className={isActive('/project/1') ? 'nav-active' : ''}
                onClick={() => setMenuOpen(false)}>
                Projects
              </Link>
            </li>
            <li>
              <Link to="/escrow-payment"
                className={isActive('/escrow-payment') ? 'nav-active' : ''}
                onClick={() => setMenuOpen(false)}>
                Escrow
              </Link>
            </li>
            <li>
              <Link to="/dispute"
                className={isActive('/dispute') ? 'nav-active' : ''}
                onClick={() => setMenuOpen(false)}>
                Dispute
              </Link>
            </li>

            {/* ── NOTIFICATION BELL ── */}
            <li>
              <Link to="/notifications"
                className={`nav-bell
                  ${isActive('/notifications') ? 'nav-active' : ''}`}
                onClick={() => setMenuOpen(false)}>
                🔔
                <span className="bell-badge">3</span>
              </Link>
            </li>

            <li>
              <Link to="/profile"
                className={isActive('/profile') ? 'nav-active' : ''}
                onClick={() => setMenuOpen(false)}>
                👤 {userName ? userName.split(' ')[0] : 'Profile'}
              </Link>
            </li>
            <li>
              <button className="nav-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </>
        )}

        {/* ── NOT LOGGED IN ── */}
        {!isLoggedIn && (
          <>
            <li>
              <Link to="/login"
                className="nav-login-btn"
                onClick={() => setMenuOpen(false)}>
                Login
              </Link>
            </li>
            <li>
              <Link to="/register"
                className="nav-register-btn"
                onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;