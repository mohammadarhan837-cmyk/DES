import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dispute.css';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import useToast from '../components/useToast';

function Dispute() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [pageLoading, setPageLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    project: '',
    reason: '',
    description: '',
    evidence: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setPageLoading(true);
    setTimeout(() => {
      setPageLoading(false);
      setSubmitted(true);
      showToast('Dispute submitted successfully!', 'success');
    }, 1500);
  };

  return (
    <div className="dispute-page">
      {pageLoading && <Spinner message="Submitting dispute..." />}
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
                  <select
                    name="project"
                    value={formData.project}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select a Project --</option>
                    <option value="ecommerce">E-commerce Website</option>
                    <option value="mobile">Mobile App UI Design</option>
                    <option value="api">REST API Development</option>
                  </select>
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

                <div className="form-group">
                  <label>Evidence Link (GitHub / Drive)</label>
                  <input
                    type="text"
                    name="evidence"
                    placeholder="https://drive.google.com/..."
                    value={formData.evidence}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Upload Evidence File (Optional)</label>
                  <input type="file" />
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
              <button
                className="submit-btn"
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