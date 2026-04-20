
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ClientDashboard.css';
import Toast from '../components/Toast';
import useToast from '../components/useToast';
import axios from "../utils/axiosInstance";

function ClientDashboard() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: ''
  });

  // ✅ Fetch projects from backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("/projects");
        console.log("PROJECTS:", res.data);
        setProjects(res.data || []);
      } catch (err) {
        console.log("ERROR:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleChange = (e) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  const handlePostProject = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post("/projects", {
      title: newProject.title,
      description: newProject.description,
      budget: Number(newProject.budget),
      deadline: newProject.deadline,
    });


    showToast("Project posted successfully! 🎉", "success");

    setShowModal(false);

    setNewProject({
      title: '',
      description: '',
      budget: '',
      deadline: ''
    });

    // ✅ Immediately update UI
    setProjects((prev) => [...prev, res.data]);

  } catch (err) {
    console.log("ERROR:", err.response?.data || err.message);

    showToast(
      err.response?.data?.message || "Failed to create project",
      "error"
    );
  }
};

  const getStatusClass = (status) => {
    switch (status) {
      case 'In Progress': return 'status-progress';
      case 'Completed':   return 'status-completed';
      case 'Open':        return 'status-open';
      case 'Disputed':    return 'status-disputed';
      default:            return '';
    }
  };

  return (
    <div className="dashboard">

{/* TOAST */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1>👔 Client Dashboard</h1>
          <p>Welcome back! Manage your projects and payments here.</p>
        </div>
        <button className="post-btn" onClick={() => setShowModal(true)}>
          + Post New Project
        </button>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <span>📋</span>
          <div>
            <h3>{projects?.length || 0}</h3>
            <p>Total Projects</p>
          </div>
        </div>
        <div className="stat-card">
          <span>🔒</span>
          <div>
            <h3>-</h3>
            <p>Funds in Escrow</p>
          </div>
        </div>
        <div className="stat-card">
          <span>✅</span>
          <div>
            <h3>{projects.filter(p => p?.status === "Completed").length}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <span>🔃</span>
          <div>
            <h3>{projects.filter(p => p?.status === "In Progress").length}</h3>
            <p>In Progress</p>
          </div>
        </div>     
        <div className="stat-card">
          <span>⚠️</span>
          <div>
            <h3>{projects?.filter(p => p?.status === "Disputed").length}</h3>
            <p>Disputed</p>
          </div>
        </div>
      </div>

      {/* PROJECTS TABLE */}
      <div className="projects-section">
        <h2>My Projects</h2>
    
        <div className="table-wrapper">
          <table className="projects-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Project Title</th>
                <th>Freelancer</th>
                <th>Budget</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
<tbody>
  {loading ? (
    <tr>
      <td colSpan="7">Loading...</td>
    </tr>
  ) : (
    projects?.map((project, index) => {
      if (!project) return null;

      return (
        <tr key={project._id}>
          <td>{index + 1}</td>
          <td>{project.title}</td>
          <td>{project.freelancer?.name || "Not Assigned"}</td>
          <td>{project.budget} ETH</td>
          <td>{new Date(project.deadline).toLocaleDateString()}</td>

          <td>
            <span className={`status-badge ${getStatusClass(project.status)}`}>
              {project.status}
            </span>
          </td>

          <td className="action-btns">
            <button
              className="btn-view"
              onClick={() => navigate(`/project/${project._id}`)}
            >
              View
            </button>

            {project.status === 'In Progress' && (
              <>
                <button
                  className="btn-release"
                  onClick={async () => {
                    try {
                      const res = await axios.post("/blockchain/release-payment", {
                        projectId: project._id
                      });

                      showToast("Payment released successfully 🚀", "success");
// 🔥 ADD THIS
setProjects(prev =>
  prev.map(p =>
    p._id === project._id
      ? { ...p, status: "Completed" }
      : p
  )
);
                      console.log("TX HASH:", res.data.txHash);

                    } catch (err) {
                      showToast(
                        err.response?.data?.error || "Payment failed",
                        "error"
                      );
                    }
                  }}
                >
                  Release
                </button>

                <button
                  className="btn-dispute"
                  onClick={() => navigate('/dispute')}
                >
                  Dispute
                </button>
              </>
            )}
          </td>
        </tr>
      );
    })
  )}
</tbody>


          </table>
        </div>
      </div>

      {/* POST PROJECT MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Post New Project</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handlePostProject} className="modal-form">
              <div className="form-group">
                <label>Project Title</label>
                <input
                  type="text"
                  name="title"
                  value={newProject.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={newProject.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Budget (ETH)</label>
                  <input
                    type="text"
                    name="budget"
                    value={newProject.budget}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={newProject.deadline}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit">
                  Post Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default ClientDashboard;
