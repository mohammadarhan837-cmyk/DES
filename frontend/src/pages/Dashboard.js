import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard">

      {/* HEADER */}
      <div className="top-bar">
        <div className="toggle">
          <span>You are a Client</span>
          <div className="switch"></div>
          <span>You are a Freelancer</span>
        </div>

        <div className="wallet">
          <p>0x71...4A2</p>
          <span className="connected">● Connected</span>
        </div>
      </div>

      <h1 className="title">CLIENT DASHBOARD</h1>

      <button className="btn center-btn">Post a New Project</button>

      <div className="main-grid">

        {/* LEFT SIDEBAR */}
        <div className="card sidebar">
          <h3>Progress Tracking</h3>
          <p>📈 Tracking</p>
          <p>🔒 Escrow Vault</p>
          <p>📄 Submissions</p>
          <p>⚠️ Dispute Center</p>
        </div>

        {/* RIGHT EARNINGS */}
        <div className="card earnings">
          <h3>Earnings Overview</h3>
          <p>Locked vs Released</p>
          <div className="chart"></div>
        </div>

      </div>

      {/* TABLE SECTION */}
      <div className="table-grid">

        {/* ESCROW LIST */}
        <div className="card">
          <h3>ACTIVE ESCROW LIST</h3>

          <table>
            <thead>
              <tr>
                <th>Freelancer</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
             <tr>
            <td>Dev_Jane</td>
            <td>2.5 ETH</td>
            <td>2026-06-15</td>
            <td>Verified & In Progress</td>
            </tr>
            </tbody>
          </table>

        </div>

        {/* APPROVAL */}
       <div className="approval">
  <div>
    <p>Ready for Client Signature</p>
    <span className="badge">ML Check</span>
  </div>
  <button className="btn">SIGN TO RELEASE</button>
</div>

      </div>

    </div>
  );
}

export default Dashboard;