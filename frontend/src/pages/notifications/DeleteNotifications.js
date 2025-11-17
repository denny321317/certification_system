import React, { useState, useEffect, useContext } from 'react';
import './DeleteNotifications.css';
import { AuthContext } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const DeleteNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchAllNotifications = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/notifications/all');
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        const data = await response.json();
        setNotifications(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllNotifications();
  }, []);

  const handleDelete = async (notificationId) => {
    if (window.confirm('您確定要永久刪除這則通知嗎? 所有收到這則通知的用戶將再也看不見這則通知。此動作無法還原。')) {
      try {
        const response = await fetch(`http://localhost:8000/api/notifications/${notificationId}/proper-delete`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setNotifications(prev => prev.filter(n => n.id !== notificationId));
        } else {
          throw new Error('Failed to delete notification');
        }
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const formatTimestamp = (timestampArray) => {
    if (!Array.isArray(timestampArray) || timestampArray.length < 6) return 'Invalid Date';
    const [year, month, day, hour, minute, second] = timestampArray;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
  };

  const getSender = (senderId) => {
    return senderId === -1 ? 'System Generated' : `User ID: ${senderId}`;
  };

  if (loading) return <div>Loading notifications...</div>;
  if (error) return <div>Error: {error}</div>;
  if (currentUser?.roleDTO?.id !== 1) return <div>Access Denied. Admins only.</div>;

  return (
    <div className="delete-notifications-container">
      <div className="delete-notifications-card">
        <h2 className="delete-notifications-title">刪除通知</h2>
        <p>在此處刪除通知將會對所有用戶刪除</p>
        {notifications.length === 0 ? (
          <p>There are no notifications in the system.</p>
        ) : (
          <ul className="delete-notifications-list">
            {notifications.map((notification) => (
              <li key={notification.id} className="delete-notification-item">
                <div className="notification-details">
                  <div className="notification-item-header">
                    <strong className="notification-item-topic">{notification.topic}</strong>
                    <span className="notification-item-timestamp">{formatTimestamp(notification.timestamp)}</span>
                  </div>
                  <p className="notification-item-content">{notification.content}</p>
                  <div className="notification-item-footer">
                    <small>Sender: {getSender(notification.senderId)}</small>
                    <small>Recipients: {notification.userIds.join(', ')}</small>
                  </div>
                </div>
                <button
                  className="delete-notification-button"
                  onClick={() => handleDelete(notification.id)}
                  title="Delete Notification Permanently"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DeleteNotification;