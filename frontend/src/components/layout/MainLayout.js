/**
 * 主要佈局組件
 * 
 * 提供應用程式的基本佈局結構，包括：
 * - 側邊導航欄
 * - 頂部導航欄
 * - 搜索功能
 * - 用戶菜單
 * - 通知系統
 */

import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, faFileAlt, faFileContract, faCertificate, 
  faChartBar, faUsers, faUserCog, faCog, faSearch,
  faBell, faSignOutAlt, faUser
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../contexts/AuthContext';
import './MainLayout.css';

/**
 * 主要佈局組件
 * @param {Object} props - 組件屬性
 * @param {ReactNode} props.children - 子組件，將被渲染在主內容區域
 */
const MainLayout = ({ children }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * 導航菜單項目配置
   * @type {Array<{path: string, icon: IconDefinition, label: string}>}
   */
  const menuItems = [
    { path: '/dashboard', icon: faHome, label: '儀表板' },
    { path: '/document-management', icon: faFileAlt, label: '文件管理' },
    { path: '/template-center', icon: faFileContract, label: '模板中心' },
    { path: '/certification-projects', icon: faCertificate, label: '認證專案' },
    { path: '/reports-analysis', icon: faChartBar, label: '報表分析' },
    { path: '/supplier-management', icon: faUsers, label: '供應商管理' },
    { path: '/user-management', icon: faUserCog, label: '用戶管理' },
    { path: '/system-settings', icon: faCog, label: '系統設置' },
  ];

  /**
   * 檢查導航項目是否為當前活動項目
   * @param {string} path - 要檢查的路徑
   * @returns {boolean} 是否為當前活動項目
   */
  const isActive = (path) => {
    if (path === '/dashboard' && pathname === '/') return true;
    return pathname.startsWith(path);
  };

  /**
   * 處理用戶登出
   * 清除認證信息並導航到登入頁面
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /**
   * 處理搜索提交
   * @param {Event} e - 事件對象
   * TODO: 實現實際的搜索功能
   */
  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: 實現搜索功能
    console.log('搜索: ', searchQuery);
  };

  return (
    <div className="layout-container">
      {/* 側邊導航欄 */}
      <aside className="sidebar">
        {/* Logo 區域 */}
        <div className="logo">
          <span className="logo-icon">
            <FontAwesomeIcon icon={faCertificate} />
          </span>
          <span className="logo-text">企業認證系統</span>
        </div>

        {/* 主導航菜單 */}
        <nav className="menu">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="menu-icon">
                <FontAwesomeIcon icon={item.icon} />
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* 主內容區域 */}
      <div className="main-container">
        {/* 頂部導航欄 */}
        <header className="header">
          {/* 搜索欄 */}
          <div className="search-bar">
            <span className="search-icon">
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              type="text"
              className="search-input"
              placeholder="搜索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
            />
          </div>

          {/* 右側工具欄 */}
          <div className="header-right">
            {/* 通知中心 */}
            <div className="notification-bell">
              <FontAwesomeIcon icon={faBell} />
              <span className="notification-badge">3</span>
            </div>

            {/* 用戶菜單 */}
            <div className="user-menu">
              <div className="user-avatar">
                <FontAwesomeIcon icon={faUser} />
              </div>
              <div className="user-info">
                <span className="user-name">{currentUser?.name || '用戶名稱'}</span>
                <span className="user-role">{currentUser?.role.name || '系統管理員'}</span>
              </div>
              <div className="user-dropdown">
                <div className="dropdown-item">
                  <FontAwesomeIcon icon={faUser} /> 個人設置
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item" onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} /> 登出
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 主要內容區域 */}
        <main className="content-container">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 