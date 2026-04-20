import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/EscrowPayment.css';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import useToast from '../components/useToast';
import axios from '../utils/axiosInstance';

function EscrowPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast, showToast, hideToast } = useToast();

  // Get projectId from query param: /escrow-payment?projectId=xxx
  const params = new URLSearchParams(location.search);
  const projectId = params.get('projectId');

  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [action, setAction] = useState('');

  // ── FETCH ESCROW DATA ──
  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    const fetchEscrow = async () => {
      try {
        const res = await axios.get(`/escrow/${projectId}`);
        setEscrow(res.data);
      } catch (err) {
        // Escrow record may not exist if the lockPayment step was skipped
        showToast(
          err.response?.data?.message || 'Escrow record not found. Payment may be tracked on-chain only.',
          'info'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchEscrow();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleAction = (type) => {
    setAction(type);
    setShowConfirm(true);
  };

  const confirmAction = async () => {
    setShowConfirm(false);
    setPageLoading(true);
    try {
      if (action === 'Release Payment') {
        const res = await axios.post('/blockchain/release-payment', { projectId });
        showToast(`Payment released! TX: ${res.data.txHash?.slice(0, 14)}...`, 'success');
        // Update local escrow state
        setEscrow(prev => prev ? { ...prev, status: 'Released', released: prev.totalLocked } : prev);
      } else if (action === 'Refund') {
        const res = await axios.post('/blockchain/refund', { projectId });
        showToast(`Refund processed! TX: ${res.data.txHash?.slice(0, 14)}...`, 'success');
        setEscrow(prev => prev ? { ...prev, status: 'Refunded' } : prev);
      }
    } catch (err) {
      showToast(err.response?.data?.error || err.response?.data?.message || 'Transaction failed', 'error');
    } finally {
      setPageLoading(false);
    }
  };

  const remaining = escrow ? (escrow.totalLocked - (escrow.released || 0)) : 0;

  if (!projectId) {
    return (
      <div className="escrow-page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <h2>⚠️ No Project Selected</h2>
        <p>Please navigate to a specific project's escrow from the dashboard.</p>
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      </div>
    );
  }

  return (
    <div className="escrow-page">
      {pageLoading && <Spinner message="Processing transaction on blockchain..." />}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <h1>🔒 Escrow Payment</h1>
      <p className="page-subtitle">
        Manage locked funds for project ID:{' '}
        <strong>{projectId}</strong>
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
          <p>Loading escrow data...</p>
        </div>
      ) : (
        <>
          {/* ── ESCROW CARDS ── */}
          <div className="escrow-cards">
            <div className="escrow-info-card locked">
              <span>🔒</span>
              <div>
                <p>Total Locked</p>
                <h2>{escrow ? `${escrow.totalLocked} ETH` : '—'}</h2>
              </div>
            </div>
            <div className="escrow-info-card released">
              <span>✅</span>
              <div>
                <p>Released</p>
                <h2>{escrow ? `${escrow.released || 0} ETH` : '—'}</h2>
              </div>
            </div>
            <div className="escrow-info-card remaining">
              <span>⏳</span>
              <div>
                <p>Remaining</p>
                <h2>{escrow ? `${remaining} ETH` : '—'}</h2>
              </div>
            </div>
            <div className="escrow-info-card contract">
              <span>📄</span>
              <div>
                <p>Status</p>
                <h2 style={{ fontSize: '1.1rem' }}>{escrow?.status || 'N/A'}</h2>
              </div>
            </div>
          </div>

          {/* ── CONTRACT BOX ── */}
          <div className="contract-box">
            <div className="contract-header">
              <h3>🔗 Smart Contract Details</h3>
              <span className="contract-status">{escrow?.status || 'Unknown'}</span>
            </div>
            <div className="contract-details">
              <div className="contract-row">
                <span>Network</span>
                <strong>{escrow?.network || 'Sepolia Testnet'}</strong>
              </div>
              <div className="contract-row">
                <span>Contract Address</span>
                <strong style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
                  {escrow?.contractAddress || '—'}
                </strong>
              </div>
              <div className="contract-row">
                <span>Client Wallet</span>
                <strong style={{ fontSize: '0.8rem' }}>
                  {escrow?.clientWallet
                    ? `${escrow.clientWallet.slice(0, 8)}...${escrow.clientWallet.slice(-6)}`
                    : '—'}
                </strong>
              </div>
              <div className="contract-row">
                <span>Freelancer Wallet</span>
                <strong style={{ fontSize: '0.8rem' }}>
                  {escrow?.freelancerWallet
                    ? `${escrow.freelancerWallet.slice(0, 8)}...${escrow.freelancerWallet.slice(-6)}`
                    : '—'}
                </strong>
              </div>
              <div className="contract-row">
                <span>Created On</span>
                <strong>
                  {escrow?.createdAt
                    ? new Date(escrow.createdAt).toLocaleDateString()
                    : '—'}
                </strong>
              </div>
            </div>
          </div>

          {/* ── ACTION BUTTONS ── */}
          {escrow?.status === 'Active' && (
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
                onClick={() => navigate(`/dispute?projectId=${projectId}`)}
              >
                ⚠️ Raise Dispute
              </button>
            </div>
          )}

          {escrow?.status === 'Released' && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#00b894' }}>
              <h3>✅ Payment has been released to the freelancer.</h3>
            </div>
          )}

          {escrow?.status === 'Refunded' && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#fdcb6e' }}>
              <h3>🔄 Payment has been refunded to the client.</h3>
            </div>
          )}

          {/* ── TRANSACTION HISTORY ── */}
          {escrow?.transactions && escrow.transactions.length > 0 && (
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
                    {escrow.transactions.map((tx, index) => (
                      <tr key={tx._id || index}>
                        <td>{index + 1}</td>
                        <td style={{ textTransform: 'capitalize' }}>{tx.type}</td>
                        <td><strong>{tx.amount} ETH</strong></td>
                        <td style={{ fontSize: '0.8rem' }}>
                          {tx.from?.length > 20
                            ? `${tx.from.slice(0, 8)}...${tx.from.slice(-6)}`
                            : tx.from}
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>
                          {tx.to?.length > 20
                            ? `${tx.to.slice(0, 8)}...${tx.to.slice(-6)}`
                            : tx.to}
                        </td>
                        <td>{tx.date ? new Date(tx.date).toLocaleDateString() : '—'}</td>
                        <td>
                          <span className={`tx-badge ${tx.status === 'Confirmed' ? 'tx-confirmed' : 'tx-pending'}`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── CONFIRM MODAL ── */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirm Action</h2>
            <p>
              Are you sure you want to <strong>{action}</strong>?
              This action will interact with the blockchain smart contract and cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowConfirm(false)}>
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