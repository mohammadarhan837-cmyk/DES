import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Notifications.css';
import Toast from '../components/Toast';
import useToast from '../components/useToast';

const initialNotifications = [
  {
    id: 1,
    type: 'payment',
    title: 'Payment Locked in Escrow',
    message: 'Client Ali Hassan has locked 0.5 ETH in escrow for project "E-commerce Website".',
    time: '2 hours ago',
    read: false,
    icon: '🔒'
  },
  {
    id: 2,
    type: 'project',
    title: 'New Project Application',
    message: 'Sara Khan has applied to your project "Mobile App UI Design".',
    time: '5 hours ago',
    read: false,
    icon: '📋'
  },
  {
    id: 3,
    type: 'dispute',
    title: 'Dispute Raised',
    message: 'A dispute has been raised for project "Backend API Development". Please review.',
    time: '1 day ago',
    read: false,
    icon: '⚠️'
  },
  {
    id: 4,
    type: 'payment',
    title: 'Payment Released',
    message: 'Payment of 0.3 ETH has been released for project "Portfolio Website".',
    time: '2 days ago',
    read: true,
    icon: '✅'
  },
  {
    id: 5,
    type: 'project',
    title: 'Project Completed',
    message: 'Freelancer Rahul Dev has submitted work for "Smart Contract Audit". Please review.',
    time: '3 days ago',
    read: true,
    icon: '🎉'
  },
  {
    id: 6,
    type: 'system',
    title: 'Welcome to EscrowChain!',
    message: 'Your account has been created successfully. Start by posting a project or browsing available work.',
    time: '5 days ago',
    read: true,
    icon: '🔐'
  }
];

function Notifications() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeFilter, setActiveFilter] = useState('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read!', 'success');
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
    showToast('Notification deleted!', 'info');
  };

  const clearAll = () => {
    setNotifications([]);
    showToast('All notifications cleared!', 'info');
  };

  const getTypeClass = (type) => {
    switch (type) {
      case 'payment':  return 'type-payment';
      case 'project':  return 'type-project';
      case 'dispute':  return 'type-dispute';
      case 'system':   return 'type-system';
      default:         return '';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'all')    return true;
    if (activeFilter === 'unread') return !n.read;
    return n.type === activeFilter;
  });

  return (
    <div className="notifications-page">

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* ── HEADER ── */}
      <div className="notifications-header">
        <div>
          <h1>🔔 Notifications</h1>
          <p>
            You have{' '}
            <strong>{unreadCount} unread</strong>{' '}
            notifications
          </p>
        </div>
        <div className="notifications-actions">
          <button
            className="btn-mark-all"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            ✅ Mark All as Read
          </button>
          <button
            className="btn-clear-all"
            onClick={clearAll}
            disabled={notifications.length === 0}
          >
            🗑️ Clear All
          </button>
        </div>
      </div>

      {/* ── FILTER TABS ── */}
      <div className="notification-filters">
        {['all', 'unread', 'payment', 'project', 'dispute', 'system'].map(
          (filter) => (
            <button
              key={filter}
              className={`filter-btn
                ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter === 'all'     && '📬 All'}
              {filter === 'unread'  && `🔴 Unread (${unreadCount})`}
              {filter === 'payment' && '💰 Payment'}
              {filter === 'project' && '📋 Project'}
              {filter === 'dispute' && '⚠️ Dispute'}
              {filter === 'system'  && '🔐 System'}
            </button>
          )
        )}
      </div>

      {/* ── NOTIFICATIONS LIST ── */}
      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <span>🔔</span>
            <h3>No Notifications</h3>
            <p>You are all caught up! No notifications here.</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card
                ${!notification.read ? 'unread' : ''}
                ${getTypeClass(notification.type)}`}
              onClick={() => markAsRead(notification.id)}
            >
              {/* ── ICON ── */}
              <div className="notification-icon">
                {notification.icon}
              </div>

              {/* ── CONTENT ── */}
              <div className="notification-content">
                <div className="notification-top">
                  <h3>{notification.title}</h3>
                  {!notification.read && (
                    <span className="unread-dot"></span>
                  )}
                </div>
                <p>{notification.message}</p>
                <span className="notification-time">
                  🕐 {notification.time}
                </span>
              </div>

              {/* ── DELETE ── */}
              <button
                className="notification-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notification.id);
                }}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default Notifications;