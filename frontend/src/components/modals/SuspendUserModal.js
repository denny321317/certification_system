import React, { useState, useEffect } from 'react';
// You can create a specific CSS file if needed, or reuse existing modal styles
// import './SuspendUserModal.css'; 

const SuspendUserModal = ({ show, onClose, user, onConfirmSuspend, onConfirmReactivate, isProcessing, error }) => {
  
  useEffect(() => {
    // Reset any local state if needed when modal visibility or user changes
    if (!show) {
      // Clear local error states if any were managed here
    }
  }, [show, user]);

  if (!show || !user) {
    return null;
  }

  const handleSuspend = () => {
    if (window.confirm(`您確定要停用使用者 "${user.name}" 的帳號嗎？此操作將限制其存取權限。`)) {
      onConfirmSuspend(user.id);
    }
  };

  const handleReactivate = () => {
    // Confirmation for reactivation is optional, but can be added if desired
    // if (window.confirm(`您確定要重新啟用使用者 "${user.name}" 的帳號嗎？`)) {
      onConfirmReactivate(user.id);
    // }
  };

  return (
    <div className="modal-backdrop"> {/* Use existing backdrop style or create new */}
      <div className="modal-content"> {/* Use existing content style or create new */}
        <div className="modal-header">
          <h5 className="modal-title">
            {user.suspended ? '重新啟用帳號' : '停用帳號'}
          </h5>
          <button type="button" className="btn-close" onClick={onClose} disabled={isProcessing}></button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-danger">{error}</div>}
          
          <p><strong>使用者名稱:</strong> {user.name}</p>
          <p><strong>電子郵件:</strong> {user.email}</p>
          <hr />

          {user.suspended ? (
            <>
              <p>此使用者帳戶目前為 <strong>已停用</strong> 狀態。</p>
              <p>您確定要重新啟用此帳號嗎？</p>
            </>
          ) : (
            <>
              <p>此使用者帳戶目前為 <strong>啟用</strong> 狀態。</p>
              <p>停用帳號將限制使用者登入及存取系統功能。您確定要繼續嗎？</p>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose} 
            disabled={isProcessing}
          >
            取消
          </button>
          {user.suspended ? (
            <button 
              type="button" 
              className="btn btn-success" // Green button for reactivate
              onClick={handleReactivate}
              disabled={isProcessing}
            >
              {isProcessing ? '處理中...' : '重新啟用帳號'}
            </button>
          ) : (
            <button 
              type="button" 
              className="btn btn-danger" // Red button for suspend
              onClick={handleSuspend}
              disabled={isProcessing}
            >
              {isProcessing ? '處理中...' : '停用帳號'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuspendUserModal;