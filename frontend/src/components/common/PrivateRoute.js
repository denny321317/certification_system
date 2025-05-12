/**
 * 私有路由組件
 * 
 * 此組件用於保護需要認證的路由，包含：
 * 1. 用戶認證狀態檢查
 * 2. 載入狀態處理
 * 3. 未認證用戶重定向
 * 
 * 特點：
 * - 自動檢查用戶認證狀態
 * - 提供載入中狀態顯示
 * - 未登入用戶自動重定向到登入頁面
 * - 支持嵌套路由保護
 * 
 * 使用方式：
 * ```jsx
 * <PrivateRoute>
 *   <ProtectedComponent />
 * </PrivateRoute>
 * ```
 */

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

/**
 * 私有路由組件
 * @param {Object} props - 組件屬性
 * @param {ReactNode} props.children - 子組件，只有在用戶已認證時才會渲染
 * @returns {JSX.Element} 根據認證狀態返回對應的組件或重定向
 */
const PrivateRoute = ({ children }) => {
  /**
   * 從認證上下文獲取當前用戶狀態和載入狀態
   * @type {{currentUser: Object|null, loading: boolean}}
   */
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