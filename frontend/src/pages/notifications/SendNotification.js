import React, { useState, useEffect, useContext } from 'react';
import './SendNotification.css';
import { AuthContext } from '../../contexts/AuthContext';

const SendNotification = () => {
  const { currentUser } = useContext(AuthContext);
  const [allUsers, setAllUsers] = useState([]);
  const [formData, setFormData] = useState({
    userIds: [],
    topic: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Fetch all users once on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/user-management/allUsers');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setAllUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchUsers();
  }, []);

  // Handle search query changes
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query) {
      const filtered = allUsers.filter(user =>
        user.name.toLowerCase().includes(query.toLowerCase()) &&
        !formData.userIds.includes(user.id) // Exclude already selected users
      );
      setSearchResults(filtered);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  // Add a user to the selection
  const handleSelectUser = (user) => {
    setFormData(prev => ({
      ...prev,
      userIds: [...prev.userIds, user.id]
    }));
    setSearchQuery('');
    setShowResults(false);
  };

  // Remove a user from the selection
  const handleRemoveUser = (userId) => {
    setFormData(prev => ({
      ...prev,
      userIds: prev.userIds.filter(id => id !== userId)
    }));
  };

  // Select all users
  const handleSelectAll = () => {
    setFormData(prev => ({
      ...prev,
      userIds: allUsers.map(user => user.id)
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.userIds.length === 0) {
      setMessage('Please select at least one recipient.');
      return;
    }
    setLoading(true);
    setMessage('');

    const payload = {
      userIds: formData.userIds,
      senderId: currentUser.id,
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

  const selectedUsers = allUsers.filter(user => formData.userIds.includes(user.id));

  return (
    <div className="send-notification-container">
      <div className="send-notification-card">
        <div className="send-notification-card-body">
          <h2 className="send-notification-title">傳送通知</h2>
          <form onSubmit={handleSubmit} className="send-notification-form">
            <div className="form-group">
              <label>發送人:</label>
              <input
                type="text"
                value={`${currentUser.name} (ID: ${currentUser.id})`}
                readOnly
                className="form-control-plaintext"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="userSearch">選擇收訊人:</label>
              <div className="recipient-pills">
                {selectedUsers.map(user => (
                  <div key={user.id} className="pill">
                    {user.name}
                    <button type="button" onClick={() => handleRemoveUser(user.id)}>&times;</button>
                  </div>
                ))}
              </div>
              <div className="search-container">
                <input
                  type="text"
                  id="userSearch"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery && setShowResults(true)}
                  onBlur={() => setTimeout(() => setShowResults(false), 150)}
                  placeholder="搜尋使用者名稱..."
                  autoComplete="off"
                />
                {showResults && searchResults.length > 0 && (
                  <ul className="search-results">
                    {searchResults.map(user => (
                      <li key={user.id} onClick={() => handleSelectUser(user)}>
                        {user.name} (ID: {user.id})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button type="button" className="btn-select-all" onClick={handleSelectAll}>
                選擇所有使用者
              </button>
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