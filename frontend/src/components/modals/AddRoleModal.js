import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddRoleModal.css';


const authorizationConfig = [
  { page: '系統設定 (System Settings)', readIndex: 0, writeIndex: 1 },
  { page: '用戶管理 (User Management)', readIndex: 2, writeIndex: 3 },
  { page: '文件管理 (Document Management)', readIndex: 4, writeIndex: 5 },
  { page: '模板中心 (Template Center)', readIndex: 6, writeIndex: 7 },
  { page: '認證專案 (Certification Projects)', readIndex: 8, writeIndex: 9 },
  { page: '報表分析 (Report Management)', readIndex: 10, writeIndex: 11 },
  { page: '供應商管理 (Supplier Management)', readIndex: 12, writeIndex: 13 },
  { page: '儀表板 (Dashboard)', readIndex: 14, writeIndex: 15 },
];

const AddRoleModal = ({ show, onClose, API_BASE_URL, onRoleAddedSuccess }) => {
  const [roleName, setRoleName] = useState('');
  // Initialize an array of 16 booleans for authorizations
  const [authorizations, setAuthorizations] = useState(Array(16).fill(false));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (show) {
      // Reset form when modal is shown
      setRoleName('');
      setAuthorizations(Array(16).fill(false));
      setSubmitError(null);
      setIsSubmitting(false);
    }
  }, [show]);

  const handleAuthorizationChange = (index, checked) => {
    const newAuthorizations = [...authorizations];
    newAuthorizations[index] = checked;
    setAuthorizations(newAuthorizations);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roleName.trim()) {
      setSubmitError('角色名稱為必填欄位。');
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);

    const newRole = {
      roleName: roleName.trim(),
      authorizations: authorizations, // Send the array of 16 booleans
    };

    try {
      await axios.post(`${API_BASE_URL}/user-management/createRole`, newRole);
      onRoleAddedSuccess(); // Callback to refresh role list or perform other actions
      onClose(); // Close the modal
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || '新增角色失敗，請稍後再試。');
      console.error("Error creating role:", err);
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
          <h5 className="modal-title">新增角色</h5>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {submitError && <div className="alert alert-danger">{submitError}</div>}
            <div className="mb-3">
              <label htmlFor="roleName" className="form-label">角色名稱 <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                id="roleName"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">權限設定:</label>
              {authorizationConfig.map(({ page, readIndex, writeIndex }) => (
                <div key={page} className="mb-2 p-2 border rounded">
                  <h6>{page}</h6>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`read-${readIndex}`}
                      checked={authorizations[readIndex]}
                      onChange={(e) => handleAuthorizationChange(readIndex, e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor={`read-${readIndex}`}>讀取</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`write-${writeIndex}`}
                      checked={authorizations[writeIndex]}
                      onChange={(e) => handleAuthorizationChange(writeIndex, e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor={`write-${writeIndex}`}>寫入</label>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>取消</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? '提交中...' : '新增角色'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoleModal;