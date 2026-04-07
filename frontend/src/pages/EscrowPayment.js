import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/EscrowPayment.css';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import useToast from '../components/useToast';

const transactions = [
  {
    id: 1,
    type: 'Deposit',
    amount: '0.5 ETH',
    from: '0x1a2b...3c4d',
    to: 'Smart Contract',
    date: '2024-04-10',
    status: 'Confirmed'
  },
  {
    id: 2,
    type: 'Release',
    amount: '0.0 ETH',
    from: 'Smart Contract',
    to: '0x5e6f...7g8h',
    date: '—',
    status: 'Pending'
  }
];

function EscrowPayment() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [pageLoading, setPageLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [action, setAction] = useState('');

  const handleAction = (type) => {
    setAction(type);
    setShowConfirm(true);
  };

  const confirmAction = () => {
    setShowConfirm(false);
    setPageLoading(true);
    setTimeout(() => {
      setPageLoading(false);
      if (action === 'Release Payment') {
        showToast('Payment released successfully! 🎉', 'success');
      } else if (action === 'Refund') {
        showToast('Refund request submitted!', 'info');
      }
    }, 1500);
  };

  return (
    <div className="escrow-page">
      {pageLoading && <Spinner message="Processing transaction..." />}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1>🔒 Escrow Payment</h1>
      <p className="page-subtitle">
        Manage locked funds for project:{' '}
        <strong>E-commerce Website</strong>
      </p>

      {/* ── ESCROW CARDS ── */}
      <div className="escrow-cards">
        <div className="escrow-info-card locked">
          <span>🔒</span>
          <div>
            <p>Total Locked</p>
            <h2>0.5 ETH</h2>
          </div>
        </div>
        <div className="escrow-info-card released">
          <span>✅</span>
          <div>
            <p>Released</p>
            <h2>0.0 ETH</h2>
          </div>
        </div>
        <div className="escrow-info-card remaining">
          <span>⏳</span>
          <div>
            <p>Remaining</p>
            <h2>0.5 ETH</h2>
          </div>
        </div>
        <div className="escrow-info-card contract">
          <span>📄</span>
          <div>
            <p>Contract Address</p>
            <h2 className="contract-address">0xAb3...9Kl</h2>
          </div>
        </div>
      </div>

      {/* ── CONTRACT BOX ── */}
      <div className="contract-box">
        <div className="contract-header">
          <h3>🔗 Smart Contract Details</h3>
          <span className="contract-status">Active</span>
        </div>
        <div className="contract-details">
          <div className="contract-row">
            <span>Network</span>
            <strong>Polygon Testnet</strong>
          </div>
          <div className="contract-row">
            <span>Contract Address</span>
            <strong>0xAb34...9Kl2</strong>
          </div>
          <div className="contract-row">
            <span>Client Wallet</span>
            <strong>0x1a2b...3c4d</strong>
          </div>
          <div className="contract-row">
            <span>Freelancer Wallet</span>
            <strong>0x5e6f...7g8h</strong>
          </div>
          <div className="contract-row">
            <span>Created On</span>
            <strong>2024-04-10</strong>
          </div>
        </div>
      </div>

      {/* ── ACTION BUTTONS ── */}
      <div className="escrow-actions">
        <button
          className="btn-release-payment"
          onClick={() => handleAction('Release Payment')}
        >
          ✅ Release Payment to Freelancer
        </button>
        <button
          className="btn-refund"
          onClick={() => handleAction('Refund')}
        >
          🔄 Request Refund
        </button>
        <button
          className="btn-raise-dispute"
          onClick={() => navigate('/dispute')}
        >
          ⚠️ Raise Dispute
        </button>
      </div>

      {/* ── TRANSACTION HISTORY ── */}
      <div className="transaction-section">
        <h3>📊 Transaction History</h3>
        <div className="table-wrapper">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Amount</th>
                <th>From</th>
                <th>To</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.id}</td>
                  <td>{tx.type}</td>
                  <td><strong>{tx.amount}</strong></td>
                  <td>{tx.from}</td>
                  <td>{tx.to}</td>
                  <td>{tx.date}</td>
                  <td>
                    <span className={`tx-badge ${tx.status === 'Confirmed'
                      ? 'tx-confirmed' : 'tx-pending'}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CONFIRM MODAL ── */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirm Action</h2>
            <p>
              Are you sure you want to <strong>{action}</strong>?
              This action will interact with the blockchain smart contract.
            </p>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button className="btn-confirm" onClick={confirmAction}>
                Yes, Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default EscrowPayment;