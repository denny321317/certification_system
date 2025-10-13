import React, { useState, useEffect, useContext } from 'react';
import './Notifications.css';
import { AuthContext } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useContext(AuthContext);

  console.log(currentUser)

  useEffect(() => {
    fetchNotifications();
  }, [currentUser]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/notifications/user/${currentUser.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();

      data.sort((a, b) => {
        const aTime = new Date(a.timestamp[0], a.timestamp[1] - 1, a.timestamp[2], a.timestamp[3], a.timestamp[4], a.timestamp[5]);
        const bTime = new Date(b.timestamp[0], b.timestamp[1] - 1, b.timestamp[2], b.timestamp[3], b.timestamp[4], b.timestamp[5]);
        return bTime - aTime; // Descending order
      });

      setNotifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/notifications/${currentUser.id}/${notificationId}/read`, {
        method: 'PUT',
      });
      if (response.ok) {
        // Update local state to mark as read
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
      } else {
        throw new Error('Failed to mark as read');
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  // Helper to format timestamp array into a readable string
  const formatTimestamp = (timestampArray) => {
    if (!Array.isArray(timestampArray) || timestampArray.length < 7) return 'Invalid Date';
    const [year, month, day, hour, minute, second] = timestampArray;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
  };

  // Helper to get sender display
  const getSender = (senderId) => {
    return senderId === -1 ? '系統自動生成' : `User ${senderId}`;
  };

  if (loading) return <div>Loading notifications...</div>;
  if (error) return <div>Error: {error}</div>;

  const isAdmin = currentUser && currentUser.roleDTO && currentUser.roleDTO.id === 1; 


  return (
    <div className="notifications-container">
      <div className="notifications-card">
        <div className="notifications-card-body">
          <div className='notification-header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="notifications-title">您的通知</h2>
            {isAdmin && (
              <Link to="/send-notification" className="btn btn-primary">
                傳送通知
              </Link>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="no-notifications">目前沒有通知</p>
          ) : (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-card ${!notification.read ? 'unread' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-header">
                    <div className="notification-topic">{notification.topic}</div>
                    <div className="notification-timestamp">{formatTimestamp(notification.timestamp)}</div>
                  </div>
                  <div className="notification-content">{notification.content}</div>
                  <div className="notification-sender">Sender: {getSender(notification.senderId)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;