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

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faPlus, faCog, faEye, 
  faPlayCircle, faCheckCircle, faCalendar, 
  faCheck, faHourglassHalf, faMinus, faClock
} from '@fortawesome/free-solid-svg-icons';
import './CertificationProjects.css';

/**
 * 認證項目管理組件
 * @returns {JSX.Element} 認證項目管理介面
 */
const CertificationProjects = () => {
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
  const certificationProjects = [
    {
      id: 1,
      name: 'SMETA 4支柱認證',
      status: 'in-progress',
      startDate: '2023-07-15',
      endDate: '2023-10-30',
      manager: '王經理',
      agency: 'SGS Taiwan',
      progress: 75,
      progressColor: 'primary',
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
      status: 'in-progress',
      startDate: '2023-06-01',
      endDate: '2023-09-25',
      manager: '李總監',
      agency: 'BSI Taiwan',
      progress: 90,
      progressColor: 'secondary'
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
      progressColor: 'success'
    },
    {
      id: 4,
      name: 'SA8000 社會責任認證',
      status: 'planned',
      startDate: '2023-11-01',
      endDate: '2024-04-30',
      manager: '尚未指派',
      agency: '待定',
      progress: 0,
      progressColor: ''
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
      case 'in-progress':
        return (
          <div className="status-badge in-progress">
            <FontAwesomeIcon icon={faPlayCircle} className="me-1" />
            進行中
          </div>
        );
      case 'completed':
        return (
          <div className="status-badge completed">
            <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
            已完成
          </div>
        );
      case 'planned':
        return (
          <div className="status-badge planned">
            <FontAwesomeIcon icon={faCalendar} className="me-1" />
            計畫中
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
          <button className="btn btn-primary">
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
                <button className="btn btn-sm btn-outline">
                  <FontAwesomeIcon icon={faCog} />
                </button>
                <button className="btn btn-sm btn-outline-primary">
                  <FontAwesomeIcon icon={faEye} className="me-1" /> 查看詳情
                </button>
              </div>
            </div>
            <div className="project-body">
              <div className="project-meta">
                <div className="project-meta-item">
                  <div className="project-meta-label">
                    {project.status === 'planned' ? '預計開始日期' : '專案開始日期'}
                  </div>
                  <div className="project-meta-value">{project.startDate}</div>
                </div>
                <div className="project-meta-item">
                  <div className="project-meta-label">
                    {project.status === 'completed' ? '完成日期' : '預計完成日期'}
                  </div>
                  <div className="project-meta-value">{project.endDate}</div>
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
              
              {project.id === 1 && (
                <div className="timeline">
                  {project.timeline.map((item, index) => (
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
                                {item.date}
                              </span>
                            ) : (
                              <span className="text-muted">{item.date}</span>
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
    </div>
  );
};

export default CertificationProjects; 