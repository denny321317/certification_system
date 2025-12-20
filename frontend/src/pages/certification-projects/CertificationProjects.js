/**
 * 認證項目管理組件
 * 
 * 此組件提供企業認證系統的認證項目管理功能，包含：
 * 1. 認證項目狀態追蹤（進行中、已完成、計畫中）
 * 2. 項目搜索和篩選
 * 3. 項目時程管理
 * 4. 任務清單管理
 * 5. 進度追蹤
 * 
 * 特點：
 * - 支持多種認證類型（SMETA、ISO等）
 * - 提供項目進度的視覺化展示
 * - 支持項目時間線追蹤
 * - 包含詳細的任務分解和檢查清單
 * 
 * 使用方式：
 * ```jsx
 * <CertificationProjects />
 * ```
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faPlus, faCog, faEye, 
  faCheckCircle, faHourglassHalf, faMinus, faClock,
  faUpload, faClipboardCheck, faExclamationTriangle, 
  faTimes, faEdit, faFileExport, faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
import { useSettings } from '../../contexts/SettingsContext';
import './CertificationProjects.css';


// 狀態標籤輔助函數
const getStatusBadge = (status) => {
  switch (status) {
    case 'in-progress':
      return (
        <div className="status-badge internal-review">
          <FontAwesomeIcon icon={faHourglassHalf} className="me-1" />
          進行中
        </div>
      );
    case 'planned':
      return (
        <div className="status-badge preparing">
          <FontAwesomeIcon icon={faClock} className="me-1" />
          計畫中
        </div>
      );
    case 'completed':
      return (
        <div className="status-badge completed">
          <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
          已完成
        </div>
      );
    default:
      return (
        <div className="status-badge">
          {status}
        </div>
      );
  }
};

const getTimelineIcon = (status) => {
  switch (status) {
    case 'completed':
      return <FontAwesomeIcon icon={faCheckCircle} className="text-success" />;
    case 'current':
      return <FontAwesomeIcon icon={faHourglassHalf} className="text-primary" />;
    case 'pending':
      return <FontAwesomeIcon icon={faMinus} className="text-muted" />;
    default:
      return null;
  }
};


/**
 * 認證項目管理組件
 * @returns {JSX.Element} 認證項目管理介面
 */
