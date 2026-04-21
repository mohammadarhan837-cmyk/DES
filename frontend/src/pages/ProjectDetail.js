import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/ProjectDetail.css';
import '../styles/Negotiation.css';
import axios from '../utils/axiosInstance';
import { ethers } from 'ethers';
import { ESCROW_ABI, ESCROW_BYTECODE } from '../utils/contractData';
import useToast from '../components/useToast';
import { useWallet } from '../context/WalletContext';

import Toast from '../components/Toast';

const userRole = localStorage.getItem('userRole');

// ── Timeline Comparison Component ──
function TimelineComparison({ originalDeadline, proposedDeadline }) {
  const orig     = new Date(originalDeadline);
  const proposed = new Date(proposedDeadline);
  const now      = new Date();

  const origDays     = Math.ceil((orig     - now) / 86400000);
  const proposedDays = Math.ceil((proposed - now) / 86400000);
  const delta        = proposedDays - origDays;

  return (
    <div className="timeline-comparison">
      <h4>📅 Timeline Comparison</h4>
      <div className="timeline-row">
        <span>Original Deadline</span>
        <span>{orig.toLocaleDateString()} ({origDays} days left)</span>
      </div>
      <div className="timeline-row">
        <span>Proposed Deadline</span>
        <span>{proposed.toLocaleDateString()} ({proposedDays} days left)</span>
      </div>
      <div className="timeline-row">
        <span>Difference</span>
        <span className={delta > 0 ? 'delta-positive' : delta < 0 ? 'delta-negative' : 'delta-zero'}>
          {delta > 0 ? `+${delta} days later ⬆️` : delta < 0 ? `${delta} days earlier ✅` : 'Same date'}
        </span>
      </div>
    </div>
  );
}

// ── Negotiation Status Badge ──
function NegBadge({ status }) {
  const map = {
    PendingNegotiation: ['neg-badge-pending', '⏳ Pending Negotiation'],
    CounterOffered:     ['neg-badge-counter', '🔄 Counter Offered'],
    Agreed:             ['neg-badge-agreed',  '✅ Agreed'],
    FundsLocked:        ['neg-badge-locked',  '🔒 Funds Locked'],
  };
  const [cls, label] = map[status] || ['neg-badge-pending', status];
  return <span className={`neg-badge ${cls}`}>{label}</span>;
}

