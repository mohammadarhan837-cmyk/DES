import { Link } from "react-router-dom";

function ProjectCard() {

  return (

    <div style={{
      border:"1px solid #ddd",
      padding:"20px",
      borderRadius:"10px",
      width:"250px"
    }}>

      <h3>Blockchain Website</h3>

      <p>Need a developer to build smart contract system.</p>

      <h4>$500</h4>

      <Link to="/project/1">
        <button style={{
          padding:"8px 15px",
          background:"#2563eb",
          color:"white",
          border:"none"
        }}>
          View Details
        </button>
      </Link>

    </div>

  );
}

export default ProjectCard;