const CertificationProjects = ({ canWrite }) => {
  const { settings } = useSettings();
  /**
   * 搜索關鍵字狀態
   * @type {[string, Function]} [搜索關鍵字, 設置搜索關鍵字的函數]
   */
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * 當前選中的標籤狀態
   * @type {[string, Function]} [當前標籤, 設置當前標籤的函數]
   */
  const [activeTab, setActiveTab] = useState('all');

  /**
   * 標籤列表定義
   * @type {Array<{
   *   id: string,    // 標籤ID
   *   label: string  // 標籤顯示文字
   * }>}
   */
  const tabs = [
    { id: 'all', label: '全部' },
    { id: 'in-progress', label: '進行中' },
    { id: 'completed', label: '已完成' },
    { id: 'planned', label: '計畫中' }
  ];

  /**
   * 認證項目數據結構
   * @type {Array<{
   *   id: number,           // 項目ID
   *   name: string,         // 項目名稱
   *   status: string,       // 項目狀態（in-progress/completed/planned）
   *   startDate: string,    // 開始日期
   *   endDate: string,      // 結束日期
   *   manager: string,      // 負責人
   *   agency: string,       // 認證機構
   *   progress: number,     // 完成進度
   *   progressColor: string, // 進度條顏色
   *   timeline?: Array<{    // 時間線（可選）
   *     stage: string,      // 階段名稱
   *     status: string,     // 階段狀態
   *     date: string,       // 日期
   *     description: string, // 描述
   *     tasks?: Array<{     // 任務列表（可選）
   *       id: number,       // 任務ID
   *       name: string,     // 任務名稱
   *       completed: boolean // 是否完成
   *     }>
   *   }>
   * }>}
   */
  
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [projects, setProjects] = useState([]);

  // 新增 teamMembers 狀態
  const [teamMembers, setTeamMembers] = useState([]);

  // 新增 settingsModal 狀態
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [settingsTab, setSettingsTab] = useState('edit');

  // 1. 從後端拉資料
  useEffect(() => {
    let url = 'http://localhost:8000/api/projects/GetAllProject';
    if (activeTab !== 'all') {
      url += `?status=${activeTab}`;
    }
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setProjects(data);
        console.log(data)
      })
      .catch(error => {
        console.error('Error fetching project data:', error);
      });
  }, [activeTab]);

  // 2. 根據 searchQuery 過濾
  useEffect(() => {
    const filtered = projects.filter(project => {
      return !searchQuery || project.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    setFilteredProjects(filtered);
  }, [projects, searchQuery]);
  
  // 彈窗開啟時同步查詢團隊成員
  useEffect(() => {
    if (showSettingsModal && currentProject) {
      fetch(`http://localhost:8000/api/projects/${currentProject.id}/team`)
        .then(res => res.json())
        .then(data => setTeamMembers(Array.isArray(data) ? data : []));
    }
  }, [showSettingsModal, currentProject]);
  
  const navigate = useNavigate();

  /**
   * 處理查看項目詳情
   * @param {number} projectId - 項目ID
   */
  const handleViewProject = (projectId) => {
    navigate(`/certification-projects/${projectId}`);
  };

  /**
   * 處理新增認證專案
   */
  const handleCreateProject = () => {
    navigate('/certification-projects/create');
  };

  /**
   * 處理設定圖標點擊
   * @param {Object} project - 項目數據
   * @param {Event} e - 事件對象
   */
  const handleSettingsClick = (project, e) => {
    e.stopPropagation(); // 防止事件冒泡觸發查看詳情
    const foundUser = teamMembers.find(m => m.name === project.managerName);
    setCurrentProject({
      ...project,
      description: project.description || '',
      managerId: foundUser ? foundUser.id : ''
    });
    setSettingsTab('edit');
    setShowSettingsModal(true);
  };
  
  /**
   * 處理關閉設定彈窗
   */
  const handleCloseSettings = () => {
    setShowSettingsModal(false);
    setCurrentProject(null);
  };
  
  /**
   * 處理設定彈窗中表單輸入變更
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>} e - 輸入事件
   */
  const handleProjectInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProject(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  /**
   * 處理編輯項目
   * 注意：此 API 僅更新專案基本資料，不處理團隊成員。
   * 團隊成員請用 /add-member、/remove-member API 管理。
   */
  const handleEditProject = async () => {
    try {
      const { managerName, ...projectToUpdate } = currentProject;
      const response = await fetch(
        `http://localhost:8000/api/projects/UpdateProject/${currentProject.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectToUpdate)
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '更新失敗');
      }
      // 更新成功，前端同步更新
      const updated = await response.json();
      setProjects(prev =>
        prev.map(p => (p.id === updated.id ? updated : p))
      );
      alert('項目已更新');
      setShowSettingsModal(false);
    } catch (error) {
      alert('更新失敗: ' + error.message);
    }
  };
  
  /**
   * 處理刪除項目
   * 不需特別處理團隊成員，後端會 cascade 刪除 project_team 關聯。
   */
  const handleDeleteProject = async () => {
    if (window.confirm(`確定要刪除專案「${currentProject.name}」嗎？此操作無法復原。`)) {
      try {
        const response = await fetch(
          `http://localhost:8000/api/projects/DeleteProject/${currentProject.id}`,
          { method: 'DELETE' }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '刪除失敗');
        }
        // 刪除成功，從前端移除該專案
        setProjects(prev => prev.filter(p => p.id !== currentProject.id));
        alert('項目已刪除');
        setShowSettingsModal(false);
      } catch (error) {
        alert('刪除失敗: ' + error.message);
      }
    }
  };
  
  /**
   * 處理匯出報告
   */
  const handleExportReport = () => {
    // 實際應用中，應該有API調用生成報告
    console.log('匯出項目報告:', currentProject.id);
    
    // 模擬匯出成功
    alert('報告匯出成功');
  };

  /**
   * 處理日期格式顯示
   * @param {*} dateInput 
   * @returns 
   */
  const formatDate = (dateInput) => {
    if (!dateInput || !settings || !settings.dateFormat || !settings.timezone) {
      return dateInput || 'N/A';
    }

    const date = new Date(dateInput);
    if (isNaN(date)) {
      return dateInput || 'N/A';
    }

    try {
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: settings.timezone,
      };

      const formatter = new Intl.DateTimeFormat('en-US', options);
      const parts = formatter.formatToParts(date);
      
      const getPart = (partName) => parts.find(p => p.type === partName)?.value;

      const year = getPart('year');
      const month = getPart('month');
      const day = getPart('day');

      if (!year || !month || !day) {
        return date.toLocaleDateString('zh-TW', { timeZone: settings.timezone });
      }

      return settings.dateFormat
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day);

    } catch (error) {
      console.error("Error formatting date:", error);
      return new Date(dateInput).toLocaleDateString();
    }
  };
  
  /**
   * 渲染設定彈窗
   * @returns {JSX.Element|null} 設定彈窗元素或null
   */
  const renderSettingsModal = () => {
    if (!showSettingsModal || !currentProject) return null;
    
    return (
      <div className="settings-modal-overlay">
        <div className="settings-modal">
          <div className="settings-modal-header">
            <h4>專案設定</h4>
            <button className="btn-close" onClick={handleCloseSettings}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          
          <div className="settings-modal-tabs">
            <div 
              className={`settings-tab ${settingsTab === 'edit' ? 'active' : ''}`}
              onClick={() => setSettingsTab('edit')}
              disabled={ !canWrite }
            >
              <FontAwesomeIcon icon={faEdit} className="me-2" />
              編輯專案
            </div>
          </div>
          
          <div className="settings-modal-content">
            {settingsTab === 'edit' && (
              <div className="edit-project-form">
                <div className="form-section">
                  <h5 className="section-title">基本信息</h5>
                  
                  <div className="form-group">
                    <label htmlFor="name">專案名稱</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={currentProject.name}
                      onChange={handleProjectInputChange}
                      className="form-control"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="status">專案狀態</label>
                    <select
                      id="status"
                      name="status"
                      value={currentProject.status}
                      onChange={handleProjectInputChange}
                      className="form-control"
                    >
                      <option value="planned">計畫中</option>
                      <option value="in-progress">進行中</option>
                      <option value="completed">已完成</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="description">專案描述</label>
                    <textarea
                      id="description"
                      name="description"
                      value={currentProject.description || ''}
                      onChange={handleProjectInputChange}
                      className="form-control"
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="progress">專案完成度</label>
                    <div className="progress-input-container">
                      <input
                        type="range"
                        id="progress"
                        name="progress"
                        className="form-range"
                        min="0"
                        max="100"
                        step="5"
                        value={currentProject.progress || 0}
                        onChange={handleProjectInputChange}
                      />
                      <div className="progress-display">
                        <span className="progress-value">{currentProject.progress || 0}%</span>
                        <div className="progress-bar-preview">
                          <div 
                            className="progress-fill-preview" 
                            style={{ width: `${currentProject.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="progress-help-text">
                      拖動滑桿設定專案完成度
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <h5 className="section-title">時程信息</h5>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="startDate">開始日期</label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={currentProject.startDate}
                        onChange={handleProjectInputChange}
                        className="form-control"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="endDate">結束日期</label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={currentProject.endDate}
                        onChange={handleProjectInputChange}
                        className="form-control"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="internalReviewDate">內部審核日期</label>
                      <input
                        type="date"
                        id="internalReviewDate"
                        name="internalReviewDate"
                        value={currentProject.internalReviewDate}
                        onChange={handleProjectInputChange}
                        className="form-control"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="externalReviewDate">外部審核日期</label>
                      <input
                        type="date"
                        id="externalReviewDate"
                        name="externalReviewDate"
                        value={currentProject.externalReviewDate}
                        onChange={handleProjectInputChange}
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <h5 className="section-title">責任與機構</h5>
                  
                  <div className="form-group">
                    <label htmlFor="managerId">專案負責人</label>
                    {teamMembers.length === 0 ? (
                      <div className="text-muted">請先於團隊成員區塊新增成員後再指定負責人</div>
                    ) : (
                      <select
                        id="managerId"
                        name="managerId"
                        key={currentProject.id + (currentProject.managerId || 'none')}
                        value={currentProject.managerId || ''}
                        // value={currentProject.managerId ? String(currentProject.managerId) : ''}
                        onChange={handleProjectInputChange}
                        className="form-control"
                        required
                      >
                        <option value="">請選擇負責人</option>
                        {teamMembers.map(member => (
                          <option key={member.id} value={member.id}>
                            {member.name}（{member.position || '無職稱'}）
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="agency">認證機構</label>
                    <input
                      type="text"
                      id="agency"
                      name="agency"
                      value={currentProject.agency}
                      onChange={handleProjectInputChange}
                      className="form-control"
                    />
                  </div>
                </div>
                
                <div className="form-actions">
                  <button className="btn btn-primary" onClick={handleEditProject}>
                    <FontAwesomeIcon icon={faEdit} className="me-2" />
                    儲存變更
                  </button>
                </div>
              </div>
            )}
            

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="certification-projects-container">
      <div className="header-actions">
        <h4>認證專案管理</h4>
        <div className="header-controls">
          <div className="search-container">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input 
              type="text" 
              className="search-input" 
              placeholder="搜尋專案"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" disabled={ !canWrite } onClick={ handleCreateProject }>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            新增認證專案
          </button>
        </div>
      </div>
      
      <div className="tab-container">
        <div className="tabs">
          {tabs.map(tab => (
            <div 
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </div>
          ))}
        </div>
      </div>
      
      <div className="projects-list">
        {filteredProjects.map(project => (
          <div className="project-card" key={project.id}>
            <div className="project-header">
              <div className="project-title">
                <h5>{project.name}</h5>
                {getStatusBadge(project.status)}
              </div>
              <div className="project-actions">
                <button className="btn btn-sm btn-outline" onClick={(e) => handleSettingsClick(project, e)}>
                  <FontAwesomeIcon icon={faCog} />
                </button>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => {
                    console.log('akashaksproject:', project);
                    handleViewProject(project.id);
                  }}                
                >
                  <FontAwesomeIcon icon={faEye} className="me-1" /> 
                  進入專案
                </button>
              </div>
            </div>
            <div className="project-body">
              <div className="project-meta">
                <div className="project-meta-item">
                  <div className="project-meta-label">
                    {project.status === 'planned' ? '預計開始日期' : '專案開始日期'}
                  </div>
                  <div className="project-meta-value">{formatDate(project.startDate)}</div>
                </div>
                <div className="project-meta-item">
                  <div className="project-meta-label">
                    {project.status === 'completed' ? '完成日期' : '預計完成日期'}
                  </div>
                  <div className="project-meta-value">{formatDate(project.endDate)}</div>
                </div>
                <div className="project-meta-item">
                  <div className="project-meta-label">負責人</div>
                  <div className="project-meta-value">
                    {project.managerName || '未指定'}
                  </div>
                </div>
                <div className="project-meta-item">
                  <div className="project-meta-label">審核機構</div>
                  <div className="project-meta-value">{project.agency}</div>
                </div>
              </div>
              
              <div className="progress-section">
                <div className="progress-header">
                  <div>完成進度</div>
                  <div>{project.progress}%</div>
                </div>
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${project.progressColor}`} 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
              
              {project.id === 1 && (
                <div className="timeline">
                  {Array.isArray(project.timeline) && project.timeline.map((item, index) => (
                    <div className="timeline-item" key={index}>
                      <div className={`timeline-dot ${item.status}`}>
                        {getTimelineIcon(item.status)}
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <strong>{item.stage}</strong>
                          <span className="timeline-date">
                            {item.status === 'current' ? (
                              <span className="text-primary">
                                <FontAwesomeIcon icon={faClock} className="me-1" />
                                {formatDate(item.date)}
                              </span>
                            ) : (
                              <span className="text-muted">{formatDate(item.date)}</span>
                            )}
                          </span>
                        </div>
                        <p className="timeline-description">{item.description}</p>
                        
                        {item.tasks && item.tasks.length > 0 && (
                          <div className="task-checklist">
                            <div className="task-list-heading">待完成項目</div>
                            <ul className="checklist">
                              {item.tasks.map(task => (
                                <li className="checklist-item" key={task.id}>
                                  <input 
                                    type="checkbox" 
                                    className="checklist-checkbox" 
                                    checked={task.completed} 
                                    readOnly
                                  />
                                  <div className="task-name">{task.name}</div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {renderSettingsModal()}
    </div>
  );
};

export default CertificationProjects; 