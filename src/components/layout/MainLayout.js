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

const MainLayout = ({ children }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');

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

  const isActive = (path) => {
    if (path === '/dashboard' && pathname === '/') return true;
    return pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // 實現搜索功能
    console.log('搜索: ', searchQuery);
  };

  return (
    <div className="layout-container">
      {/* 側邊欄 */}
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-icon">
            <FontAwesomeIcon icon={faCertificate} />
          </span>
          <span className="logo-text">企業認證系統</span>
        </div>
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
          <div className="header-right">
            <div className="notification-bell">
              <FontAwesomeIcon icon={faBell} />
              <span className="notification-badge">3</span>
            </div>
            <div className="user-menu">
              <div className="user-avatar">
                <FontAwesomeIcon icon={faUser} />
              </div>
              <div className="user-info">
                <span className="user-name">{currentUser?.name || '用戶名稱'}</span>
                <span className="user-role">{currentUser?.role || '系統管理員'}</span>
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

        {/* 頁面內容 */}
        <main className="content-container">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 