import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import '../styles/Login.css';
import Toast from '../components/Toast';
import useToast from '../components/useToast';

function LinkWallet() {
  const navigate = useNavigate();
  const { connectWallet, connecting } = useWallet();
  const { toast, showToast, hideToast } = useToast();
  const [error, setError] = useState('');

  const userName = localStorage.getItem('userName');
  const userRole = localStorage.getItem('userRole');

  const handleLink = async () => {
    setError('');
    try {
      const result = await connectWallet();
      if (result) {
        showToast("Wallet linked successfully! Redirecting to dashboard...", "success");
        setTimeout(() => {
          navigate(userRole === 'client' ? '/client-dashboard' : '/freelancer-dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.message || "Failed to link wallet. Please try again.");
      showToast(err.message || "Linking failed", "error");
    }
  };


  return (
    <div className="auth-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      
      <div className="auth-box" style={{ maxWidth: '500px', margin: 'auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔗 Final Step: Link Wallet</h2>
        <p className="auth-subtitle" style={{ marginBottom: '2rem' }}>
          Welcome, <strong>{userName}</strong>! To ensure secure payments and prevent identity disputes, 
          you must link your Sepolia wallet to your account.
        </p>

        <div style={{ background: 'rgba(0, 212, 255, 0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(0, 212, 255, 0.2)', marginBottom: '2rem' }}>
          <ul style={{ textAlign: 'left', fontSize: '0.9rem', color: '#ccc', listArrStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '8px' }}>✅ This locks your profile to your MetaMask account.</li>
            <li style={{ marginBottom: '8px' }}>✅ Required for deploying and releasing escrow funds.</li>
            <li style={{ marginBottom: '8px' }}>✅ Prevents others from claiming your projects.</li>
          </ul>
        </div>

        {error && <p style={{ color: '#ff6b6b', marginBottom: '1rem' }}>❌ {error}</p>}

        <button 
          onClick={handleLink} 
          className="submit-btn" 
          disabled={connecting}
          style={{ padding: '1.2rem', fontSize: '1.1rem' }}
        >
          {connecting ? '⏳ Linking...' : '🦊 Connect & Lock Sepolia Wallet'}
        </button>

        <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#888' }}>
          Make sure you have selected the correct account in MetaMask before clicking.
        </p>
      </div>
    </div>
  );
}

export default LinkWallet;
