/**
 * 認證項目管理組件
 * 
 * 此組件提供企業認證系統的認證項目管理功能，包含：
 * 1. 認證項目狀態追蹤（準備中、內部審核中、外部審核中、已完成）
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
 * - 顯示內部審核、外部審核日期
 * 
 * 使用方式：
 * ```jsx
 * <CertificationProjects />
 * ```
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faPlus, faCog, faEdit, faTrashAlt, faFileExport, faEye, 
  faTools, faCheckCircle, faClipboardCheck, 
  faExclamationTriangle, faCheck, faHourglassHalf, faMinus, faClock,
  faUpload, faCalendarCheck, faTimes
} from '@fortawesome/free-solid-svg-icons';
import './CertificationProjects.css';

/**
 * 認證項目管理組件
 * @returns {JSX.Element} 認證項目管理介面
 */
const CertificationProjects = () => {
  const navigate = useNavigate();
  
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
   * 設定彈窗狀態
   * @type {[boolean, Function]} [是否顯示設定彈窗, 設置彈窗顯示狀態的函數]
   */
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  /**
   * 當前選中的項目
   * @type {[Object|null, Function]} [當前選中的項目, 設置當前項目的函數]
   */
  const [currentProject, setCurrentProject] = useState(null);
  
  /**
   * 當前選中的設定頁籤
   * @type {[string, Function]} [當前設定頁籤, 設置當前設定頁籤的函數]
   */
  const [settingsTab, setSettingsTab] = useState('edit');

  /**
   * 標籤列表定義
   * @type {Array<{
   *   id: string,    // 標籤ID
   *   label: string  // 標籤顯示文字
   * }>}
   */
  const tabs = [
    { id: 'all', label: '全部' },
    { id: 'preparing', label: '準備中' },
    { id: 'internal-review', label: '內部審核中' },
    { id: 'external-review', label: '外部審核中' },
    { id: 'completed', label: '已完成' }
  ];

  /**
   * 認證項目數據結構
   * @type {Array<{
   *   id: number,           // 項目ID
   *   name: string,         // 項目名稱
   *   status: string,       // 項目狀態（preparing/internal-review/external-review/completed）
   *   startDate: string,    // 開始日期
   *   endDate: string,      // 結束日期
   *   manager: string,      // 負責人
   *   agency: string,       // 認證機構
   *   progress: number,     // 完成進度
   *   progressColor: string, // 進度條顏色
   *   internalReviewDate: string, // 內部審核日期
   *   externalReviewDate: string, // 外部審核日期
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
  const certificationProjects = [
    {
      id: 1,
      name: 'SMETA 4支柱認證',
      status: 'internal-review',
      startDate: '2023-07-15',
      endDate: '2023-10-30',
      manager: '王經理',
      agency: 'SGS Taiwan',
      progress: 75,
      progressColor: 'primary',
      internalReviewDate: '2023-09-20',
      externalReviewDate: '2023-10-25',
      timeline: [
        {
          stage: '準備階段',
          status: 'completed',
          date: '2023-08-15',
          description: '完成團隊組建、資源分配和初步資料收集'
        },
        {
          stage: '自我評估',
          status: 'completed',
          date: '2023-09-10',
          description: '根據SMETA標準完成內部評估和差距分析'
        },
        {
          stage: '文件準備',
          status: 'current',
          date: '進行中',
          description: '收集和整理所有必要的證明文件',
          tasks: [
            { id: 1, name: '更新勞工權益政策文件', completed: true },
            { id: 2, name: '完成健康安全管理程序書', completed: true },
            { id: 3, name: '準備最近6個月的工時記錄', completed: false },
            { id: 4, name: '更新環境管理計劃', completed: false }
          ]
        },
        {
          stage: '預備審核',
          status: 'pending',
          date: '預計 2023-10-15',
          description: '內部團隊進行最終審核準備'
        },
        {
          stage: '正式審核',
          status: 'pending',
          date: '預計 2023-10-25',
          description: '外部審核機構現場審核'
        }
      ]
    },
    {
      id: 2,
      name: 'ISO 14001 環境管理系統認證',
      status: 'external-review',
      startDate: '2023-06-01',
      endDate: '2023-09-25',
      manager: '李總監',
      agency: 'BSI Taiwan',
      progress: 90,
      progressColor: 'secondary',
      internalReviewDate: '2023-08-15',
      externalReviewDate: '2023-09-10'
    },
    {
      id: 3,
      name: 'ISO 9001 品質管理系統認證',
      status: 'completed',
      startDate: '2023-03-10',
      endDate: '2023-08-15',
      manager: '張經理',
      agency: 'TÜV Rheinland',
      progress: 100,
      progressColor: 'success',
      internalReviewDate: '2023-06-20',
      externalReviewDate: '2023-07-30'
    },
    {
      id: 4,
      name: 'SA8000 社會責任認證',
      status: 'preparing',
      startDate: '2023-10-01',
      endDate: '2024-04-30',
      manager: '林經理',
      agency: 'Bureau Veritas',
      progress: 35,
      progressColor: 'warning',
      internalReviewDate: '2024-01-15',
      externalReviewDate: '2024-03-20'
    }
  ];

  /**
   * 根據當前標籤和搜索關鍵字過濾項目
   * @returns {Array} 過濾後的項目列表
   */
  const filteredProjects = certificationProjects.filter(project => {
    if (activeTab !== 'all' && project.status !== activeTab) {
      return false;
    }
    
    if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  /**
   * 根據項目狀態返回對應的狀態標籤元素
   * @param {string} status - 項目狀態
   * @returns {JSX.Element|null} 狀態標籤元素
   */
  const getStatusBadge = (status) => {
    switch (status) {
      case 'preparing':
        return (
          <div className="status-badge preparing">
            <FontAwesomeIcon icon={faUpload} className="me-1" />
            準備中
          </div>
        );
      case 'internal-review':
        return (
          <div className="status-badge internal-review">
            <FontAwesomeIcon icon={faClipboardCheck} className="me-1" />
            內部審核中
          </div>
        );
      case 'external-review':
        return (
          <div className="status-badge external-review">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" />
            外部審核中
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
        return null;
    }
  };

  /**
   * 根據時間線階段狀態返回對應的圖標
   * @param {string} status - 階段狀態（completed/current/pending）
   * @returns {JSX.Element} FontAwesome圖標元素
   */
  const getTimelineIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FontAwesomeIcon icon={faCheck} />;
      case 'current':
        return <FontAwesomeIcon icon={faHourglassHalf} />;
      case 'pending':
      default:
        return <FontAwesomeIcon icon={faMinus} />;
    }
  };
  
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
   * 格式化日期顯示
   * @param {string} dateString - 日期字串
   * @returns {string} 格式化後的日期
   */
  const formatDate = (dateString) => {
    if (!dateString) return '未設定';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * 處理設定圖標點擊
   * @param {Object} project - 項目數據
   * @param {Event} e - 事件對象
   */
  const handleSettingsClick = (project, e) => {
    e.stopPropagation(); // 防止事件冒泡觸發查看詳情
    setCurrentProject({...project});
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
   * 處理編輯項目
   */
  const handleEditProject = () => {
    // 實際應用中，應該有API調用保存項目數據
    console.log('儲存項目修改:', currentProject);
    
    // 模擬更新成功
    alert('項目已更新');
    setShowSettingsModal(false);
  };
  
  /**
   * 處理刪除項目
   */
  const handleDeleteProject = () => {
    if (window.confirm(`確定要刪除專案「${currentProject.name}」嗎？此操作無法復原。`)) {
      // 實際應用中，應該有API調用刪除項目
      console.log('刪除項目:', currentProject.id);
      
      // 模擬刪除成功
      alert('項目已刪除');
      setShowSettingsModal(false);
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
   * 處理項目表單輸入變更
   * @param {Event} e - 事件對象
   */
  const handleProjectInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProject({
      ...currentProject,
      [name]: value
    });
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
            >
              <FontAwesomeIcon icon={faEdit} className="me-2" />
              編輯專案
            </div>
            <div 
              className={`settings-tab ${settingsTab === 'export' ? 'active' : ''}`}
              onClick={() => setSettingsTab('export')}
            >
              <FontAwesomeIcon icon={faFileExport} className="me-2" />
              匯出報告
            </div>
            <div 
              className={`settings-tab delete-tab ${settingsTab === 'delete' ? 'active' : ''}`}
              onClick={() => setSettingsTab('delete')}
            >
              <FontAwesomeIcon icon={faTrashAlt} className="me-2" />
              刪除專案
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
                      <option value="preparing">準備中</option>
                      <option value="internal-review">內部審核中</option>
                      <option value="external-review">外部審核中</option>
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
                    <label htmlFor="manager">專案負責人</label>
                    <input
                      type="text"
                      id="manager"
                      name="manager"
                      value={currentProject.manager}
                      onChange={handleProjectInputChange}
                      className="form-control"
                    />
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
            
            {settingsTab === 'export' && (
              <div className="export-report">
                <div className="export-info">
                  <h5>匯出專案報告</h5>
                  <p>匯出 {currentProject.name} 的完整報告，包含所有專案資訊、審核狀態、團隊成員以及時間軸等資料。</p>
                  
                  <div className="export-options">
                    <div className="export-option">
                      <input type="radio" id="pdf" name="exportFormat" value="pdf" defaultChecked />
                      <label htmlFor="pdf">PDF 格式</label>
                    </div>
                    <div className="export-option">
                      <input type="radio" id="excel" name="exportFormat" value="excel" />
                      <label htmlFor="excel">Excel 格式</label>
                    </div>
                    <div className="export-option">
                      <input type="radio" id="word" name="exportFormat" value="word" />
                      <label htmlFor="word">Word 格式</label>
                    </div>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button className="btn btn-primary" onClick={handleExportReport}>
                    <FontAwesomeIcon icon={faFileExport} className="me-2" />
                    匯出報告
                  </button>
                </div>
              </div>
            )}
            
            {settingsTab === 'delete' && (
              <div className="delete-project">
                <div className="delete-warning">
                  <h5>刪除專案</h5>
                  <p className="warning-text">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                    警告：此操作將永久刪除專案「{currentProject.name}」及其所有相關數據，且無法復原。
                  </p>
                  <p>請確認您已備份所需的資料，並確定要執行此操作。</p>
                </div>
                
                <div className="form-actions">
                  <button className="btn btn-danger" onClick={handleDeleteProject}>
                    <FontAwesomeIcon icon={faTrashAlt} className="me-2" />
                    確認刪除
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
          <button 
            className="btn btn-primary"
            onClick={handleCreateProject}
          >
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
                <button 
                  className="btn btn-sm btn-outline" 
                  onClick={(e) => handleSettingsClick(project, e)}
                >
                  <FontAwesomeIcon icon={faCog} />
                </button>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handleViewProject(project.id)}
                >
                  <FontAwesomeIcon icon={faEye} className="me-1" /> 
                  進入專案
                </button>
              </div>
            </div>
            <div className="project-body">
              <div className="project-meta">
                <div className="project-meta-item">
                  <div className="project-meta-label">專案開始日期</div>
                  <div className="project-meta-value">{formatDate(project.startDate)}</div>
                </div>
                <div className="project-meta-item">
                  <div className="project-meta-label">
                    {project.status === 'completed' ? '完成日期' : '預計完成日期'}
                  </div>
                  <div className="project-meta-value">{formatDate(project.endDate)}</div>
                </div>
                <div className="project-meta-item">
                  <div className="project-meta-label">內部審核日期</div>
                  <div className="project-meta-value date-info">
                    <FontAwesomeIcon icon={faClipboardCheck} className="me-1" />
                    {formatDate(project.internalReviewDate)}
                  </div>
                </div>
                <div className="project-meta-item">
                  <div className="project-meta-label">外部審核日期</div>
                  <div className="project-meta-value date-info">
                    <FontAwesomeIcon icon={faCalendarCheck} className="me-1" />
                    {formatDate(project.externalReviewDate)}
                  </div>
                </div>
                <div className="project-meta-item">
                  <div className="project-meta-label">專案負責人</div>
                  <div className="project-meta-value">{project.manager}</div>
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
            </div>
          </div>
        ))}
      </div>
      
      {renderSettingsModal()}
    </div>
  );
};

export default CertificationProjects; 