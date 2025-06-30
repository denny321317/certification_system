import React, { useState, useEffect } from 'react';
import './EditUserInfoModal.css';

const EditUserInfoModal = ({ show, onClose, user, allRoles = [], allProjects = [], onSave }) => {
  const [formData, setFormData] = useState({});
  const [emailError, setEmailError] = useState('');
  const [projectToAddId, setProjectToAddId] = useState('');
  const [roleInNewProject, setRoleInNewProject] = useState('');

  useEffect(() => {
    if (user && show) {
      setFormData({
        id: user.id || null,
        name: user.name || '',
        email: user.email || '',
        roleName: user.role?.name || user.role || '',
        department: user.department || '',
        
      });
      setEmailError('');
      setProjectToAddId('');
      setRoleInNewProject('');
    } else if (!show) {
      // Clear form when modal is hidden to avoid stale data on reopen
      setFormData({});
      setEmailError('');
      setProjectToAddId('');
      setRoleInNewProject('');
    }
  }, [user, show]);

  if (!show) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'email') {
      validateEmail(value);
    }
  };

  const validateEmail = (email) => {
    if (!email) {
      setEmailError('電子郵件不能為空');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('請輸入有效的電子郵件格式');
      return false;
    }
    setEmailError('');
    return true;
  };



  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('姓名不能為空。');
      return;
    }
    if (!validateEmail(formData.email)) {
      alert('電子郵件格式不正確或為空。');
      return;
    }
    if (!formData.department?.trim()) {
      alert('部門不能為空。');
      return;
    }
    if (!formData.roleName) {
      alert('角色不能為空。');
      return;
    }
    // The onSave function receives the current formData.
    // The parent component is responsible for any transformations needed for the backend API.

    const finalData = {...formData};
    if (user && user.projectMemberships) {
        finalData.projectMemberships = user.projectMemberships;
    }

    onSave(finalData);
  };

  const availableProjectsForAdding = allProjects.filter(
    p => !formData.projectMemberships?.some(pm => pm.projectId === p.id)
  );

  return (
    <div className="modal-backdrop-edit-user">
      <div className="modal-content-edit-user">
        <form onSubmit={handleSubmit}>
          <div className="modal-header-edit-user">
            <h5 className="modal-title-edit-user">編輯使用者資訊</h5>
            <button type="button" className="btn-close-edit-user" onClick={onClose} aria-label="Close"></button>
          </div>

          <div className="modal-body-edit-user">
            <div className="mb-3">
              <label htmlFor="editUserName" className="form-label">姓名 (Name)</label>
              <input
                type="text"
                className="form-control"
                id="editUserName"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="editUserEmail" className="form-label">電子郵件 (Email)</label>
              <input
                type="email"
                className={`form-control ${emailError ? 'is-invalid' : ''}`}
                id="editUserEmail"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                required
              />
              {emailError && <div className="invalid-feedback">{emailError}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="editUserRole" className="form-label">角色 (Role)</label>
              <select
                className="form-select"
                id="editUserRole"
                name="roleName"
                value={formData.roleName || ''}
                onChange={handleChange}
                required
              >
                <option value="" disabled>請選擇一個角色</option>
                {allRoles.map(role => (
                  <option key={role.id || role.name} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="editUserDepartment" className="form-label">部門 (Department)</label>
              <input
                type="text"
                className="form-control"
                id="editUserDepartment"
                name="department"
                value={formData.department || ''}
                onChange={handleChange}
                required
              />
            </div>


           
          </div>

          <div className="modal-footer-edit-user">
            <button type="button" className="btn btn-secondary" onClick={onClose}>取消</button>
            <button type="submit" className="btn btn-primary">儲存變更</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserInfoModal;