import React, { useEffect } from 'react';
import '../styles/Toast.css';

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">
        {type === 'success' && '✅'}
        {type === 'error'   && '❌'}
        {type === 'warning' && '⚠️'}
        {type === 'info'    && 'ℹ️'}
      </span>
      <p>{message}</p>
      <button className="toast-close" onClick={onClose}>✕</button>
    </div>
  );
}

export default Toast;