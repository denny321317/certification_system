/**
 * 企業認證系統前端應用程式
 * 
 * 此檔案是應用程式的根組件，負責：
 * 1. 路由配置和導航管理
 * 2. 身份驗證狀態管理
 * 3. 頁面佈局結構
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// 身份驗證相關頁面
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// 功能模組頁面
import Dashboard from './pages/dashboard/Dashboard';
import DocumentManagement from './pages/document-management/DocumentManagement';
import TemplateCenter from './pages/template-center/TemplateCenter';
import CertificationProjects from './pages/certification-projects/CertificationProjects';
import CertificationProjectDetail from './pages/certification-projects/CertificationProjectDetail';
import CreateCertificationProject from './pages/certification-projects/CreateCertificationProject';
import ReportsAnalysis from './pages/reports-analysis/ReportsAnalysis';
import SupplierManagement from './pages/supplier-management/SupplierManagement';
import NotFound from './pages/not-found/NotFound';
import PrivateRoute from './components/common/PrivateRoute';
import UserManagement from './pages/user-management/UserManagement';
import SystemSettings from './pages/system-settings/SystemSettings';
import Notifications from './pages/notifications/Notifications';
import SendNotification from './pages/notifications/SendNotification';
import DeleteNotification from './pages/notifications/DeleteNotifications';

// 共用組件
import MainLayout from './components/layout/MainLayout';
import './App.css';
import { SettingsProvider } from './contexts/SettingsContext';


/**
 * 受保護的路由組件
 * 用於檢查用戶是否已登入，未登入則重定向到登入頁面
 * @param {Object} props - 組件屬性
 * @param {ReactNode} props.children - 子組件
 */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

/**
 * 應用程式主組件
 * 包含所有路由配置和全局狀態管理
 */
function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <Routes>
            {/* 根路徑重定向到登入頁面 */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* 公開的認證頁面 */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* 需要登入才能訪問的頁面 */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            {/* 文件管理模組 */}
            <Route 
              path="/document-management" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <DocumentManagement />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            {/* 模板中心模組 */}
            <Route 
              path="/template-center" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <TemplateCenter />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            {/* 認證專案模組 */}
            <Route 
              path="/certification-projects" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CertificationProjects />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route
              path='/certification-projects/create'
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CreateCertificationProject />
                  </MainLayout>
                </ProtectedRoute>
              }

            />
            <Route
              path='/certification-projects/:projectId'
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CertificationProjectDetail />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            {/* 報表分析模組 */}
            <Route 
              path="/reports-analysis" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ReportsAnalysis />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            {/* 供應商管理模組 */}
            <Route 
              path="/supplier-management" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <SupplierManagement />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            {/* 用戶管理模組 */}
            <Route 
              path="/user-management" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <UserManagement />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            {/* 系統設定模組 */}
            <Route 
              path="/system-settings" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <SystemSettings />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            {/* 通知模組 */}
            <Route 
              path="/notifications"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Notifications />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route 
              path="/send-notification"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <SendNotification />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="delete-notification"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <DeleteNotification />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App; 