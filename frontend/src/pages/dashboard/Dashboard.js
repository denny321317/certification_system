/**
 * 儀表板組件
 * 
 * 此組件提供企業認證系統的主要概覽，包含：
 * 1. 統計數據展示（文件總數、認證完成度、待處理任務等）
 * 2. 待辦事項清單
 * 3. 認證項目進度追蹤
 * 4. 最近活動記錄
 * 5. 文件到期提醒
 * 6. 各類統計圖表
 * 
 * 使用方式：
 * ```jsx
 * <Dashboard />
 * ```
 */

import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFile, faCheckCircle, faExclamationCircle,
  faChartLine, faTasks, faFileAlt, faArrowRight,
  faArrowUp, faArrowDown, faRefresh, faBell, faEye, 
  faChevronRight, faCheckSquare, faPlus, faFilter, faUser
} from '@fortawesome/free-solid-svg-icons';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { AuthContext } from '../../contexts/AuthContext';
import './Dashboard.css';

// 註冊Chart.js組件
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * 儀表板組件
 * @returns {JSX.Element} 儀表板介面
 */
const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeStatsCard, setActiveStatsCard] = useState(null);

  // 更新時間
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 每分鐘更新
    return () => clearInterval(timer);
  }, []);

  // 刷新數據
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // 模擬API調用
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  // 處理任務完成
  const handleTaskComplete = (taskId) => {
    setCompletedTasks(prev => new Set([...prev, taskId]));
  };

  /**
   * 統計卡片數據結構
   * @type {Array<{
   *   title: string,      // 卡片標題
   *   value: number|string, // 統計值
   *   icon: IconDefinition, // FontAwesome圖標
   *   color: string,      // 主題顏色
   *   link: string,       // 跳轉連結
   *   urgentCount?: number, // 緊急項目數量（可選）
   *   description?: string, // 補充說明（可選）
   *   trend?: {direction: 'up'|'down', value: number, label: string} // 趨勢資訊
   * }>}
   */
  const statsCards = [
    { 
      title: '文件總數', 
      value: 246, 
      icon: faFile, 
      color: '#3b82f6',
      link: '/document-management',
      trend: { direction: 'up', value: 12, label: '較上月' }
    },
    { 
      title: '完成認證', 
      value: '5/8', 
      icon: faCheckCircle, 
      color: '#10b981',
      link: '/certification-projects',
      trend: { direction: 'up', value: 1, label: '本月新增' }
    },
    { 
      title: '待處理任務', 
      value: 18, 
      urgentCount: 3,
      icon: faExclamationCircle, 
      color: '#f59e0b',
      link: '/tasks',
      trend: { direction: 'down', value: 5, label: '較上週' }
    },
    { 
      title: '即將到期項目', 
      value: 7, 
      description: '未來30天內',
      icon: faExclamationCircle, 
      color: '#ef4444',
      link: '/upcoming-items',
      trend: { direction: 'up', value: 2, label: '需要關注' }
    }
  ];

  /**
   * 認證項目進度數據結構
   * @type {Array<{
   *   name: string,     // 認證名稱
   *   progress: number, // 完成百分比
   *   status: string,   // 狀態
   *   deadline: string  // 截止日期
   * }>}
   */
  const certificationProgress = [
    { name: 'SMETA 4支柱認證', progress: 75, status: 'in-progress', deadline: '2023-08-15' },
    { name: 'ISO 14001', progress: 90, status: 'in-progress', deadline: '2023-07-30' },
    { name: 'ISO 9001', progress: 100, status: 'completed', deadline: '2023-06-20' },
    { name: 'SA8000', progress: 40, status: 'planning', deadline: '2023-09-10' }
  ];

  /**
   * 待辦事項數據結構
   * @type {Array<{
   *   id: number,       // 項目ID
   *   title: string,    // 項目標題
   *   urgency: string,  // 緊急程度（high|medium|low）
   *   dueDate: string,  // 截止日期
   *   category: string, // 類別
   *   assignee: string  // 負責人
   * }>}
   */
  const todoItems = [
    { 
      id: 1, 
      title: '更新ESG報告文件', 
      urgency: 'high', 
      dueDate: '2023/6/15',
      category: '文件更新',
      assignee: '李小明'
    },
    { 
      id: 2, 
      title: '準備ISO 9001內部審核', 
      urgency: 'medium',
      dueDate: '2023/6/22',
      category: '審核準備',
      assignee: '王大力'
    },
    { 
      id: 3, 
      title: '完成供應商評估表格', 
      urgency: 'low', 
      dueDate: '2023/6/30',
      category: '供應商管理',
      assignee: '張小華'
    },
    { 
      id: 4, 
      title: '審核安全合規文件', 
      urgency: 'high', 
      dueDate: '2023/6/18',
      category: '合規審核',
      assignee: '林志明'
    }
  ];

  /**
   * 最近活動數據結構
   * @type {Array<{
   *   id: number,      // 活動ID
   *   user: string,    // 用戶名稱
   *   action: string,  // 執行的動作
   *   target: string,  // 操作對象
   *   timestamp: string, // 時間戳
   *   type: string     // 活動類型
   * }>}
   */
  const recentActivities = [
    { 
      id: 1, 
      user: '李小明', 
      action: '上傳了文件', 
      target: '2023年第一季度ESG報告.pdf', 
      timestamp: '今天 09:45',
      type: 'upload'
    },
    { 
      id: 2, 
      user: '王大力', 
      action: '更新了認證進度', 
      target: 'ISO 14001 環境管理系統', 
      timestamp: '昨天 16:30',
      type: 'update'
    },
    { 
      id: 3, 
      user: currentUser?.name || '張三豐', 
      action: '完成了任務', 
      target: '準備SMETA審核文件', 
      timestamp: '2023/6/10 14:15',
      type: 'complete'
    },
    { 
      id: 4, 
      user: '林小華', 
      action: '新增了供應商', 
      target: '台灣綠色科技有限公司', 
      timestamp: '2023/6/9 11:20',
      type: 'create'
    }
  ];

  /**
   * 文件到期提醒數據結構
   * @type {Array<{
   *   id: number,      // 文件ID
   *   name: string,    // 文件名稱
   *   expiryDate: string, // 到期日期
   *   status: string,  // 狀態（urgent|warning|normal）
   *   daysLeft: number // 剩餘天數
   * }>}
   */
  const expiringDocuments = [
    { 
      id: 1, 
      name: '職業安全評估報告', 
      expiryDate: '2023/6/20', 
      status: 'urgent',
      daysLeft: 5
    },
    { 
      id: 2, 
      name: '環境影響評估證書', 
      expiryDate: '2023/7/5', 
      status: 'warning',
      daysLeft: 20
    },
    { 
      id: 3, 
      name: 'ISO 9001證書', 
      expiryDate: '2023/8/15', 
      status: 'normal',
      daysLeft: 61
    }
  ];

  /**
   * 認證類型分布圖表配置
   * @type {Object} Chart.js圖表數據配置
   */
  const certificationDistributionData = {
    labels: ['ISO標準', 'ESG認證', '產品認證', '其他標準'],
    datasets: [
      {
        data: [45, 25, 20, 10],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(99, 102, 241, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(99, 102, 241, 1)'
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          'rgba(59, 130, 246, 0.9)',
          'rgba(16, 185, 129, 0.9)',
          'rgba(245, 158, 11, 0.9)',
          'rgba(99, 102, 241, 0.9)'
        ]
      },
    ],
  };

  /**
   * 文件狀態分布圖表配置
   * @type {Object} Chart.js圖表數據配置
   */
  const documentStatusData = {
    labels: ['有效', '即將到期', '已過期', '草稿'],
    datasets: [
      {
        label: '文件數量',
        data: [180, 35, 15, 16],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(107, 114, 128, 0.8)'
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(107, 114, 128, 1)'
        ],
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false
      },
    ],
  };

  /**
   * 圓餅圖配置選項
   * @type {Object} Chart.js圖表選項
   */
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          padding: 15,
          usePointStyle: true,
          font: {
            size: 12
          }
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.label + ': ' + context.parsed + '%';
          }
        }
      }
    },
    cutout: '60%',
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  /**
   * 柱狀圖配置選項
   * @type {Object} Chart.js圖表選項
   */
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return '文件數量: ' + context.parsed.y;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  /**
   * 獲取活動圖標
   * @param {string} type - 活動類型
   * @returns {JSX.Element} 圖標元素
   */
  const getActivityIcon = (type) => {
    switch(type) {
      case 'upload': return faArrowUp;
      case 'update': return faRefresh;
      case 'complete': return faCheckCircle;
      case 'create': return faPlus;
      default: return faFile;
    }
  };

  /**
   * 獲取進度狀態顏色
   * @param {string} status - 狀態
   * @returns {string} 顏色值
   */
  const getProgressColor = (status) => {
    switch(status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#3b82f6';
      case 'planning': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div className="dashboard">
      {/* 儀表板標題區域 */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>儀表板</h1>
          <div className="welcome-message">
            歡迎回來，{currentUser?.name || '用戶'}！
          </div>
        </div>
        <div className="header-actions">
          <div className="date-info">
            <span>{currentTime.toLocaleDateString('zh-TW', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}</span>
          </div>
          <button 
            className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <FontAwesomeIcon icon={faRefresh} />
            {isRefreshing ? '更新中...' : '重新整理'}
          </button>
        </div>
      </div>

      {/* 統計卡片區域 */}
      <div className="dashboard-stats">
        {statsCards.map((card, index) => {
          const colorClass = 
            card.color === '#3b82f6' ? 'blue' :
            card.color === '#10b981' ? 'green' :
            card.color === '#f59e0b' ? 'amber' : 'red';

          return (
            <div 
              key={index} 
              className={`stats-card ${colorClass} ${activeStatsCard === index ? 'active' : ''}`}
              onMouseEnter={() => setActiveStatsCard(index)}
              onMouseLeave={() => setActiveStatsCard(null)}
            >
              <div className="stats-card-content">
                <div className="stats-card-header">
                  <div className="stats-card-title">
                    <div className="stats-card-icon">
                      <FontAwesomeIcon icon={card.icon} />
                    </div>
                    <span className="stats-card-text">{card.title}</span>
                  </div>
                  {card.trend && (
                    <div className={`trend-indicator ${card.trend.direction}`}>
                      <FontAwesomeIcon icon={card.trend.direction === 'up' ? faArrowUp : faArrowDown} />
                      <span>{card.trend.value}</span>
                    </div>
                  )}
                </div>
                <div className="stats-card-value">
                  <span className="main-value">{card.value}</span>
                  {card.urgentCount && (
                    <span className="stats-card-urgent">
                      (含 {card.urgentCount} 個緊急)
                    </span>
                  )}
                </div>
                <div className="stats-card-footer">
                  {card.description && (
                    <div className="stats-card-description">{card.description}</div>
                  )}
                  {card.trend && (
                    <div className="trend-label">{card.trend.label}</div>
                  )}
                </div>
              </div>
              <FontAwesomeIcon 
                icon={card.icon} 
                className="stats-card-background-icon"
              />
              <Link to={card.link} className="stats-card-link">
                <FontAwesomeIcon icon={faEye} />
                <span>查看詳情</span>
              </Link>
            </div>
          );
        })}
      </div>

      {/* 主要內容區域 - 兩欄佈局 */}
      <div className="dashboard-content">
        {/* 左欄 */}
        <div className="dashboard-column">
          {/* 待辦事項卡片 */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>
                <FontAwesomeIcon icon={faTasks} className="card-header-icon" />
                待辦事項
                <span className="badge urgent-badge">{todoItems.filter(item => item.urgency === 'high').length}</span>
              </h2>
              <div className="card-actions">
                <button className="filter-btn">
                  <FontAwesomeIcon icon={faFilter} />
                </button>
                <Link to="/tasks" className="view-all">
                  管理任務 <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </div>
            </div>
            <div className="todo-list">
              {todoItems.map(item => (
                <div 
                  key={item.id} 
                  className={`todo-item urgency-${item.urgency} ${completedTasks.has(item.id) ? 'completed' : ''}`}
                >
                  <div className="todo-checkbox">
                    <input 
                      type="checkbox" 
                      checked={completedTasks.has(item.id)}
                      onChange={() => handleTaskComplete(item.id)}
                    />
                  </div>
                  <div className="todo-info">
                    <div className="todo-title">{item.title}</div>
                    <div className="todo-meta">
                      <span className="todo-assignee">
                        <FontAwesomeIcon icon={faUser} />
                        {item.assignee}
                      </span>
                      <span className="todo-category">{item.category}</span>
                      <span className="todo-due-date">
                        {item.dueDate}
                      </span>
                    </div>
                  </div>
                  <div className={`urgency-indicator urgency-${item.urgency}`}>
                    {item.urgency === 'high' && <FontAwesomeIcon icon={faExclamationCircle} />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 認證項目進度卡片 */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>
                <FontAwesomeIcon icon={faChartLine} className="card-header-icon" />
                認證項目進度
              </h2>
              <Link to="/certification-projects" className="view-all">
                所有認證項目 <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>
            <div className="certification-progress">
              {certificationProgress.map((cert, index) => (
                <div key={index} className="progress-item">
                  <div className="progress-header">
                    <div className="progress-title-section">
                      <span className="progress-title">{cert.name}</span>
                      <span className={`progress-status ${cert.status}`}>
                        {cert.status === 'completed' ? '已完成' : 
                         cert.status === 'in-progress' ? '進行中' : '規劃中'}
                      </span>
                    </div>
                    <span className="progress-percentage">{cert.progress}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-bg">
                      <div 
                        className="progress-bar-fill" 
                        style={{ 
                          width: `${cert.progress}%`, 
                          backgroundColor: getProgressColor(cert.status)
                        }}
                      ></div>
                    </div>
                    <div className="progress-deadline">
                      截止：{cert.deadline}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 認證類型分布圖表 */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>
                <FontAwesomeIcon icon={faChartLine} className="card-header-icon" />
                認證類型分布
              </h2>
            </div>
            <div className="chart-container">
              <Doughnut data={certificationDistributionData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        {/* 右欄 */}
        <div className="dashboard-column">
          {/* 最近活動卡片 */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>
                <FontAwesomeIcon icon={faFileAlt} className="card-header-icon" />
                最近活動
              </h2>
              <div className="activity-controls">
                <button className="notification-btn">
                  <FontAwesomeIcon icon={faBell} />
                  <span className="notification-count">3</span>
                </button>
              </div>
            </div>
            <div className="activity-list">
              {recentActivities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    <FontAwesomeIcon icon={getActivityIcon(activity.type)} />
                  </div>
                  <div className="activity-avatar">
                    {activity.user.charAt(0)}
                  </div>
                  <div className="activity-content">
                    <div className="activity-text">
                      <span className="activity-user">{activity.user}</span> 
                      {activity.action} 
                      <span className="activity-target">{activity.target}</span>
                    </div>
                    <div className="activity-time">{activity.timestamp}</div>
                  </div>
                  <div className="activity-arrow">
                    <FontAwesomeIcon icon={faChevronRight} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 文件到期提醒卡片 */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>
                <FontAwesomeIcon icon={faFileAlt} className="card-header-icon" />
                文件到期提醒
                <span className="badge warning-badge">{expiringDocuments.filter(doc => doc.status === 'urgent').length}</span>
              </h2>
              <Link to="/document-management" className="view-all">
                所有文件提醒 <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>
            <div className="expiring-documents">
              {expiringDocuments.map(doc => (
                <div key={doc.id} className={`expiring-document status-${doc.status}`}>
                  <div className="document-icon">
                    <FontAwesomeIcon icon={faFile} />
                  </div>
                  <div className="document-info">
                    <div className="document-name">{doc.name}</div>
                    <div className="document-expiry">
                      <span className="expiry-date">到期日：{doc.expiryDate}</span>
                      <span className={`days-left ${doc.status}`}>
                        {doc.daysLeft}天後到期
                      </span>
                    </div>
                  </div>
                  <div className={`status-indicator status-${doc.status}`}>
                    {doc.status === 'urgent' && <FontAwesomeIcon icon={faExclamationCircle} />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 文件狀態分布圖表 */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>
                <FontAwesomeIcon icon={faChartLine} className="card-header-icon" />
                文件狀態分布
              </h2>
            </div>
            <div className="chart-container">
              <Bar data={documentStatusData} options={barOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 