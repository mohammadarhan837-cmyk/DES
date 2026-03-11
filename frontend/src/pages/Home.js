function Home() {
  return (
    <div>

      <div style={{
        textAlign:"center",
        padding:"100px 20px",
        background:"#f1f5f9"
      }}>

        <h1 style={{fontSize:"40px"}}>
          Secure Freelance Payments with Blockchain
        </h1>

        <p style={{marginTop:"20px", fontSize:"18px"}}>
          A decentralized escrow platform for safe collaboration
          between clients and freelancers.
        </p>

        <div style={{marginTop:"30px"}}>

          <button style={{
            padding:"12px 25px",
            marginRight:"15px",
            background:"#2563eb",
            color:"white",
            border:"none",
            borderRadius:"5px"
          }}>
            Get Started
          </button>

          <button style={{
            padding:"12px 25px",
            background:"#111827",
            color:"white",
            border:"none",
            borderRadius:"5px"
          }}>
            Browse Projects
          </button>

        </div>

      </div>

    </div>
  );
}

export default Home;