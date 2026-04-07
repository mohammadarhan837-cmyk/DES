import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BrowseProjects.css';
import Toast from '../components/Toast';
import useToast from '../components/useToast';

const allProjects = [
  {
    id: 1,
    title: 'Build a Portfolio Website',
    client: 'Ahmed Raza',
    budget: '0.3 ETH',
    deadline: '2024-06-10',
    category: 'Web Development',
    skills: ['React', 'CSS', 'HTML'],
    description: 'Need a modern portfolio website with animations and responsive design.',
    proposals: 3
  },
  {
    id: 2,
    title: 'Smart Contract Development',
    client: 'Sara Ali',
    budget: '0.7 ETH',
    deadline: '2024-06-20',
    category: 'Blockchain',
    skills: ['Solidity', 'Hardhat', 'Ethereum'],
    description: 'Develop and deploy an ERC-20 token smart contract on Polygon testnet.',
    proposals: 5
  },
  {
    id: 3,
    title: 'REST API Development',
    client: 'John Doe',
    budget: '0.4 ETH',
    deadline: '2024-07-01',
    category: 'Backend',
    skills: ['Node.js', 'Express', 'MongoDB'],
    description: 'Build a complete REST API with authentication and CRUD operations.',
    proposals: 2
  },
  {
    id: 4,
    title: 'Mobile App UI Design',
    client: 'Priya Singh',
    budget: '0.5 ETH',
    deadline: '2024-06-25',
    category: 'UI/UX Design',
    skills: ['Figma', 'Adobe XD', 'Prototyping'],
    description: 'Design a modern mobile app UI for a food delivery application.',
    proposals: 7
  },
  {
    id: 5,
    title: 'E-commerce Website',
    client: 'Ali Hassan',
    budget: '0.6 ETH',
    deadline: '2024-07-15',
    category: 'Web Development',
    skills: ['React', 'Node.js', 'MongoDB'],
    description: 'Build a full stack e-commerce website with payment integration.',
    proposals: 4
  },
  {
    id: 6,
    title: 'Python Data Analysis',
    client: 'Maria Garcia',
    budget: '0.35 ETH',
    deadline: '2024-06-30',
    category: 'Data Science',
    skills: ['Python', 'Pandas', 'Matplotlib'],
    description: 'Analyze sales data and create visual reports using Python.',
    proposals: 1
  },
  {
    id: 7,
    title: 'NFT Marketplace',
    client: 'James Wilson',
    budget: '1.0 ETH',
    deadline: '2024-07-20',
    category: 'Blockchain',
    skills: ['Solidity', 'React', 'IPFS'],
    description: 'Build a complete NFT marketplace with minting and trading features.',
    proposals: 8
  },
  {
    id: 8,
    title: 'WordPress Blog Setup',
    client: 'Emma Brown',
    budget: '0.2 ETH',
    deadline: '2024-06-15',
    category: 'Web Development',
    skills: ['WordPress', 'PHP', 'CSS'],
    description: 'Set up and customize a WordPress blog with custom theme.',
    proposals: 6
  },
  {
    id: 9,
    title: 'Machine Learning Model',
    client: 'David Lee',
    budget: '0.8 ETH',
    deadline: '2024-07-10',
    category: 'Data Science',
    skills: ['Python', 'TensorFlow', 'Scikit-learn'],
    description: 'Build a classification ML model for customer churn prediction.',
    proposals: 3
  }
];

const categories = [
  'All',
  'Web Development',
  'Blockchain',
  'Backend',
  'UI/UX Design',
  'Data Science'
];

function BrowseProjects() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('latest');
  const [appliedProjects, setAppliedProjects] = useState([]);

  const handleApply = (project) => {
    if (appliedProjects.includes(project.id)) {
      showToast('You have already applied to this project!', 'warning');
      return;
    }
    setAppliedProjects([...appliedProjects, project.id]);
    showToast(`Applied to "${project.title}" successfully! 🎉`, 'success');
  };

  // Filter projects
  const filteredProjects = allProjects
    .filter(p => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
      const matchCategory =
        selectedCategory === 'All' || p.category === selectedCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'budget-high')
        return parseFloat(b.budget) - parseFloat(a.budget);
      if (sortBy === 'budget-low')
        return parseFloat(a.budget) - parseFloat(b.budget);
      if (sortBy === 'proposals')
        return a.proposals - b.proposals;
      return b.id - a.id;
    });

  return (
    <div className="browse-page">

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      {/* ── HEADER ── */}
      <div className="browse-header">
        <div>
          <h1>🔍 Browse Projects</h1>
          <p>Find the perfect project that matches your skills</p>
        </div>
        <div className="browse-stats">
          <span>📋 {filteredProjects.length} Projects Found</span>
        </div>
      </div>

      {/* ── SEARCH + FILTER BAR ── */}
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
            <button
              className="clear-search"
              onClick={() => setSearch('')}
            >
              ✕
            </button>
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
          <option value="proposals">📊 Fewest Proposals</option>
        </select>
      </div>

      {/* ── CATEGORY FILTERS ── */}
      <div className="category-filters">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-btn
              ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === 'All'            && '📬 All'}
            {cat === 'Web Development' && '🌐 Web Development'}
            {cat === 'Blockchain'     && '🔗 Blockchain'}
            {cat === 'Backend'        && '⚙️ Backend'}
            {cat === 'UI/UX Design'   && '🎨 UI/UX Design'}
            {cat === 'Data Science'   && '📊 Data Science'}
          </button>
        ))}
      </div>

      {/* ── PROJECTS GRID ── */}
      {filteredProjects.length === 0 ? (
        <div className="no-results">
          <span>😕</span>
          <h3>No Projects Found</h3>
          <p>Try different search keywords or category filters.</p>
          <button
            className="btn-reset"
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <div className="project-card" key={project.id}>

              {/* ── CARD TOP ── */}
              <div className="card-top">
                <span className="category-tag">{project.category}</span>
                <span className="budget-tag">{project.budget}</span>
              </div>

              {/* ── TITLE ── */}
              <h3>{project.title}</h3>
              <p className="project-desc">{project.description}</p>

              {/* ── META ── */}
              <div className="project-meta">
                <span>👤 {project.client}</span>
                <span>📅 {project.deadline}</span>
                <span>📨 {project.proposals} Proposals</span>
              </div>

              {/* ── SKILLS ── */}
              <div className="skills-list">
                {project.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>

              {/* ── ACTIONS ── */}
              <div className="card-actions">
                <button
                  className="btn-view-detail"
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  View Details
                </button>
                <button
                  className={`btn-apply
                    ${appliedProjects.includes(project.id) ? 'applied' : ''}`}
                  onClick={() => handleApply(project)}
                >
                  {appliedProjects.includes(project.id)
                    ? '✅ Applied'
                    : 'Apply Now'
                  }
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default BrowseProjects;