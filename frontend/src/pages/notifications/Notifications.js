import React, { useState, useEffect, useContext } from 'react';
import './Notifications.css';  // Optional CSS file
import { AuthContext } from '../../contexts/AuthContext';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        const fetchNotifications = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/users/notifications/${currentUser.id}`);
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

        fetchNotifications();
    }, []);

    if (loading) return <div>Loading notifications...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
    <div className="notifications-container">
        <div className="notifications-card">
        <div className="notifications-card-body">
            <h2 className="notifications-title">Your Notifications</h2>
            {notifications.length === 0 ? (
            <p className="no-notifications">No notifications yet.</p>
            ) : (
            <ul className="notifications-list">
                {notifications.map((notification, index) => (
                <li key={index} className="notification-item">
                    {notification}
                </li>
                ))}
            </ul>
            )}
        </div>
        </div>
    </div>
    );

};

export default Notifications;