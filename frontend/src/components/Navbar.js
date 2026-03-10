import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "15px 40px",
        background: "#0f172a",
        color: "white",
      }}
    >
      <h2>DES</h2>

      <div style={{ display: "flex", gap: "20px" }}>
        <Link to="/" style={{ color: "white" }}>Home</Link>
        <Link to="/login" style={{ color: "white" }}>Login</Link>
        <Link to="/register" style={{ color: "white" }}>Register</Link>
        <Link to="/dashboard" style={{ color: "white" }}>Dashboard</Link>
      </div>
    </nav>
  );
}

export default Navbar;