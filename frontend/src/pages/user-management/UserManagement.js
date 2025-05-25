/**
 * 用戶管理組件
 * 
 * 此組件提供企業認證系統的用戶管理功能，包含：
 * 1. 用戶列表展示和搜索
 * 2. 用戶角色管理
 * 3. 用戶權限設置
 * 4. 用戶狀態監控
 * 5. 用戶統計分析
 * 
 * 特點：
 * - 支持多種用戶角色（管理員、審核員等）
 * - 提供用戶搜索和篩選
 * - 詳細的權限管理系統
 * - 即時的用戶狀態顯示
 * - 完整的用戶統計信息
 * 
 * 使用方式：
 * ```jsx
 * <UserManagement />
 * ```
 */

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faSearch,
  faPencil,
  faEye,
  faLock,
  faPerson,
  faShield,
  faBriefcase,
  faClipboardCheck,
  faCircle
} from '@fortawesome/free-solid-svg-icons';
import './UserManagement.css';

/**
 * 用戶管理組件
 * @returns {JSX.Element} 用戶管理界面
 */
const UserManagement = () => {
  /**
   * 當前選中的標籤狀態
   * @type {[string, Function]} [當前標籤, 設置當前標籤的函數]
   */
  const [activeTab, setActiveTab] = useState('所有使用者');

  /**
   * 搜索關鍵字狀態
   * @type {[string, Function]} [搜索關鍵字, 設置搜索關鍵字的函數]
   */
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * 當前選中的角色狀態
   * @type {[string, Function]} [當前角色, 設置當前角色的函數]
   */
  const [selectedRole, setSelectedRole] = useState('系統管理員');

  /**
   * 當前頁碼狀態
   * @type {[number, Function]} [當前頁碼, 設置頁碼的函數]
   */
  const [currentPage, setCurrentPage] = useState(1);
  
  /**
   * 用戶數據列表
   * @type {Array<{
   *   id: number,           // 用戶ID
   *   name: string,         // 用戶名稱
   *   email: string,        // 電子郵件
   *   role: string,         // 用戶角色
   *   department: string,   // 所屬部門
   *   status: string,       // 用戶狀態
   *   lastLogin: string     // 最後登入時間
   * }>}
   */

  /* the old users const used for presentation before the API
  const users = [
    {
      id: 1,
      name: '王大明',
      email: 'wang@example.com',
      role: 'admin',
      department: '資訊部',
      status: 'active',
      lastLogin: '2023-09-20 14:30'
    },
    {
      id: 2,
      name: '李小華',
      email: 'lee@example.com',
      role: 'manager',
      department: '品質管理部',
      status: 'active',
      lastLogin: '2023-09-20 11:45'
    },
    {
      id: 3,
      name: '陳美玲',
      email: 'chen@example.com',
      role: 'auditor',
      department: '合規部',
      status: 'inactive',
      lastLogin: '2023-09-19 16:20'
    },
    {
      id: 4,
      name: '張志明',
      email: 'chang@example.com',
      role: 'user',
      department: '生產部',
      status: 'inactive',
      lastLogin: '2023-09-18 09:10'
    },
    {
      id: 5,
      name: '林宏達',
      email: 'lin@example.com',
      role: 'manager',
      department: '供應鏈管理部',
      status: 'active',
      lastLogin: '2023-09-20 10:05'
    },
    {
      id: 6,
      name: '吳雅琪',
      email: 'wu@example.com',
      role: 'auditor',
      department: '合規部',
      status: 'inactive',
      lastLogin: '2023-09-19 15:30'
    },
    {
      id: 7,
      name: '林小美',
      email: 'lin@example.com',
      role: 'manager',
      department: '人力資源部',
      status: 'active',
      lastLogin: '2023-09-20 10:15'
    },
    {
      id: 8,
      name: '吳建志',
      email: 'wu@example.com',
      role: 'manager',
      department: '研發部',
      status: 'active',
      lastLogin: '2023-09-20 09:30'
    },
    {
      id: 9,
      name: '黃麗華',
      email: 'huang@example.com',
      role: 'manager',
      department: '業務部',
      status: 'inactive',
      lastLogin: '2023-09-19 17:45'
    }
  ];
  */

  const [users, setUsers] = useState([]); // init empty array
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState(null);

  /**
   * User statistics state
   * @type {[{totalUsers: number, usersByRole: Object, onlineUsers: number} | null, Function]}
   */
  const [userStats, setUserStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState(null);

  // API base URL
  const API_BASE_URL = 'http://localhost:3000/api';
  /** 
   * 原本沒有的新 Function
   * 用來從後段 API 獲取資料
  */
  useEffect(() => {
    // fetch all users
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setErrorUsers(null);
      try{
        const response = await axios.get(`${API_BASE_URL}/user-management/allUsers`);
        setUsers(response.data);
      } catch (err) {
        setErrorUsers('無法獲取使用者列表: ' + (err.response?.data?.message || err.message));
        console.error("Error fetching users: ", err);
      } finally {
        setLoadingUsers(false);
      }
    };
    
    const fetchUserStats = async () => {
      setLoadingStats(true);
      setErrorStats(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/user-management/stats`);
        setUserStats(response.data);
      } catch (err) {
        setErrorStats('無法獲取使用者統計資料: ' + (err.response?.data?.message || err.message));
        console.error("Error featching user stats: ", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchUsers();
    fetchUserStats();
  }, []); // Empty dependency array means this runs once when the component mounts




  /**
   * 根據當前標籤和搜索關鍵字過濾用戶
   * @returns {Array} 過濾後的用戶列表
   */
  const filteredUsers = users.filter(user => {

    const userRoleName = user.role && typeof user.role === 'object' ? user.role.name : user.role;

    // 標籤篩選
    if (activeTab === '管理員' && userRoleName !== 'Admin') return false;
    if (activeTab === '審核員' && userRoleName !== 'Auditor') return false;
    if (activeTab === '一般使用者' && userRoleName !== 'User') return false;
    if (activeTab === '經理' && userRoleName !== 'Manager') return false;
    if (activeTab === '訪客' && userRoleName !== 'Guest') return false;
    
    // 搜索篩選
    if (searchTerm && 
        !user.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !user.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  /**
   * 渲染角色標籤
   * @param {string | object} role - 用戶角色
   * @returns {JSX.Element} 角色標籤元素
   */
  
  const renderRoleBadge = (role) => {
    let badgeClass = '';
    let icon = null;
    let text = '';

    const roleName = typeof role === 'object' && role !== null ? role.name : role;
    
    switch (roleName) {
      case 'Admin':
        badgeClass = 'role-badge admin';
        icon = faShield;
        text = '系統管理員';
        break;
      case 'Manager':
        badgeClass = 'role-badge manager';
        icon = faBriefcase;
        text = '部門經理';
        break;
      case 'Auditor':
        badgeClass = 'role-badge auditor';
        icon = faClipboardCheck;
        text = '認證審核員';
        break;
      case 'User':
        badgeClass = 'role-badge user';
        icon = faPerson;
        text = '一般使用者';
        break;
      default:
        badgeClass = 'role-badge';
        icon = faPerson;
        text = '訪客';
    }
    
    return (
      <span className={badgeClass}>
        <FontAwesomeIcon icon={icon} className="me-1" />
        {text}
      </span>
    );
  };
  
  /**
   * 渲染狀態標籤
   * @param {string} status - 用戶狀態
   * @returns {JSX.Element} 狀態標籤元素
   */
  const renderStatusBadge = (status) => {
    const badgeClass = status === 'active' ? 'status-badge active' : 'status-badge inactive';
    const text = status === 'active' ? '在線' : '離線';
    
    return (
      <span className={badgeClass}>
        <FontAwesomeIcon icon={faCircle} className="me-1" style={{fontSize: '8px'}} />
        {text}
      </span>
    );
  };

  /**
   * 處理分頁變更
   * @param {number} newPage - 新的頁碼
   */
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };


  /**
   * 處理載入和錯誤
  */
 if (loadingUsers) {
  return <div className='user-management-container text-center'><p>載入使用者列表中...</p></div>;
 }
 if (errorUsers) {
  return <div className='user-management-container text-center text-danger'><p>{errorUsers}</p></div>;
 }

  return (
    <div className="user-management-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>使用者管理</h4>
        <div className="d-flex gap-3">
          <div className="search-bar">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input 
              type="text" 
              id="searchUser"
              name="searchUser"
              className="form-control" 
              placeholder="搜尋使用者"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn upload-btn">{/* TODO: 實作新增使用者 */}
            <FontAwesomeIcon icon={faPlus} className="me-2" />新增使用者
          </button>
        </div>
      </div>
      
      <div className="tabs mb-4">
        {['所有使用者', '管理員', '審核員', '一般使用者', '訪客'].map(tab => (
          <div 
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>
      
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th style={{width: '40%'}}>使用者</th>
                      <th>角色</th>
                      <th>部門</th>
                      <th>狀態</th>
                      <th>上次登入</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          <p className="mb-0">未找到符合條件的使用者</p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map(user => (
                        <tr key={user.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="user-card-avatar me-2">
                                <FontAwesomeIcon icon={faPerson} />
                              </div>
                              <div>
                                <div>{user.name}</div>
                                <div className="text-muted small">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>{renderRoleBadge(user.role)}</td>
                          <td>{user.department}</td>
                          <td>{renderStatusBadge(user.status || 'unknown')}</td>
                          <td>{user.lastLogin || 'N/A'}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <div className="action-icon" title="編輯使用者">
                                <FontAwesomeIcon icon={faPencil} />
                              </div>
                              <div className="action-icon" title="查看詳情">
                                <FontAwesomeIcon icon={faEye} />
                              </div>
                              <div className="action-icon text-danger" title="停用帳號">
                                <FontAwesomeIcon icon={faLock} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <nav aria-label="使用者分頁">
            <ul className="pagination justify-content-center mt-4">
              <li className="page-item disabled">
                <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} disabled>上一頁</button>
              </li>
              <li className="page-item active">
                <button className="page-link" onClick={() => handlePageChange(1)}>1</button>
              </li>
              <li className="page-item">
                <button className="page-link" onClick={() => handlePageChange(2)}>2</button>
              </li>
              <li className="page-item">
                <button className="page-link" onClick={() => handlePageChange(3)}>3</button>
              </li>
              <li className="page-item">
                <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>下一頁</button>
              </li>
            </ul>
          </nav>
        </div>
        
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">使用者統計</h5>
            </div>
            <div className="card-body">
              {loadingStats && <p>統計資料載入中...</p>}
              {errorStats && <p className='text-danger'>{errorStats}</p>}
              {userStats && !loadingStats && !errorStats && (
                <>
                  <div className='d-flex justify-content-between mb-3'>
                    <div>使用者總數</div>
                    <div className='fw-bold'>{userStats.totalUsers}</div>
                  </div>
                  {Object.entries(userStats.usersByRole || {}).map(([role, count]) => (
                    <div className='d-flex justify-content-between mb-3' key={role}>
                      <div>role.slice(1)</div>
                      <div className='fw-bold'>{count}</div>
                    </div>
                  ))}
                  <div className='d-flex justify-content-between mb-3'>
                    <div>當前在線</div>
                    <div className='fw-bold text-success'>{userStats.onlineUsers}</div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">角色與權限</h5>
            </div>
            <div className="card-body">
              <select 
                id="userRole"
                name="userRole"
                className="form-select mb-3"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option>系統管理員</option>
                <option>部門經理</option>
                <option>認證審核員</option>
                <option>一般使用者</option>
                <option>訪客</option>
              </select>
              
              <h6 className="mb-3">權限設置</h6>
              <ul className="permission-list">
                <li>
                  <div>系統設定</div>
                  <div className="form-check form-switch">
                    <input 
                      id="permSystemSettings"
                      name="permSystemSettings"
                      className="form-check-input" 
                      type="checkbox" 
                      checked={selectedRole === '系統管理員'} 
                      readOnly={selectedRole !== '系統管理員'}
                    />
                  </div>
                </li>
                <li>
                  <div>使用者管理</div>
                  <div className="form-check form-switch">
                    <input 
                      id="permUserManagement"
                      name="permUserManagement"
                      className="form-check-input" 
                      type="checkbox" 
                      checked={['系統管理員', '部門經理'].includes(selectedRole)} 
                      readOnly={!['系統管理員', '部門經理'].includes(selectedRole)}
                    />
                  </div>
                </li>
                <li>
                  <div>文件管理</div>
                  <div className="form-check form-switch">
                    <input 
                      id="permDocManagement"
                      name="permDocManagement"
                      className="form-check-input" 
                      type="checkbox" 
                      checked={selectedRole !== '訪客'} 
                      readOnly={selectedRole === '訪客'}
                    />
                  </div>
                </li>
                <li>
                  <div>模板中心</div>
                  <div className="form-check form-switch">
                    <input 
                      id="permTemplateCenter"
                      name="permTemplateCenter"
                      className="form-check-input" 
                      type="checkbox" 
                      checked={['系統管理員', '部門經理', '認證審核員'].includes(selectedRole)} 
                      readOnly={!['系統管理員', '部門經理', '認證審核員'].includes(selectedRole)}
                    />
                  </div>
                </li>
                <li>
                  <div>認證專案</div>
                  <div className="form-check form-switch">
                    <input 
                      id="permCertProjects"
                      name="permCertProjects"
                      className="form-check-input" 
                      type="checkbox" 
                      checked={selectedRole !== '訪客'} 
                      readOnly={selectedRole === '訪客'}
                    />
                  </div>
                </li>
                <li>
                  <div>報表分析</div>
                  <div className="form-check form-switch">
                    <input 
                      id="permReportsAnalysis"
                      name="permReportsAnalysis"
                      className="form-check-input" 
                      type="checkbox" 
                      checked={['系統管理員', '部門經理'].includes(selectedRole)} 
                      readOnly={!['系統管理員', '部門經理'].includes(selectedRole)}
                    />
                  </div>
                </li>
                <li>
                  <div>供應商管理</div>
                  <div className="form-check form-switch">
                    <input 
                      id="permSupplierManagement"
                      name="permSupplierManagement"
                      className="form-check-input" 
                      type="checkbox" 
                      checked={['系統管理員', '部門經理', '認證審核員'].includes(selectedRole)} 
                      readOnly={!['系統管理員', '部門經理', '認證審核員'].includes(selectedRole)}
                    />
                  </div>
                </li>
              </ul>
              
              <button className="btn btn-primary w-100 mt-3">儲存權限設置</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement; 