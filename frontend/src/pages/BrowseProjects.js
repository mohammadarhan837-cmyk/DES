import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BrowseProjects.css';
import Toast from '../components/Toast';
import useToast from '../components/useToast';
import axios from '../utils/axiosInstance';

const categories = ['All', 'Web Development', 'Blockchain', 'Backend', 'UI/UX Design', 'Data Science', 'Other'];

// Map skills to categories (client-side heuristic)
function inferCategory(skills = []) {
  const s = skills.map(x => x.toLowerCase()).join(' ');
  if (s.includes('solidity') || s.includes('ethereum') || s.includes('blockchain') || s.includes('web3')) return 'Blockchain';
  if (s.includes('react') || s.includes('html') || s.includes('css') || s.includes('vue') || s.includes('angular')) return 'Web Development';
  if (s.includes('node') || s.includes('express') || s.includes('django') || s.includes('flask')) return 'Backend';
  if (s.includes('figma') || s.includes('ui') || s.includes('ux') || s.includes('design')) return 'UI/UX Design';
  if (s.includes('python') || s.includes('ml') || s.includes('tensorflow') || s.includes('data')) return 'Data Science';
  return 'Other';
}

function BrowseProjects() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('latest');
  const [appliedIds, setAppliedIds] = useState([]);

  // Apply modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyTarget, setApplyTarget] = useState(null);
  const [proposal, setProposal] = useState('');

  // ── FETCH ALL OPEN PROJECTS ──
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get('/projects');
        // Only show Open projects
        const openProjects = (res.data || []).filter(p => p.status === 'Open');
        setProjects(openProjects);
      } catch (err) {
        showToast('Failed to load projects', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openApplyModal = (project) => {
    setApplyTarget(project);
    setProposal('');
    setShowApplyModal(true);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/projects/${applyTarget._id}/apply`, { proposal });
      setAppliedIds(prev => [...prev, applyTarget._id]);
      showToast(`Applied to "${applyTarget.title}" successfully! 🎉`, 'success');
      setShowApplyModal(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Apply failed', 'error');
    }
  };

  // Enrich projects with inferred category
  const enriched = projects.map(p => ({
    ...p,
    category: inferCategory(p.skills),
  }));

  // Filter & sort
  const filtered = enriched
    .filter(p => {
      const matchSearch =
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase()) ||
        (p.skills || []).some(s => s.toLowerCase().includes(search.toLowerCase()));
      const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'budget-high') return (b.budget || 0) - (a.budget || 0);
      if (sortBy === 'budget-low')  return (a.budget || 0) - (b.budget || 0);
      if (sortBy === 'applicants')  return (a.applicants?.length || 0) - (b.applicants?.length || 0);
      // latest (default)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div className="browse-page">

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      {/* ── HEADER ── */}
      <div className="browse-header">
        <div>
          <h1>🔍 Browse Projects</h1>
          <p>Find the perfect project that matches your skills</p>
        </div>
        <div className="browse-stats">
          <span>📋 {filtered.length} Projects Found</span>
        </div>
      </div>

      {/* ── SEARCH + SORT BAR ── */}
      <div className="browse-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by title, skill or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search" onClick={() => setSearch('')}>✕</button>
          )}
        </div>
        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="latest">🕐 Latest First</option>
          <option value="budget-high">💰 Budget: High to Low</option>
          <option value="budget-low">💰 Budget: Low to High</option>
          <option value="applicants">📊 Fewest Applicants</option>
        </select>
      </div>

      {/* ── CATEGORY FILTERS ── */}
      <div className="category-filters">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === 'All'            && '📬 All'}
            {cat === 'Web Development' && '🌐 Web Dev'}
            {cat === 'Blockchain'     && '🔗 Blockchain'}
            {cat === 'Backend'        && '⚙️ Backend'}
            {cat === 'UI/UX Design'   && '🎨 UI/UX'}
            {cat === 'Data Science'   && '📊 Data Science'}
            {cat === 'Other'          && '🗂️ Other'}
          </button>
        ))}
      </div>

      {/* ── PROJECTS GRID ── */}
      {loading ? (
        <div className="no-results">
          <span>⏳</span>
          <h3>Loading Projects...</h3>
        </div>
      ) : filtered.length === 0 ? (
        <div className="no-results">
          <span>😕</span>
          <h3>No Projects Found</h3>
          <p>Try different search keywords or category filters.</p>
          <button
            className="btn-reset"
            onClick={() => { setSearch(''); setSelectedCategory('All'); }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {filtered.map((project) => (
            <div className="project-card" key={project._id}>

              {/* ── CARD TOP ── */}
              <div className="card-top">
                <span className="category-tag">{project.category}</span>
                <span className="budget-tag">{project.budget} ETH</span>
              </div>

              {/* ── TITLE ── */}
              <h3>{project.title}</h3>
              <p className="project-desc">{project.description}</p>

              {/* ── META ── */}
              <div className="project-meta">
                <span>👔 {project.client?.name || 'Client'}</span>
                <span>📅 {new Date(project.deadline).toLocaleDateString()}</span>
                <span>📨 {project.applicants?.length || 0} Applicants</span>
              </div>

              {/* ── SKILLS ── */}
              {project.skills && project.skills.length > 0 && (
                <div className="skills-list">
                  {project.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              )}

              {/* ── ACTIONS ── */}
              <div className="card-actions">
                <button
                  className="btn-view-detail"
                  onClick={() => navigate(`/project/${project._id}`)}
                >
                  View Details
                </button>
                <button
                  className={`btn-apply ${appliedIds.includes(project._id) ? 'applied' : ''}`}
                  onClick={() => {
                    if (!appliedIds.includes(project._id)) openApplyModal(project);
                  }}
                  disabled={appliedIds.includes(project._id)}
                >
                  {appliedIds.includes(project._id) ? '✅ Applied' : 'Apply Now'}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ── APPLY MODAL ── */}
      {showApplyModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Apply for Project</h2>
              <button className="close-btn" onClick={() => setShowApplyModal(false)}>✕</button>
            </div>
            <p style={{ padding: '0 1.5rem', color: '#888', fontWeight: 600 }}>
              📋 {applyTarget?.title}
            </p>
            <form onSubmit={handleApply} className="modal-form">
              <div className="form-group">
                <label>Your Proposal</label>
                <textarea
                  placeholder="Describe your skills and why you're the best fit for this project..."
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                  rows="5"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowApplyModal(false)}>Cancel</button>
                <button type="submit">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default BrowseProjects;