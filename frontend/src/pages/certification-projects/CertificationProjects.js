import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faPlus, faCog, faEye, 
  faPlayCircle, faCheckCircle, faCalendar, 
  faCheck, faHourglassHalf, faMinus, faClock
} from '@fortawesome/free-solid-svg-icons';
import './CertificationProjects.css';

const CertificationProjects = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: '全部' },
    { id: 'in-progress', label: '進行中' },
    { id: 'completed', label: '已完成' },
    { id: 'planned', label: '計畫中' }
  ];

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

  // 根據當前選中的標籤過濾項目
  const filteredProjects = certificationProjects.filter(project => {
    if (activeTab !== 'all' && project.status !== activeTab) {
      return false;
    }
    
    // 根據搜尋關鍵詞過濾
    if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

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