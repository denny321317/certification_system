import React from 'react';
import './UserInfoModal.css'; 

const UserInfoModal = ({ show, onClose, user }) => {
  if (!show || !user) {
    return null;
  }

  const renderDetail = (label, value) => (
    <div className="user-info-detail">
      <strong>{label}:</strong> <span>{value || 'N/A'}</span>
    </div>
  );

  return (
    <div className="modal-backdrop-user-info">
      <div className="modal-content-user-info">
        <div className="modal-header-user-info">
          <h5 className="modal-title-user-info">使用者詳細資訊</h5>
          <button type="button" className="btn-close-user-info" onClick={onClose}></button>
        </div>
        <div className="modal-body-user-info">
          {user.suspended && (
            <div className='alert alert-danger' role='alert'>
              <strong>注意: </strong> 此使用者帳戶已被停用。
            </div>
          )}
          {renderDetail('User ID', user.id)}
          {renderDetail('姓名 (Name)', user.name)}
          {renderDetail('電子郵件 (Email)', user.email)}
          {renderDetail('角色 (Role)', user.role?.name || user.role)}
          {renderDetail('部門 (Department)', user.department)}
          {renderDetail('狀態 (Status)', user.online ? '在線 (Online)' : '離線 (Offline)')}
          {renderDetail('上次登入 (Last Login)', user.lastTimeLogin ? new Date(user.lastTimeLogin).toLocaleString() : 'N/A')}
          {renderDetail('密碼重設權杖 (Password Reset Token)', user.passwordResetToken)}

          <hr className="my-3" />
          <h6>參與的專案 (Projects Involved):</h6>
          {user.projectMemberships && user.projectMemberships.length > 0 ? (
            <ul className="list-group">
              {user.projectMemberships.map(membership => (
                <li key={membership.projectTeamId || membership.project?.id} className="list-group-item d-flex justify-content-between align-items-center">
                  {membership.project?.name || "專案名稱未提供"}
                  <span className="badge bg-secondary rounded-pill">{membership.roleInProject || '未指定角色'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>該使用者目前未參與任何專案。</p>
          )}
        </div>
        <div className="modal-footer-user-info">
          <button type="button" className="btn btn-secondary" onClick={onClose}>關閉</button>
        </div>
      </div>
    </div>
  );
};

export default UserInfoModal;