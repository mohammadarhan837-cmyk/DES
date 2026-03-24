import { useParams } from "react-router-dom";

function ProjectDetails() {

  const { id } = useParams();

  return (

    <div style={{padding:"40px"}}>

      <h1>Project Details</h1>
      <h2>Project ID: {id}</h2>
      <h2>Blockchain Website Development</h2>

      <p>
        Build a decentralized escrow system using smart contracts and React frontend.
      </p>

      <h3>Budget: $500</h3>

      <button style={{
        marginTop:"20px",
        padding:"10px 20px",
        background:"#2563eb",
        color:"white",
        border:"none"
      }}>
        Apply for Project
      </button>

    </div>

  );

}

export default ProjectDetails;