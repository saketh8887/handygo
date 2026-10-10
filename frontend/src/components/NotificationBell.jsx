import React, { useState, useEffect } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      if (res.data && res.data.data) {
        setNotifications(res.data.data);
        const count = res.data.data.filter((n) => !n.isRead).length;
        setUnreadCount(count);
      }
    } catch (err) {
      console.warn('Could not fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div className="dropdown position-relative">
      <button
        className="btn btn-light position-relative p-2 rounded-circle border-0 shadow-sm"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <Bell size={20} className="text-secondary" />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount > 9 ? '9+' : unreadCount}
            <span className="visually-hidden">unread notifications</span>
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="dropdown-menu dropdown-menu-end show shadow-lg p-0 mt-2"
          style={{ width: '340px', maxHeight: '420px', display: 'flex', flexDirection: 'column' }}
        >
          <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
            <h6 className="mb-0 fw-bold">Notifications</h6>
            {unreadCount > 0 && (
              <button
                className="btn btn-sm btn-link p-0 text-decoration-none small text-primary"
                onClick={markAllAsRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="overflow-auto flex-grow-1" style={{ maxHeight: '300px' }}>
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted small">
                No notifications right now
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 border-bottom position-relative ${
                    n.isRead ? 'bg-white' : 'bg-light bg-opacity-75'
                  }`}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <span className="fw-semibold small text-dark">{n.title}</span>
                    {!n.isRead && (
                      <button
                        className="btn btn-sm btn-link p-0 text-success ms-2"
                        title="Mark read"
                        onClick={(e) => markAsRead(n.id, e)}
                      >
                        <Check size={16} />
                      </button>
                    )}
                  </div>
                  <p className="mb-1 text-muted small mt-1" style={{ fontSize: '0.82rem' }}>
                    {n.message}
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-secondary" style={{ fontSize: '0.72rem' }}>
                      {new Date(n.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </small>
                    {n.referenceType === 'BOOKING' && n.referenceId && (
                      <Link
                        to={`/bookings/${n.referenceId}`}
                        className="small text-primary text-decoration-none"
                        onClick={() => setIsOpen(false)}
                      >
                        View Job <ExternalLink size={12} className="ms-1" />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
