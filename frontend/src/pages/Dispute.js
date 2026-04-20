import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Dispute.css';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import useToast from '../components/useToast';
import axios from '../utils/axiosInstance';

function Dispute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast, showToast, hideToast } = useToast();

  // Read optional pre-selected projectId from query param
  const params = new URLSearchParams(location.search);
  const preSelectedProjectId = params.get('projectId') || '';

  const [pageLoading, setPageLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdDispute, setCreatedDispute] = useState(null);

  // Projects list for the selector
  const [myProjects, setMyProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const [formData, setFormData] = useState({
    project: preSelectedProjectId,
    reason: '',
    description: '',
  });

  // ── FETCH USER'S PROJECTS ──
  useEffect(() => {
    const fetchProjects = async () => {
      const role = localStorage.getItem('userRole');
      try {
        let res;
        if (role === 'client') {
          res = await axios.get('/projects/my-projects');
        } else {
          res = await axios.get('/projects/my-work');
        }
        // Only show projects that are In Progress or Disputed (relevant for dispute)
        const relevant = (res.data || []).filter(
          p => p.status === 'In Progress' || p.status === 'Disputed'
        );
        setMyProjects(relevant);
      } catch (err) {
        showToast('Failed to load projects', 'error');
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.project) {
      showToast('Please select a project', 'error');
      return;
    }
    setPageLoading(true);
    try {
      const res = await axios.post('/disputes', {
        projectId: formData.project,
        reason: formData.reason,
        description: formData.description,
      });
      setCreatedDispute(res.data.dispute);
      setSubmitted(true);
      showToast('Dispute submitted successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit dispute', 'error');
    } finally {
      setPageLoading(false);
    }
  };

  return (
    <div className="dispute-page">
      {pageLoading && <Spinner message="Submitting dispute..." />}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="dispute-container">

        {/* ── LEFT INFO ── */}
        <div className="dispute-info">
          <h2>⚠️ Raise a Dispute</h2>
          <p>
            If you believe there is an issue with the project
            delivery or payment, you can raise a formal dispute here.
          </p>
          <div className="dispute-steps">
            <div className="dispute-step">
              <div className="step-num">1</div>
              <div>
                <h4>Submit Dispute</h4>
                <p>Fill in the dispute form with all required details.</p>
              </div>
            </div>
            <div className="dispute-step">
              <div className="step-num">2</div>
              <div>
                <h4>Review Process</h4>
                <p>Our system will review the submitted evidence fairly.</p>
              </div>
            </div>
            <div className="dispute-step">
              <div className="step-num">3</div>
              <div>
                <h4>Resolution</h4>
                <p>Funds will be released based on the final decision.</p>
              </div>
            </div>
          </div>
          <div className="dispute-warning">
            ⚠️ Please only raise a dispute if you have a genuine concern.
            False disputes may affect your account reputation.
          </div>
        </div>

        {/* ── RIGHT FORM ── */}
        <div className="dispute-form-box">
          {!submitted ? (
            <>
              <h3>Dispute Form</h3>
              <form onSubmit={handleSubmit} className="dispute-form">

                <div className="form-group">
                  <label>Select Project</label>
                  {projectsLoading ? (
                    <p style={{ color: '#888', padding: '0.5rem 0' }}>Loading projects...</p>
                  ) : (
                    <select
                      name="project"
                      value={formData.project}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select a Project --</option>
                      {myProjects.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.title} ({p.status})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="form-group">
                  <label>Dispute Reason</label>
                  <select
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select Reason --</option>
                    <option value="incomplete">Work Not Completed</option>
                    <option value="quality">Poor Quality Work</option>
                    <option value="payment">Payment Not Released</option>
                    <option value="deadline">Deadline Missed</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Describe the Issue</label>
                  <textarea
                    name="description"
                    placeholder="Explain your dispute in detail..."
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    required
                  />
                </div>

                <button type="submit" className="submit-btn">
                  Submit Dispute
                </button>

              </form>
            </>
          ) : (
            <div className="success-box">
              <span>✅</span>
              <h3>Dispute Submitted!</h3>
              <p>
                Your dispute has been submitted successfully.
                Our team will review it and get back to you shortly.
              </p>
              {createdDispute && (
                <div style={{
                  background: '#1a1a2e',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginTop: '1rem',
                  textAlign: 'left',
                  fontSize: '0.85rem'
                }}>
                  <p><strong>Dispute ID:</strong> {createdDispute._id}</p>
                  <p><strong>Status:</strong> {createdDispute.status}</p>
                  <p><strong>Reason:</strong> {createdDispute.reason}</p>
                </div>
              )}
              <button
                className="submit-btn"
                style={{ marginTop: '1.5rem' }}
                onClick={() => navigate(-1)}
              >
                Go Back
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Dispute;