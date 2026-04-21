import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import { useWallet } from '../context/WalletContext';

function Navbar() {
  const [menuOpen, setMenuOpen]         = useState(false);
  const [roleModal, setRoleModal]       = useState(false);
  const [pendingAddress, setPendingAddress] = useState(null);
  const [selectedRole, setSelectedRole] = useState('freelancer');
  const [connectError, setConnectError] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const { account, balance, connecting, connectWallet, disconnectWallet } = useWallet();

  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const userRole   = localStorage.getItem('userRole');
  const userName   = localStorage.getItem('userName');

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    disconnectWallet();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/');
    setMenuOpen(false);
  };

  // ── Connect button in Navbar (for returning users) ──
  const handleConnectClick = async () => {
    setConnectError('');
    try {
      const result = await connectWallet();
      if (result?.isNewUser) {
        setPendingAddress(result.address);
        setRoleModal(true);
      } else {
        const role = localStorage.getItem('userRole');
        if (role === 'client') {
          navigate('/client-dashboard');
        } else if (role === 'freelancer') {
          navigate('/freelancer-dashboard');
        }
      }
    } catch (err) {
      setConnectError(err.message || 'Connection failed');
    }
  };

  const handleRoleSubmit = async () => {
    try {
      setConnectError('');
      const result = await connectWallet(selectedRole);
      setRoleModal(false);
      if (result?.user?.role === 'client' || selectedRole === 'client') {
        navigate('/client-dashboard');
      } else {
        navigate('/freelancer-dashboard');
      }
    } catch (err) {
      setConnectError(err.message || 'Registration failed');
    }
  };

  const truncate = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          <Link to="/">🔐 EscrowChain</Link>
        </div>

        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</div>

        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <li>
            <Link to="/" className={isActive('/') ? 'nav-active' : ''} onClick={() => setMenuOpen(false)}>
              Home
            </Link>
          </li>

          {/* ── LOGGED IN ── */}
          {isLoggedIn && (
            <>
              {userRole === 'client' && (
                <li>
                  <Link to="/client-dashboard" className={isActive('/client-dashboard') ? 'nav-active' : ''} onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                </li>
              )}
              {userRole === 'freelancer' && (
                <>
                  <li>
                    <Link to="/freelancer-dashboard" className={isActive('/freelancer-dashboard') ? 'nav-active' : ''} onClick={() => setMenuOpen(false)}>
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/browse-projects" className={isActive('/browse-projects') ? 'nav-active' : ''} onClick={() => setMenuOpen(false)}>
                      Browse
                    </Link>
                  </li>
                </>
              )}

              <li>
                <Link to="/dispute" className={isActive('/dispute') ? 'nav-active' : ''} onClick={() => setMenuOpen(false)}>
                  Dispute
                </Link>
              </li>

              {/* 🔔 Notification Bell */}
              <li>
                <Link to="/notifications" className={`nav-bell ${isActive('/notifications') ? 'nav-active' : ''}`} onClick={() => setMenuOpen(false)}>
                  🔔<span className="bell-badge">3</span>
                </Link>
              </li>

              <li>
                <Link to="/profile" className={isActive('/profile') ? 'nav-active' : ''} onClick={() => setMenuOpen(false)}>
                  👤 {userName ? userName.split(' ')[0] : 'Profile'}
                </Link>
              </li>

              {/* 🦊 Wallet Pill */}
              {account ? (
                <li>
                  <div className="wallet-pill">
                    <span className="wallet-dot" />
                    <span className="wallet-address">{truncate(account)}</span>
                    {balance && <span className="wallet-balance">{balance} ETH</span>}
                  </div>
                </li>
              ) : (
                <li>
                  <button
                    className="connect-wallet-btn"
                    onClick={handleConnectClick}
                    disabled={connecting}
                  >
                    {connecting ? '⏳ Connecting...' : '🦊 Connect Wallet'}
                  </button>
                </li>
              )}

              <li>
                <button className="nav-logout-btn" onClick={handleLogout}>Logout</button>
              </li>
            </>
          )}

          {/* ── NOT LOGGED IN ── */}
          {!isLoggedIn && (
            <>
              <li>
                <button
                  className="connect-wallet-btn"
                  onClick={handleConnectClick}
                  disabled={connecting}
                >
                  {connecting ? '⏳ Connecting...' : '🦊 Connect Wallet'}
                </button>
              </li>
              <li>
                <Link to="/login"    className="nav-login-btn"    onClick={() => setMenuOpen(false)}>Login</Link>
              </li>
              <li>
                <Link to="/register" className="nav-register-btn" onClick={() => setMenuOpen(false)}>Register</Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* ── ROLE PICKER MODAL (new wallet users) ── */}
      {roleModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h2>🦊 Welcome to EscrowChain</h2>
            </div>
            <div style={{ padding: '1rem 1.5rem' }}>
              <p style={{ color: '#aaa', marginBottom: '1rem' }}>
                Wallet: <code style={{ color: '#00d4ff' }}>{truncate(pendingAddress)}</code>
              </p>
              <p style={{ marginBottom: '1.5rem' }}>Select your role to complete registration:</p>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <button
                  onClick={() => setSelectedRole('client')}
                  style={{
                    flex: 1, padding: '1rem', borderRadius: '10px', cursor: 'pointer',
                    background: selectedRole === 'client' ? '#00d4ff' : 'transparent',
                    color:      selectedRole === 'client' ? '#1a1a2e' : '#fff',
                    border:     '2px solid #00d4ff', fontWeight: 700, fontSize: '1rem',
                    transition: 'all 0.2s'
                  }}
                >
                  👔 Client
                </button>
                <button
                  onClick={() => setSelectedRole('freelancer')}
                  style={{
                    flex: 1, padding: '1rem', borderRadius: '10px', cursor: 'pointer',
                    background: selectedRole === 'freelancer' ? '#00d4ff' : 'transparent',
                    color:      selectedRole === 'freelancer' ? '#1a1a2e' : '#fff',
                    border:     '2px solid #00d4ff', fontWeight: 700, fontSize: '1rem',
                    transition: 'all 0.2s'
                  }}
                >
                  💻 Freelancer
                </button>
              </div>

              {connectError && (
                <p style={{ color: '#ff6b6b', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  ❌ {connectError}
                </p>
              )}

              <div className="modal-actions">
                <button onClick={() => setRoleModal(false)}>Cancel</button>
                <button onClick={handleRoleSubmit} disabled={connecting}>
                  {connecting ? '⏳ Signing...' : '✅ Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;