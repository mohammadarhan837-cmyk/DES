import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotFound.css';

function NotFound() {
  return (
    <div className="notfound-page">
      <div className="notfound-content">
        <h1>404</h1>
        <div className="notfound-icon">🔍</div>
        <h2>Page Not Found</h2>
        <p>Oops! The page you are looking for does not exist or has been moved.</p>
        <Link to="/" className="notfound-btn">← Go Back Home</Link>
      </div>
    </div>
  );
}

export default NotFound;