import { Link } from "react-router-dom";
<Link to="/projects" style={{color:"white", textDecoration:"none"}}>Projects</Link>
function Navbar() {
  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px 50px",
      background: "#0f172a",
      color: "white"
    }}>

      <h2 style={{color:"#38bdf8"}}>DES</h2>

      <div style={{display:"flex", gap:"25px"}}>

        <Link to="/" style={{color:"white", textDecoration:"none"}}>Home</Link>
        <Link to="/login" style={{color:"white", textDecoration:"none"}}>Login</Link>
        <Link to="/register" style={{color:"white", textDecoration:"none"}}>Register</Link>
        <Link to="/dashboard" style={{color:"white", textDecoration:"none"}}>Dashboard</Link>

      </div>

    </nav>
  );
}

export default Navbar;