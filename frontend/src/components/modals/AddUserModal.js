import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddUserModal.css'; // We'll create this CSS file next

const AddUserModal = ({ show, onClose, API_BASE_URL, rolesList, onUserAddedSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRoleName, setSelectedRoleName] = useState('');
  const [department, setDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    // Pre-select the first role if rolesList is available and no role is selected
    if (show && rolesList && rolesList.length > 0 && !selectedRoleName) {
      setSelectedRoleName(rolesList[0].name);
    }
    // Reset form when modal is opened/closed or rolesList changes
    if (!show) {
        setName('');
        setEmail('');
        setDepartment('');
        setSelectedRoleName(rolesList && rolesList.length > 0 ? rolesList[0].name : '');
        setSubmitError(null);
        setIsSubmitting(false);
    }
  }, [show, rolesList]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !selectedRoleName) {
      setSubmitError('姓名、電子郵件和角色為必填欄位。');
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);

    const newUser = {
      name,
      email,
      roleName: selectedRoleName,
      department: department || null, // Send null if department is empty
    };

    try {
      await axios.post(`${API_BASE_URL}/user-management/createUser`, newUser);
      onUserAddedSuccess(); // Callback to refresh user list in parent
      onClose(); // Close the modal
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || '新增使用者失敗，請稍後再試。');
      console.error("Error creating user:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">新增使用者</h5>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {submitError && <div className="alert alert-danger">{submitError}</div>}
            <div className="mb-3">
              <label htmlFor="userName" className="form-label">姓名 <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                id="userName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="userEmail" className="form-label">電子郵件 <span className="text-danger">*</span></label>
              <input
                type="email"
                className="form-control"
                id="userEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="userRole" className="form-label">角色 <span className="text-danger">*</span></label>
              <select
                className="form-select"
                id="userRole"
                value={selectedRoleName}
                onChange={(e) => setSelectedRoleName(e.target.value)}
                required
              >
                <option value="" disabled>選擇一個角色</option>
                {rolesList && rolesList.map(role => (
                  // Assuming role object has 'name' property for display and value
                  <option key={role.id || role.name} value={role.name}>{role.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="userDepartment" className="form-label">部門</label>
              <input
                type="text"
                className="form-control"
                id="userDepartment"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>取消</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? '提交中...' : '新增使用者'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;