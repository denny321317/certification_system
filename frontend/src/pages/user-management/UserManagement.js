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

import AddUserModal from '../../components/modals/AddUserModal';
import AddRoleModal from '../../components/modals/AddRoleModal';
import UserInfoModal from '../../components/modals/UserInfoModal';

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

    /**
   * for 設定角色權限
   */
  const permissionLabels = [
    {key: 'SystemSettings', lable: '系統設定'},
    {key: 'UserManagement', label: '用戶管理'},
    {key: 'DocumentManagement', label: '文件管理'},
    {key: 'TemplateCenter', label: '模板中心'},
    {key: 'CertificationProjects', label: '認證專案'},
    {key: 'ReportManagement', label: '報表分析'},
    {key: 'SupplierManagement', label: '供應商管理'},
    {key: 'Dashboard', label:' 儀表板'}
  ];

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

  /**
   * for adding Users
   */
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [rolesForForm, setRolesForForm] = useState([]);
  const [loadingRolesForForm, setLoadingRolesForForm] = useState(true);
  const [errorRolesForForm, setErrorRolesForForm] = useState(null);

  /**
   * for role authorizations
   */
  const [roleAuthorizations, setRoleAuthorizations] = useState(Array(16).fill(false));
  const [loadingRoleAuth, setLoadingRoleAuth] = useState(false);
  const [errorRoleAuth, setErrorRoleAuth] = useState(null);

  /**
   * for adding new roles
   */
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);

  /**
   * for seeing detailed user info
   */
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [selectedUserForInfo, setSelectedUserForInfo] = useState(null);
  


  // API base URL
  const API_BASE_URL = 'http://localhost:3000/api';
  const ROLE_NAME_MAP ={
    Admin: '系統管理員',
    Manager: '部門經理',
    Auditor: '認證審核員',
    User: '一般使用者',
    Guest: '訪客'
  }
  /** 
   * 原本沒有的新 Function
   * 用來從後段 API 獲取資料
  */
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

  const fetchRoleAuth = async () => {
    if (!selectedRole) return;
    setLoadingRoleAuth(true);
    setErrorRoleAuth(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/user-management/role/${selectedRole}/getRole`);
      setRoleAuthorizations(response.data.authorizations);
    } catch (err) {
      setErrorRoleAuth('無法獲取權限列表: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingRoleAuth(false);
    }

  };

  const fetchAllRoles = async () => {
    setLoadingRolesForForm(true);
    setErrorRolesForForm(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/user-management/allRoles`);
      const fetchedRoles = response.data;
      setRolesForForm(fetchedRoles);

    } catch (err) {
      setErrorRolesForForm("無法獲取角色列表: " + (err.response?.data?.message || err.message));
      console.error("Error fetching roles for form: ", err);
    } finally {
      setLoadingRolesForForm(false);
    }
  };

  useEffect(() => {
    const fetchInitialPageData = async () => {
      // Fetch users and stats concurrently
      setLoadingUsers(true);
      setErrorUsers(null);
      setLoadingStats(true);
      setErrorStats(null);
      Promise.all([
        axios.get(`${API_BASE_URL}/user-management/allUsers`),
        axios.get(`${API_BASE_URL}/user-management/stats`)
      ]).then(([usersResponse, statsResponse]) => {
        setUsers(usersResponse.data);
        setUserStats(statsResponse.data);
      }).catch(err => {
        console.error("Error fetching users or stats: ", err);
        // Set specific errors if needed
        setErrorUsers('無法獲取使用者列表: ' + (err.response?.data?.message || err.message));
        setErrorStats('無法獲取使用者統計資料: ' + (err.response?.data?.message || err.message));
      }).finally(() => {
        setLoadingUsers(false);
        setLoadingStats(false);
      });

      // Fetch roles for form and then set the initial selectedRole
      setLoadingRolesForForm(true);
      setErrorRolesForForm(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/user-management/allRoles`);
        const fetchedRoles = response.data;
        setRolesForForm(fetchedRoles);
        // If roles are fetched and selectedRole is not yet set (or needs resetting)
        if (fetchedRoles && fetchedRoles.length > 0) {
          // Set selectedRole to the 'name' (system identifier) of the first role
          // This will then trigger the useEffect hook that fetches role authorizations
          if (!selectedRole || !fetchedRoles.some(r => r.name === selectedRole)) {
            setSelectedRole(fetchedRoles[0].name);
          }
        } else {
          setSelectedRole(''); // No roles available
        }
      } catch (err) {
        setErrorRolesForForm('無法獲取角色列表: ' + (err.response?.data?.message || err.message));
        console.error("Error fetching roles for form: ", err);
        setSelectedRole(''); // Clear selected role on error
      } finally {
        setLoadingRolesForForm(false);
      }
    };

    fetchInitialPageData();
  }, []); // Empty dependency array: runs once when the component mounts

  // This useEffect hook will run whenever 'selectedRole' changes.
  useEffect(() => {
    const fetchRoleAuthData = async () => {
      if (!selectedRole) { // Don't fetch if no role is selected (e.g., initially or if roles list is empty)
        setRoleAuthorizations(Array(16).fill(false)); // Reset authorizations
        setErrorRoleAuth(null); // Clear any previous error
        return;
      }
      setLoadingRoleAuth(true);
      setErrorRoleAuth(null);
      try {
        // 'selectedRole' should now be the system name like "Admin", "Manager", etc.
        const response = await axios.get(`${API_BASE_URL}/user-management/role/${selectedRole}/getRole`);
        setRoleAuthorizations(response.data.authorizations);
      } catch (err) {
        setErrorRoleAuth(`無法獲取權限列表 (${selectedRole}): ` + (err.response?.data?.message || err.message));
        console.error(`Error fetching authorizations for role ${selectedRole}:`, err);
      } finally {
        setLoadingRoleAuth(false);
      }
    };

    fetchRoleAuthData();
      
  }, [selectedRole, API_BASE_URL]); // Re-fetch if selectedRole or API_BASE_URL changes

  const handleUserAddedSuccess = () => {
    fetchUsers();
    fetchUserStats();
    fetchAllRoles();
  }

  const handleRoleAddedSuccess = () => {
    fetchAllRoles();
    fetchUserStats();
  }

  const handleShowUserInfo = (user) => {
    setSelectedUserForInfo(user);
    setShowUserInfoModal(true);
  }

  



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
          <button 
            className="btn upload-btn"
            onClick={() => setShowAddUserModal(true)}
            disabled={loadingRolesForForm || !!errorRolesForForm}
          >
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
                          <td>{user.lastTimeLogin || 'N/A'}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <div className="action-icon" title="編輯使用者">
                                <FontAwesomeIcon icon={faPencil} />
                              </div>
                              <div className="action-icon" title="查看詳情" onClick={() => (handleShowUserInfo(user))}>
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
                      <div>{ROLE_NAME_MAP[role] || '測試加入新角色'}</div>
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
                {rolesForForm.map(role => (
                  <option key={role.name} value={role.name}>
                    {ROLE_NAME_MAP[role.name] || role.name}
                  </option>
                ))}
              </select>
              
              <h6 className="mb-3">權限設置</h6>
              {loadingRoleAuth && <div>載入中...</div>}
              {errorRoleAuth && <div className="text-danger">{errorRoleAuth}</div>}
              {!loadingRoleAuth && !errorRoleAuth && (
                <ul className="permission-list">
                  {permissionLabels.map((perm, i) => (
                    <li key={perm.key} className="d-flex align-items-center mb-2">
                      <div style={{width: 100}}>{perm.label || perm.lable}</div>
                      <div className="form-check form-switch ms-3">
                        <label className="me-1">讀</label>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={roleAuthorizations[i * 2]}
                          onChange={e => {
                            const updated = [...roleAuthorizations];
                            updated[i * 2] = e.target.checked;
                            setRoleAuthorizations(updated);
                          }}
                        />
                      </div>
                      <div className="form-check form-switch ms-3">
                        <label className="me-1">寫</label>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={roleAuthorizations[i * 2 + 1]}
                          onChange={e => {
                            const updated = [...roleAuthorizations];
                            updated[i * 2 + 1] = e.target.checked;
                            setRoleAuthorizations(updated);
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              
              <button 
                className="btn btn-primary w-100 mt-3"
                onClick={async () => {
                  try {
                    await axios.put(`${API_BASE_URL}/user-management/role/${selectedRole}/authorizations`, roleAuthorizations);
                    alert('權限已儲存');
                  } catch (err) {
                    alert('儲存失敗: ' + (err.response?.data?.message || err.message));
                  }
                }} 
                disabled={loadingRoleAuth}
              >
                儲存權限設置
              </button>
              <button
                className='btn btn-primary w-100 mt-3'
                onClick={() => setShowAddRoleModal(true)}
                // TODO: implement AddRole
              >
                新增角色
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* render AddUserModal */}
      <AddUserModal
        show={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        API_BASE_URL={API_BASE_URL}
        rolesList={rolesForForm}
        onUserAddedSuccess={handleUserAddedSuccess}
      />
      
      {/* render AddRoleModal */}
      <AddRoleModal
        show={showAddRoleModal}
        onClose={() => setShowAddRoleModal(false)}
        API_BASE_URL={API_BASE_URL}
        onRoleAddedSuccess={handleRoleAddedSuccess}
      />
      
      {/* render UserInfoModal */}
      {
        selectedUserForInfo && (
          <UserInfoModal
            show={showUserInfoModal}
            onClose={() => {
              setShowUserInfoModal(false);
              setSelectedUserForInfo(null);
            }}
            user={selectedUserForInfo}
            API_BASE_URL={API_BASE_URL}
          />
        )
      }
      
      {/* error part */}
      {errorRolesForForm && !loadingRolesForForm && (
        <div className='alert alert-warning- mt-3'>
          無法載入新增使用者表單所需角色列表: {errorRolesForForm}
        </div>
      )
      }

      

    </div>
  );
};

export default UserManagement; 