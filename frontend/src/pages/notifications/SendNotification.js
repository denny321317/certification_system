import React, { useState, useEffect, useContext } from 'react';
import './SendNotification.css';
import { AuthContext } from '../../contexts/AuthContext';

const SendNotification = () => {
  const { currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    userIds: [],
    topic: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userList, setUserList] = useState([]);  
  const [selectedUserId, setSelectedUserId] = useState('');  // For the dropdown

  // 取得所有用戶
  useEffect(() => {
    fetch('http://localhost:8000/api/user-management/allUsers')
      .then(res => res.json())
      .then(data => {
        setUserList(Array.isArray(data) ? data : []);
      })
      .catch(() => setUserList([]));
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/user-management/allUsers');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchUsers();
  }, [userList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'userIds') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      if (selectedOptions.includes('all')) {
        // If "All Users" is selected, set to all user IDs
        setFormData({ ...formData, userIds: users.map(user => user.id) });
      } else {
        // Otherwise, set to selected IDs
        setFormData({ ...formData, userIds: selectedOptions.map(id => parseInt(id)) });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const payload = {
      userIds: formData.userIds,
      senderId: currentUser.id,  // Automatically set to current user's ID
      topic: formData.topic,
      content: formData.content,
    };

    try {
      const response = await fetch('http://localhost:8000/api/notifications/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setMessage('Notification sent successfully!');
        setFormData({ userIds: [], topic: '', content: '' });
      } else {
        throw new Error('Failed to send notification');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="send-notification-container">
      <div className="send-notification-card">
        <div className="send-notification-card-body">
          <h2 className="send-notification-title">傳送通知</h2>
          <form onSubmit={handleSubmit} className="send-notification-form">
            <div className="form-group">
              <label>發送人 ID:</label>
              <input
                type="text"
                value={currentUser.id}
                readOnly
                className="form-control-plaintext"
              />
            </div>
            <div className="form-group">
            <label htmlFor="userIds">選擇收訊人:</label>
                <select
                    id="userIds"
                    name="userIds"
                    multiple
                    value={formData.userIds}
                    onChange={handleChange}
                    required
                    className="form-select"  // Changed from form-control to form-select for consistency
                >
                    <option value="all">所有使用者</option>
                    {users.map(user => (
                        <option key={user.id} value={user.id}>
                            {user.name} (ID: {user.id})  
                        </option>
                    ))}
                </select>
            </div>
            <div className="form-group">
              <label htmlFor="topic">標題:</label>
              <input
                type="text"
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="content">內容:</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows="4"
                placeholder='通知內容限制 1000 字元以內'
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '送出中...' : '送出通知'}
            </button>
          </form>
          {message && <p className="message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default SendNotification;