function ProjectDetail() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const { toast, showToast, hideToast } = useToast();
  const { account, connectWallet, ensureSepoliaNetwork } = useWallet();

  const [project,     setProject]     = useState(null);
  const [negotiation, setNegotiation] = useState(null);
  const [activeTab,   setActiveTab]   = useState('overview');
  const [txHash,      setTxHash]      = useState(null);
  const [loadingTx,   setLoadingTx]   = useState(false);

  // Counter-offer modal
  const [showCounter, setShowCounter]   = useState(false);
  const [counterData, setCounterData]   = useState({ budget: '', deadline: '' });
  const [counterLoading, setCounterLoading] = useState(false);

  // ── Fetch project ──
  useEffect(() => {
    axios.get(`/projects/${id}`)
      .then(r => setProject(r.data))
      .catch(e => console.log('project error', e));
  }, [id]);

  // ── Fetch negotiation when on negotiation tab ──
  useEffect(() => {
    if (activeTab === 'negotiation' && id) {
      axios.get(`/negotiations/${id}`)
        .then(r => setNegotiation(r.data))
        .catch(() => setNegotiation(null));
    }
  }, [activeTab, id]);

  if (!project) return <p style={{ padding: '2rem', color: '#aaa' }}>Loading...</p>;

  // ── Release Payment ──
  const handleReleasePayment = async () => {
    try {
      if (!window.ethereum) throw new Error("MetaMask not found!");
      if (!project.contractAddress) throw new Error("No contract linked to this project!");

      setLoadingTx(true);
      showToast("🚀 Releasing payment on-chain... Please confirm", "info");

      // 1. Initialize Contract
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(project.contractAddress, ESCROW_ABI, signer);

      // 2. Trigger On-Chain Release
      const tx = await contract.releasePayment();
      await tx.wait();

      // 3. Sync with Backend
      const res = await axios.post('/blockchain/release-payment', { projectId: project._id });
      setTxHash(res.data.txHash || tx.hash);
      showToast('Payment released successfully 🚀', 'success');
      setProject(prev => ({ ...prev, status: 'Completed' }));
    } catch (err) {
      console.error("Release error:", err);
      const msg = err.reason || err.message || "Release failed";
      showToast(msg.toLowerCase().includes('already') ? 'Payment already completed ✅' : msg, 'error');
    } finally { setLoadingTx(false); }
  };

  const handleRefund = async () => {
    try {
      setLoadingTx(true);
      const res = await axios.post('/blockchain/refund', { projectId: project._id });
      setTxHash(res.data.txHash);
      showToast('Refund successful 💸', 'success');
      setProject(prev => ({ ...prev, status: 'Disputed' }));
    } catch (err) {
      showToast(err.response?.data?.error || 'Refund failed', 'error');
    } finally { setLoadingTx(false); }
  };

  // ── Negotiation actions ──
  const negAction = async (endpoint, body = {}) => {
    try {
      const res = await axios.post(`/negotiations/${endpoint}`, { projectId: id, ...body });
      showToast(res.data.message, 'success');
      setNegotiation(res.data.negotiation);
      setProject(prev => ({ ...prev, negotiationStatus: res.data.negotiation?.status }));
      setShowCounter(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  const handleLockFunds = async () => {
    try {
      if (!window.ethereum) throw new Error("MetaMask not found!");
      setLoadingTx(true);

      // ✅ Re-sync wallet if session was lost
      if (!account) {
        await connectWallet();
      }

      // Force Sepolia Network check
      const onSepolia = await ensureSepoliaNetwork();
      if (!onSepolia) {
        showToast("Please switch to Sepolia Test Network to lock funds.", "error");
        setLoadingTx(false);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const freelancerAddress = project.freelancer?.walletAddress;
      const budgetWei = ethers.parseEther(project.budget.toString());
      
      console.log("🛠 DEPLOYMENT DEBUG:");
      console.log("Freelancer Address:", freelancerAddress);
      console.log("Budget (ETH):", project.budget);
      console.log("Value (Wei):", budgetWei.toString());
      console.log("Signer (Client):", await signer.getAddress());

      showToast("🚀 Deploying contract... Please confirm in MetaMask", "info");

      // 1. Deploy Contract via MetaMask
      const factory = new ethers.ContractFactory(ESCROW_ABI, ESCROW_BYTECODE, signer);
      const contract = await factory.deploy(freelancerAddress, {
        value: budgetWei
      });

      await contract.waitForDeployment();
      const contractAddress = await contract.getAddress();

      // 2. Report deployment to Backend
      const res = await axios.post('/negotiations/report-deployment', { 
        projectId: id, 
        contractAddress 
      });

      showToast(`Funds locked! Contract: ${contractAddress.slice(0, 12)}...`, 'success');
      setNegotiation(prev => prev ? { ...prev, status: 'FundsLocked' } : prev);
      setProject(res.data.project);
    } catch (err) {
      console.error("Lock Funds Error:", err);
      showToast(err.message || 'Lock funds failed', 'error');
    } finally { setLoadingTx(false); }
  };

  const handleCounterSubmit = async () => {
    if (!counterData.budget || !counterData.deadline) {
      return showToast('Please fill in both fields', 'error');
    }
    setCounterLoading(true);
    const endpoint = userRole === 'freelancer' ? 'counter' : 'client-counter';
    await negAction(endpoint, { counterBudget: Number(counterData.budget), counterDeadline: counterData.deadline });
    setCounterLoading(false);
  };

  const negStatus     = negotiation?.status;


  return (
    <div className="detail-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      {/* HEADER */}
      <div className="detail-header">
        <div className="detail-header-left">
          <h1>{project.title}</h1>
          <div className="detail-meta">
            <span>👔 Client: <strong>{project.client?.name}</strong></span>
            <span>💻 Freelancer: <strong>{project.freelancer?.name || 'Not Assigned'}</strong></span>
            <span>📅 Deadline: <strong>{new Date(project.deadline).toLocaleDateString()}</strong></span>
            {project.client?.phoneNumber && (
              <span>📞 Client Contact: <strong style={{ color: '#00d4ff' }}>{project.client.phoneNumber}</strong></span>
            )}
            {project.freelancer?.phoneNumber && (
              <span>📞 Freelancer Contact: <strong style={{ color: '#00d4ff' }}>{project.freelancer.phoneNumber}</strong></span>
            )}
          </div>

          {/* 🤝 Handshake - Mutual Contact Sharing */}
          {(project.client?.phoneNumber || project.freelancer?.phoneNumber) && (
            <div className="handshake-card" style={{ marginTop: '1rem', background: 'rgba(0, 212, 255, 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0, 212, 255, 0.3)', display: 'inline-block' }}>
              <h4 style={{ color: '#00d4ff', margin: '0 0 0.5rem 0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>🤝 Mutual Handshake Complete</h4>
              <div style={{ display: 'flex', gap: '2rem' }}>
                {project.client?.phoneNumber && (
                  <div>
                    <p style={{ fontSize: '0.7rem', color: '#888', margin: 0 }}>Client Phone</p>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>{project.client.phoneNumber}</p>
                  </div>
                )}
                {project.freelancer?.phoneNumber && (
                  <div>
                    <p style={{ fontSize: '0.7rem', color: '#888', margin: 0 }}>Freelancer Phone</p>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>{project.freelancer.phoneNumber}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="detail-header-right">
          <div className="detail-budget">
            <p>Project Budget</p>
            <h2>{project.budget} ETH</h2>
            <span className={`status-badge ${project.status === 'Completed' ? 'status-completed' : project.status === 'Disputed' ? 'status-disputed' : 'status-progress'}`}>
              {project.status}
            </span>
            {project.fundsLocked && (
              <span className="neg-badge neg-badge-locked" style={{ marginTop: '6px', display: 'inline-flex' }}>
                🔒 Funds Locked
              </span>
            )}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs">
        {['overview', 'milestones', 'negotiation', 'escrow'].map(tab => (
          <button
            key={tab}
            className={activeTab === tab ? 'tab active' : 'tab'}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview'     && '📋 Overview'}
            {tab === 'milestones'   && '🎯 Milestones'}
            {tab === 'negotiation'  && '🤝 Negotiation'}
            {tab === 'escrow'       && '🔒 Escrow'}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          <p>{project.description}</p>
          {project.skills?.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              {project.skills.map((s, i) => (
                <span key={i} style={{ background:'#0f3460', color:'#00d4ff', padding:'4px 10px', borderRadius:'6px', fontSize:'0.82rem', marginRight:'6px', display:'inline-block', marginBottom:'6px' }}>
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MILESTONES ── */}
      {activeTab === 'milestones' && (
        <div className="tab-content">
          <div className="progress-section">
            <div className="progress-header">
              <h3>📈 Current Progress: {project.progressPercent || 0}%</h3>
            </div>
            <div className="progress-bar-container" style={{ margin: '1.5rem 0 2rem' }}>
              <div className="progress-bar-fill" style={{ width: `${project.progressPercent || 0}%` }}></div>
            </div>

            <div className="history-section">
              <h4 style={{ color: '#00d4ff', marginBottom: '1rem' }}>📜 Progress History Log</h4>
              {project.progressUpdates?.length > 0 ? (
                <div className="history-list">
                  {project.progressUpdates.slice().reverse().map((update, idx) => (
                    <div key={idx} className="history-item" style={{ background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '8px', marginBottom: '10px', borderLeft: '4px solid #00d4ff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <strong style={{ fontSize: '1.1rem' }}>{update.percent}% Complete</strong>
                        <span style={{ color: '#888', fontSize: '0.8rem' }}>{new Date(update.updatedAt).toLocaleString()}</span>
                      </div>
                      <p style={{ margin: 0, color: '#ccc', fontStyle: 'italic' }}>
                        "{update.note || "No note provided."}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>No progress updates logged yet.</p>
              )}
            </div>
          </div>
        </div>
      )}


      {/* ── NEGOTIATION ── */}
      {activeTab === 'negotiation' && (
        <div className="tab-content">
          {!negotiation ? (
            <p style={{ color: '#888' }}>No negotiation started yet. A negotiation begins when a freelancer is selected.</p>
          ) : (
            <>
              {/* Status */}
              <div className="neg-card">
                <div className="neg-card-header">
                  <h3>🤝 Negotiation Status</h3>
                  <NegBadge status={negStatus} />
                </div>

                {/* Current Terms */}
                <div className="terms-grid">
                  <div className="term-box">
                    <p>💰 Proposed Budget</p>
                    <h3>{negotiation.proposedBudget} ETH</h3>
                  </div>
                  <div className="term-box">
                    <p>📅 Proposed Deadline</p>
                    <h3>{new Date(negotiation.proposedDeadline).toLocaleDateString()}</h3>
                  </div>
                  {negotiation.agreedBudget && (
                    <>
                      <div className="term-box" style={{ borderColor: '#00b894' }}>
                        <p>✅ Agreed Budget</p>
                        <h3>{negotiation.agreedBudget} ETH</h3>
                      </div>
                      <div className="term-box" style={{ borderColor: '#00b894' }}>
                        <p>✅ Agreed Deadline</p>
                        <h3>{new Date(negotiation.agreedDeadline).toLocaleDateString()}</h3>
                      </div>
                    </>
                  )}
                </div>

                {/* Timeline Comparison (show if deadline differs) */}
                {negotiation.proposedDeadline && negotiation.originalDeadline &&
                  new Date(negotiation.proposedDeadline).getTime() !== new Date(negotiation.originalDeadline).getTime() && (
                  <TimelineComparison
                    originalDeadline={negotiation.originalDeadline}
                    proposedDeadline={negotiation.proposedDeadline}
                  />
                )}

                {/* Actions based on role + status */}
                <div className="neg-actions">

                  {/* FREELANCER actions */}
                  {userRole === 'freelancer' && (
                    <>
                      {(negStatus === 'PendingNegotiation' || negStatus === 'CounterOffered') && (
                        <>
                          <button className="btn-premium" onClick={() => negAction('accept')}>
                            ✅ Accept Terms
                          </button>
                          <button className="btn-premium-outline" style={{ marginLeft: '1rem' }} onClick={() => setShowCounter(true)}>
                            🔄 Counter-Offer
                          </button>
                        </>
                      )}
                      {negStatus === 'Agreed' && (
                        <p style={{ color: '#00b894' }}>✅ You accepted the terms. Waiting for client to lock funds.</p>
                      )}
                      {negStatus === 'FundsLocked' && (
                        <div className="funds-locked-banner">
                          <h3>🔒 Funds Locked!</h3>
                          <p>The client has locked {negotiation.agreedBudget} ETH in the smart contract. Work can begin!</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* CLIENT actions */}
                  {userRole === 'client' && (
                    <>
                      {negStatus === 'CounterOffered' && (
                        <>
                          <button className="btn-premium" onClick={() => negAction('client-accept')}>
                            ✅ Accept Counter
                          </button>
                          <button className="btn-premium-outline" style={{ marginLeft: '1rem' }} onClick={() => setShowCounter(true)}>
                            ↩️ Re-Counter
                          </button>
                        </>
                      )}
                      {negStatus === 'Agreed' && (
                        <button
                          className="btn-premium"
                          style={{ width: '100%' }}
                          onClick={handleLockFunds}
                          disabled={loadingTx}
                        >
                          {loadingTx ? '⏳ Deploying Contract...' : '🔒 Lock Funds — Deploy Contract'}
                        </button>
                      )}
                      {(negStatus === 'PendingNegotiation') && (
                        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
                          Waiting for freelancer to accept or counter the terms.
                          <br />
                          <span style={{ color: '#fdcb6e' }}>🔒 Lock Funds button unlocks after freelancer accepts.</span>
                        </p>
                      )}
                      {negStatus === 'FundsLocked' && (
                        <div className="funds-locked-banner">
                          <h3>🔒 Funds Successfully Locked</h3>
                          <p>Contract: <code style={{ color: '#00d4ff' }}>{project.contractAddress}</code></p>
                        </div>
                      )}
                      {/* Lock Funds disabled placeholder for all non-Agreed states */}
                      {negStatus !== 'Agreed' && negStatus !== 'FundsLocked' && (
                        <button className="btn-premium" style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed' }} disabled>
                          🔒 Lock Funds (waiting for agreement)
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Round info */}
                <p style={{ color: '#555', fontSize: '0.78rem', marginTop: '1rem' }}>
                  Negotiation Round #{negotiation.round}
                </p>

                {/* History */}
                {negotiation.history?.length > 1 && (
                  <div className="neg-history">
                    <details>
                      <summary>📜 View Negotiation History ({negotiation.history.length} entries)</summary>
                      {negotiation.history.map((h, i) => (
                        <div className="history-entry" key={i}>
                          <span className="h-round">#{h.round}</span>
                          <span className="h-action">{h.action}</span>
                          <span className="h-detail">{h.budget} ETH · {new Date(h.deadline).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </details>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── ESCROW ── */}
      {activeTab === 'escrow' && (
        <div className="tab-content">
          {!project.fundsLocked ? (
            <p style={{ color: '#888' }}>
              Funds have not been locked yet. Complete the negotiation and have the client lock funds first.
            </p>
          ) : (
            <>
              <div style={{ marginBottom: '1rem', padding: '1rem', background: '#0f3460', borderRadius: '10px' }}>
                <p style={{ color: '#aaa', margin: 0 }}>Contract Address</p>
                <p style={{ color: '#00d4ff', fontFamily: 'monospace', margin: '4px 0 0', wordBreak: 'break-all' }}>
                  {project.contractAddress || '—'}
                </p>
              </div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  className="btn-premium"
                  onClick={handleReleasePayment}
                  disabled={loadingTx || project.status === 'Completed'}
                >
                  {project.status === 'Completed' ? '✅ Payment Completed' : loadingTx ? 'Processing...' : '🚀 Release Payment'}
                </button>
                <button
                  className="btn-premium-danger"
                  onClick={handleRefund}
                  disabled={loadingTx || project.status === 'Completed'}
                >
                  💸 Refund Client
                </button>
              </div>
              {txHash && (
                <div style={{ marginTop: '20px', color: '#00b894' }}>
                  <p>✅ Transaction Successful</p>
                  <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer">
                    View on Etherscan 🔗
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── COUNTER-OFFER MODAL ── */}
      {showCounter && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>🔄 {userRole === 'freelancer' ? 'Counter-Offer' : 'Re-Counter'}</h2>
              <button className="close-btn" onClick={() => setShowCounter(false)}>✕</button>
            </div>
            <div className="modal-form">
              <div className="counter-modal-grid">
                <div className="form-group">
                  <label>Your Budget (ETH)</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="e.g. 0.5"
                    value={counterData.budget}
                    onChange={e => setCounterData(p => ({ ...p, budget: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Your Deadline</label>
                  <input
                    type="date"
                    value={counterData.deadline}
                    onChange={e => setCounterData(p => ({ ...p, deadline: e.target.value }))}
                  />
                </div>
              </div>

              {/* Timeline comparison preview */}
              {counterData.deadline && negotiation?.proposedDeadline && (
                <TimelineComparison
                  originalDeadline={negotiation.originalDeadline}
                  proposedDeadline={counterData.deadline}
                />
              )}

              <div className="modal-actions" style={{ marginTop: '1rem' }}>
                <button onClick={() => setShowCounter(false)}>Cancel</button>
                <button onClick={handleCounterSubmit} disabled={counterLoading}>
                  {counterLoading ? 'Sending...' : 'Send Counter-Offer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetail;
