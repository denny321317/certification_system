import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/dashboard/Dashboard';
import DocumentManagement from './pages/document-management/DocumentManagement';
import TemplateCenter from './pages/template-center/TemplateCenter';
import CertificationProjects from './pages/certification-projects/CertificationProjects';
import ReportsAnalysis from './pages/reports-analysis/ReportsAnalysis';
import SupplierManagement from './pages/supplier-management/SupplierManagement';
import UserManagement from './pages/user-management/UserManagement';
import SystemSettings from './pages/system-settings/SystemSettings';
import MainLayout from './components/layout/MainLayout';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 根路徑重定向到登入頁面 */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 認證頁面 */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* 受保護的路由 */}
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
            path="/reports-analysis" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ReportsAnalysis />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; 