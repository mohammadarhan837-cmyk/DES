import React, { useState } from 'react';
import '../styles/Footer.css';

function Footer() {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <h3>🔐 EscrowChain</h3>
          <p>Decentralized security for global collaboration.</p>
        </div>
        <div className="footer-right">
          <button className="footer-link-btn" onClick={() => setShowTerms(true)}>Terms & Conditions</button>
          <a href="/privacy" className="footer-link">Privacy Policy</a>
          <span className="footer-copy">© 2026 EscrowChain. All rights reserved.</span>
        </div>
      </div>

      {showTerms && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Terms of Service</h2>
              <button className="close-btn" onClick={() => setShowTerms(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto', padding: '1.5rem', color: '#ccc', lineHeight: '1.6' }}>
              <h4>1. Decentralized Nature</h4>
              <p>EscrowChain is a decentralized platform. Transactions are executed by immutable smart contracts on the Ethereum blockchain. We do not have control over funds once locked in a contract.</p>
              
              <h4>2. Dispute Resolution</h4>
              <p>In case of conflict, the platform provides a built-in dispute mechanism. By using this service, you agree to abide by the final decision of the resolution protocol.</p>
              
              <h4>3. Wallet Responsibility</h4>
              <p>Users are solely responsible for their private keys and MetaMask security. EscrowChain cannot recover lost funds due to compromised wallets or lost seed phrases.</p>
              
              <h4>4. Milestone & Penalty System</h4>
              <p>Clients have the right to terminate projects and reclaim funds if the automated milestone system detects zero progress at critical deadlines (1/3 remaining time).</p>
            </div>
            <div className="modal-actions" style={{ padding: '1rem' }}>
              <button onClick={() => setShowTerms(false)} style={{ width: '100%' }}>I Understand</button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}

export default Footer;