import React, { useState, useEffect } from 'react';
// You can create a new CSS file or reuse styles if applicable
// import './ChangeRoleNameModal.css'; 

const ChangeRoleNameModal = ({ show, onClose, currentRoleName, onSave, error }) => {
  const [newRoleName, setNewRoleName] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (show) {
      // Reset fields when modal becomes visible
      setNewRoleName('');
      setValidationError('');
    }
  }, [show]);

  if (!show) {
    return null;
  }

  const handleNameChange = (e) => {
    setNewRoleName(e.target.value);
    if (validationError) {
      setValidationError(''); // Clear validation error on input change
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      setValidationError('新的角色名稱不能為空。');
      return;
    }
    if (newRoleName.trim() === currentRoleName) {
      setValidationError('新的角色名稱不能與目前名稱相同。');
      return;
    }
    // onSave will be responsible for making the API call
    onSave(currentRoleName, newRoleName.trim());
  };

  return (
    <div className="modal-backdrop-edit-user"> {/* You can reuse or create new backdrop styles */}
      <div className="modal-content-edit-user"> {/* You can reuse or create new content styles */}
        <form onSubmit={handleSubmit}>
          <div className="modal-header-edit-user"> {/* You can reuse or create new header styles */}
            <h5 className="modal-title-edit-user">更改角色名稱</h5> {/* Title */}
            <button type="button" className="btn-close-edit-user" onClick={onClose} aria-label="Close"></button>
          </div>

          <div className="modal-body-edit-user"> {/* You can reuse or create new body styles */}
            <div className="mb-3">
              <label htmlFor="currentRoleNameDisplay" className="form-label">目前角色名稱</label>
              <input
                type="text"
                className="form-control"
                id="currentRoleNameDisplay"
                value={currentRoleName}
                readOnly // This field is for display only
              />
            </div>

            <div className="mb-3">
              <label htmlFor="newRoleNameInput" className="form-label">新的角色名稱</label>
              <input
                type="text"
                className={`form-control ${validationError ? 'is-invalid' : ''}`}
                id="newRoleNameInput"
                name="newRoleName"
                value={newRoleName}
                onChange={handleNameChange}
                required
                placeholder="請輸入新的角色名稱"
              />
              {validationError && <div className="invalid-feedback">{validationError}</div>}
            </div>
            
            {error && <div className="alert alert-danger mt-3">{error}</div>}

          </div>

          <div className="modal-footer-edit-user"> {/* You can reuse or create new footer styles */}
            <button type="button" className="btn btn-secondary" onClick={onClose}>取消</button>
            <button type="submit" className="btn btn-primary">儲存變更</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeRoleNameModal;