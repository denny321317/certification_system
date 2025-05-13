/**
 * 企業認證系統前端應用程式
 * 
 * 此檔案是應用程式的根組件，負責：
 * 1. 路由配置和導航管理
 * 2. 身份驗證狀態管理
 * 3. 頁面佈局結構
 */

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// 頁面和組件引入
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/dashboard/Dashboard';
import CertificationProjects from './pages/certification-projects/CertificationProjects';
import CertificationProjectDetail from './pages/certification-projects/CertificationProjectDetail';
import CreateCertificationProject from './pages/certification-projects/CreateCertificationProject';
import UserManagement from './pages/user-management/UserManagement';
import TemplateCenter from './pages/template-center/TemplateCenter';
import SystemSettings from './pages/system-settings/SystemSettings';
import ReportsAnalysis from './pages/reports-analysis/ReportsAnalysis';
import SupplierManagement from './pages/supplier-management/SupplierManagement';
import DocumentManagement from './pages/document-management/DocumentManagement';
import NotFound from './pages/not-found/NotFound';
import Login from './pages/auth/Login';
import PrivateRoute from './components/common/PrivateRoute';

// 上下文提供者
import { AuthProvider } from './contexts/AuthContext';

/**
 * 應用程式主組件
 * 包含所有路由配置和全局狀態管理
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="certification-projects" element={<CertificationProjects />} />
            <Route path="certification-projects/create" element={<CreateCertificationProject />} />
            <Route path="certification-projects/:projectId" element={<CertificationProjectDetail />} />
            <Route path="supplier-management" element={<SupplierManagement />} />
            <Route path="reports-analysis" element={<ReportsAnalysis />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="template-center" element={<TemplateCenter />} />
            <Route path="system-settings" element={<SystemSettings />} />
            <Route path="document-management" element={<DocumentManagement />} />
            <Route path="document-management/:folderId" element={<DocumentManagement />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; 