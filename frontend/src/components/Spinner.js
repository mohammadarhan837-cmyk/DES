import React from 'react';
import '../styles/Spinner.css';

function Spinner({ message = 'Loading...' }) {
  return (
    <div className="spinner-overlay">
      <div className="spinner-box">
        <div className="spinner-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default Spinner;