import { Link } from "react-router-dom";

function Login() {
  return (
    <div style={{
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
      height:"80vh",
      background:"#f1f5f9"
    }}>

      <div style={{
        background:"white",
        padding:"40px",
        borderRadius:"10px",
        width:"350px",
        boxShadow:"0 0 10px rgba(0,0,0,0.1)"
      }}>

        <h2 style={{textAlign:"center"}}>Login</h2>

        <input
          type="email"
          placeholder="Email"
          style={{
            width:"100%",
            padding:"10px",
            marginTop:"20px"
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

        <button style={{
          width:"100%",
          padding:"12px",
          marginTop:"20px",
          background:"#2563eb",
          color:"white",
          border:"none",
          borderRadius:"5px"
        }}>
          Login
        </button>

        <p style={{marginTop:"15px", textAlign:"center"}}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>

      </div>

    </div>
  );
}

export default Login;