import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);

  // 如果正在加載用戶信息，顯示加載中
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">載入中...</span>
        </div>
      </div>
    );
  }

  // 如果未登入，重定向到登入頁面
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 如果已登入，渲染子組件
  return children;
};

export default PrivateRoute; 