import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FreelancerDashboard.css';
import '../styles/Milestone.css';
import Toast from '../components/Toast';
import useToast from '../components/useToast';
import axios from '../utils/axiosInstance';

function FreelancerDashboard() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [activeTab, setActiveTab] = useState('browse');

  const [allProjects, setAllProjects] = useState([]);
  const [myProjects,  setMyProjects]  = useState([]);
  const [loadingBrowse, setLoadingBrowse] = useState(true);
  const [loadingMy,     setLoadingMy]     = useState(true);

  // Apply modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyTarget,    setApplyTarget]    = useState(null);
  const [proposal,       setProposal]       = useState('');
  const [appliedIds,     setAppliedIds]     = useState([]);

  // Submit work modal
  const [showSubmitModal,  setShowSubmitModal]  = useState(false);
  const [selectedProject,  setSelectedProject]  = useState(null);
  const [submitData,       setSubmitData]       = useState({ link: '', note: '' });
  const [isSubmitting,     setIsSubmitting]     = useState(false);

  // Progress log modal
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressProject,   setProgressProject]   = useState(null);
  const [progressVal,       setProgressVal]       = useState(0);
  const [progressNote,      setProgressNote]      = useState('');

  // Extension modal
  const [showExtModal,    setShowExtModal]    = useState(false);
  const [extProject,      setExtProject]      = useState(null);
  const [extNewDeadline,  setExtNewDeadline]  = useState('');



  useEffect(() => {
    axios.get('/projects')
      .then(r => setAllProjects((r.data || []).filter(p => p.status === 'Open')))
      .catch(() => showToast('Failed to load projects', 'error'))
      .finally(() => setLoadingBrowse(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    axios.get('/projects/my-work')
      .then(r => setMyProjects(r.data || []))
      .catch(() => showToast('Failed to load your projects', 'error'))
      .finally(() => setLoadingMy(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Apply ──
  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/projects/${applyTarget._id}/apply`, { proposal });
      setAppliedIds(p => [...p, applyTarget._id]);
      showToast(`Applied to "${applyTarget.title}" successfully! 🎉`, 'success');
      setShowApplyModal(false);
    } catch (err) { showToast(err.response?.data?.message || 'Apply failed', 'error'); }
  };

  // ── Submit work ──
  const handleSubmitWork = async (e) => {
    e.preventDefault();
    if (!submitData.link) return showToast("Please provide a link to your work", "error");
    
    setIsSubmitting(true);
    try {
      await axios.post(`/progress/submit-work`, {
        projectId: submitData.projectId,
        link: submitData.link,
        note: submitData.note
      });
      showToast("Work submitted successfully! 🎉 Client has been notified.", "success");
      setShowSubmitModal(false);
      // Re-fetch projects
      const res = await axios.get('/projects/my-work');
      setMyProjects(res.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || "Submission failed", "error");
    } finally { setIsSubmitting(false); }
  };

  // ── Log Progress ──
  const handleLogProgress = async () => {
    try {
      await axios.post('/progress/log', {
        projectId: progressProject._id,
        percent:   progressVal,
        note:      progressNote,
      });
      showToast(`Progress updated: ${progressVal}% 📊`, 'success');
      setShowProgressModal(false);
      setMyProjects(p => p.map(x => x._id === progressProject._id
        ? { ...x, progressPercent: progressVal, warningLevel: progressVal > 0 ? 'None' : x.warningLevel }
        : x
      ));
    } catch (err) { showToast(err.response?.data?.message || 'Failed to log progress', 'error'); }
  };

  // ── Request Extension ──
  const handleRequestExtension = async () => {
    if (!extNewDeadline) return showToast('Please pick a new deadline', 'error');
    try {
      await axios.post('/progress/request-extension', {
        projectId:       extProject._id,
        proposedDeadline: extNewDeadline,
      });
      showToast('Extension request sent to client 📅', 'success');
      setShowExtModal(false);
      setMyProjects(p => p.map(x => x._id === extProject._id ? { ...x, extensionStatus: 'Pending' } : x));
    } catch (err) { showToast(err.response?.data?.message || 'Request failed', 'error'); }
  };

  const getStatusClass = (s) => ({
    'In Progress': 'status-progress', Completed: 'status-completed',
    Open: 'status-open', Disputed: 'status-disputed'
  })[s] || '';

  const totalEarned = myProjects.filter(p => p.status === 'Completed').reduce((s, p) => s + (p.budget || 0), 0);

  return (
    <div className="dashboard">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1>💻 Freelancer Dashboard</h1>
          <p>Track your active contracts and submit work.</p>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        {[
          ['💼', loadingBrowse ? '...' : allProjects.length, 'Available'],
          ['⚙️', myProjects.filter(p => p.status === 'In Progress').length, 'In Progress'],
          ['✅', myProjects.filter(p => p.status === 'Completed').length, 'Completed'],
          ['💰', `${totalEarned.toFixed(3)} ETH`, 'Earned'],
        ].map(([icon, val, label]) => (
          <div className="stat-card" key={label}>
            <span>{icon}</span>
            <div><h3>{val}</h3><p>{label}</p></div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div className="tabs">
        {[['browse', '🔍 Browse Projects'], ['my', '📁 My Projects']].map(([key, label]) => (
          <button key={key} className={activeTab === key ? 'tab active' : 'tab'} onClick={() => setActiveTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {/* ── BROWSE TAB ── */}
      {activeTab === 'browse' && (
        <div className="projects-grid">
          {loadingBrowse
            ? <p style={{ padding: '2rem', color: '#888' }}>Loading...</p>
            : allProjects.length === 0
            ? <p style={{ padding: '2rem', color: '#888' }}>No open projects right now.</p>
            : allProjects.map(project => (
              <div className="project-card" key={project._id}>
                <div className="project-card-header">
                  <h3>{project.title}</h3>
                  <span className="budget-badge">{project.budget} ETH</span>
                </div>
                <p className="project-desc">{project.description}</p>
                <div className="project-meta">
                  <span>👔 {project.client?.name}</span>
                  <span>📅 {new Date(project.deadline).toLocaleDateString()}</span>
                </div>
                {project.skills?.length > 0 && (
                  <div className="skills-list">
                    {project.skills.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
                  </div>
                )}
                <div className="project-card-actions">
                  <button className="btn-premium-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => navigate(`/project/${project._id}`)}>View Details</button>
                  <button
                    className={`btn-premium ${appliedIds.includes(project._id) ? 'applied' : ''}`}
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    onClick={() => { if (!appliedIds.includes(project._id)) { setApplyTarget(project); setShowApplyModal(true); } }}
                    disabled={appliedIds.includes(project._id)}
                  >
                    {appliedIds.includes(project._id) ? '✅ Applied' : 'Apply Now'}
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* ── MY PROJECTS TAB ── */}
      {activeTab === 'my' && (
        <section className="dashboard-section">
          <h2>📑 Active Contracts</h2>
          <div className="table-container">
          {loadingMy ? <p style={{ padding: '2rem', color:'#888' }}>Loading...</p> : myProjects.map(project => (
            <div key={project._id} style={{ background: '#16213e', border: '1px solid #2d3561', borderRadius: '14px', padding: '1.25rem', marginBottom: '1rem' }}>

              {/* Warning banners */}
              {project.warningLevel === 'Yellow' && (
                <div className="warning-banner warning-banner-yellow">
                  <span className="warning-icon">⚠️</span>
                  <div className="warning-text">
                    <h4 className="yellow">50% Deadline Passed — No Progress Logged</h4>
                    <p>Half your timeline is gone with 0% progress. Update your progress to clear this warning.</p>
                  </div>
                </div>
              )}
              {project.warningLevel === 'Red' && (
                <div className="warning-banner warning-banner-red">
                  <span className="warning-icon">🚨</span>
                  <div className="warning-text">
                    <h4 className="red">STRICT WARNING — Only 1/3 Time Remains</h4>
                    <p>If you don't log progress within 3 hours of the warning, the client can terminate and reclaim funds.</p>
                  </div>
                </div>
              )}
              {project.extensionStatus === 'Pending' && (
                <div style={{ background: 'rgba(108,92,231,0.1)', border: '1px solid rgba(108,92,231,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '0.75rem', color: '#a29bfe', fontSize: '0.85rem' }}>
                  ⏳ Extension request sent — waiting for client approval.
                </div>
              )}

              {/* Project info row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', color: '#fff' }}>{project.title}</h3>
                  <p style={{ color: '#888', margin: 0, fontSize: '0.85rem' }}>
                    👔 {project.client?.name} · 📅 {new Date(project.deadline).toLocaleDateString()} · {project.budget} ETH
                  </p>
                </div>
                <span className={`status-badge ${getStatusClass(project.status)}`}>{project.status}</span>
              </div>

              {/* Progress Bar */}
              {project.status === 'In Progress' && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div className="progress-label">
                    <span>Progress</span>
                    <span>{project.progressPercent || 0}%</span>
                  </div>
                  <div className="progress-bar-wrapper">
                    <div className="progress-bar-fill" style={{ width: `${project.progressPercent || 0}%` }} />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                <button className="btn-premium-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => navigate(`/project/${project._id}`)}>View</button>

                {project.status === 'In Progress' && (
                  <button className="btn-premium" style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#6c5ce7' }}
                    onClick={() => { setProgressProject(project); setProgressVal(project.progressPercent || 0); setProgressNote(''); setShowProgressModal(true); }}>
                    📊 Log Progress
                  </button>
                )}

                {project.status === 'In Progress' && project.submissionStatus !== 'Submitted' && project.submissionStatus !== 'Accepted' && (
                  <button className="btn-premium" style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#00b894' }}
                    onClick={() => { 
                      setSelectedProject(project); 
                      setSubmitData({ projectId: project._id, link: '', note: '' }); 
                      setShowSubmitModal(true); 
                    }}>
                    Submit Work
                  </button>
                )}


                {project.warningLevel !== 'None' && project.extensionStatus !== 'Pending' && (
                  <button className="btn-premium-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: '#fdcb6e', color: '#fdcb6e' }}
                    onClick={() => { setExtProject(project); setExtNewDeadline(''); setShowExtModal(true); }}>
                    📅 Request Extension
                  </button>
                )}

                {project.status === 'In Progress' && (
                  <button className="btn-premium-danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => navigate(`/dispute?projectId=${project._id}`)}>Dispute</button>
                )}
              </div>

              {/* Submission status */}
              {project.submissionStatus === 'Submitted' && (
                <p style={{ color: '#fdcb6e', fontSize: '0.82rem', marginTop: '0.5rem' }}>📩 Submitted — awaiting client review</p>
              )}
              {project.submissionStatus === 'Accepted' && (
                <p style={{ color: '#00b894', fontSize: '0.82rem', marginTop: '0.5rem' }}>✅ Work accepted! Payment released.</p>
              )}
            </div>
          ))}

          {!loadingMy && myProjects.length === 0 && (
            <p style={{ padding: '2rem', color: '#888', textAlign: 'center' }}>No assigned projects yet.</p>
          )}
          </div>
        </section>
      )}



      {/* ── APPLY MODAL ── */}
      {showApplyModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Apply for Project</h2>
              <button className="close-btn" onClick={() => setShowApplyModal(false)}>✕</button>
            </div>
            <p className="modal-project-title">📋 {applyTarget?.title}</p>
            <form onSubmit={handleApply} className="modal-form">
              <div className="form-group">
                <label>Your Proposal</label>
                <textarea placeholder="Describe your skills and why you're the best fit..." value={proposal} onChange={e => setProposal(e.target.value)} rows="5" required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowApplyModal(false)}>Cancel</button>
                <button type="submit" className="btn-post">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SUBMIT WORK MODAL ── */}
      {showSubmitModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2>📤 Submit Completed Work</h2>
              <button className="close-btn" onClick={() => setShowSubmitModal(false)}>✕</button>
            </div>
            <p className="modal-project-title">📋 {selectedProject?.title}</p>
            <form onSubmit={handleSubmitWork} className="modal-form">
              <div className="form-group">
                <label>GitHub / Live Link</label>
                <input type="text" placeholder="https://github.com/your-repo" value={submitData.link} onChange={e => setSubmitData(p => ({ ...p, link: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Work Description</label>
                <textarea 
                  placeholder="Describe what you completed..." 
                  value={submitData.note} 
                  onChange={e => setSubmitData(p => ({ ...p, note: e.target.value }))} 
                  rows="4" 
                  required 
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowSubmitModal(false)}>Cancel</button>
                <button type="submit" className="btn-post" disabled={isSubmitting}>
                  {isSubmitting ? '⏳ Submitting...' : 'Submit Work'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── PROGRESS LOG MODAL ── */}
      {showProgressModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>📊 Log Progress</h2>
              <button className="close-btn" onClick={() => setShowProgressModal(false)}>✕</button>
            </div>
            <div className="modal-form">
              <p className="modal-project-title">📋 {progressProject?.title}</p>
              <div className="progress-slider-wrapper">
                <label>
                  <span>Completion</span>
                  <span>{progressVal}%</span>
                </label>
                <input
                  type="range" min="0" max="100" value={progressVal}
                  className="prog-slider"
                  style={{ '--val': `${progressVal}%` }}
                  onChange={e => setProgressVal(Number(e.target.value))}
                />
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Progress Note (optional)</label>
                <textarea placeholder="What did you work on today?" value={progressNote} onChange={e => setProgressNote(e.target.value)} rows="3" />
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowProgressModal(false)}>Cancel</button>
                <button className="btn-post" onClick={handleLogProgress}>Save Progress</button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── EXTENSION MODAL ── */}
      {showExtModal && (
        <div className="modal-overlay">
          <div className="extension-modal">
            <div className="modal">
              <div className="modal-header">
                <h2>📅 Request Extension</h2>
                <button className="close-btn" onClick={() => setShowExtModal(false)}>✕</button>
              </div>
              <div className="modal-form">
                <p style={{ color: '#aaa', marginBottom: '1rem' }}>
                  Current deadline: <strong>{extProject && new Date(extProject.deadline).toLocaleDateString()}</strong>
                </p>
                <div className="form-group">
                  <label>New Proposed Deadline</label>
                  <input type="date" value={extNewDeadline} onChange={e => setExtNewDeadline(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="modal-actions" style={{ marginTop: '1rem' }}>
                  <button className="btn-cancel" onClick={() => setShowExtModal(false)}>Cancel</button>
                  <button className="btn-post" onClick={handleRequestExtension}>Send Request</button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FreelancerDashboard;