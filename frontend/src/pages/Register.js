import { Link } from "react-router-dom";

function Register() {
  return (
    <div style={{
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
      height:"90vh",
      background:"#f1f5f9"
    }}>

      <div style={{
        background:"white",
        padding:"40px",
        borderRadius:"10px",
        width:"400px",
        boxShadow:"0 0 10px rgba(0,0,0,0.1)"
      }}>

        <h2 style={{textAlign:"center"}}>Create Account</h2>

        <input
          type="text"
          placeholder="Full Name"
          style={{
            width:"100%",
            padding:"10px",
            marginTop:"20px"
          }}
        />

        <input
          type="email"
          placeholder="Email"
          style={{
            width:"100%",
            padding:"10px",
            marginTop:"15px"
          }}
        />

        <input
          type="password"
          placeholder="Password"
          style={{
            width:"100%",
            padding:"10px",
            marginTop:"15px"
          }}
        />

        <select
          style={{
            width:"100%",
            padding:"10px",
            marginTop:"15px"
          }}
        >
          <option>Select Role</option>
          <option>Client</option>
          <option>Freelancer</option>
        </select>

        <button style={{
          width:"100%",
          padding:"12px",
          marginTop:"20px",
          background:"#2563eb",
          color:"white",
          border:"none",
          borderRadius:"5px"
        }}>
          Register
        </button>

        <p style={{marginTop:"15px", textAlign:"center"}}>
          Already have an account? <Link to="/login">Login</Link>
        </p>

      </div>

    </div>
  );
}

export default Register;