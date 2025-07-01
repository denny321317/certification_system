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

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFile, faCheckCircle, faExclamationCircle, faCalendarAlt,
  faChartLine, faTasks, faFileAlt, faArrowRight, faClock
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
const Dashboard = ({ canWrite }) => {
  const { currentUser } = useContext(AuthContext);

  /**
   * 統計卡片數據結構
   * @type {Array<{
   *   title: string,      // 卡片標題
   *   value: number|string, // 統計值
   *   icon: IconDefinition, // FontAwesome圖標
   *   color: string,      // 主題顏色
   *   link: string,       // 跳轉連結
   *   urgentCount?: number, // 緊急項目數量（可選）
   *   description?: string  // 補充說明（可選）
   * }>}
   */
  const statsCards = [
    { 
      title: '文件總數', 
      value: 246, 
      icon: faFile, 
      color: '#3b82f6',
      link: '/document-management' 
    },
    { 
      title: '完成認證', 
      value: '5/8', 
      icon: faCheckCircle, 
      color: '#10b981',
      link: '/certification-projects' 
    },
    { 
      title: '待處理任務', 
      value: 18, 
      urgentCount: 3,
      icon: faExclamationCircle, 
      color: '#f59e0b',
      link: '/tasks' 
    },
    { 
      title: '即將到期項目', 
      value: 7, 
      description: '未來30天內',
      icon: faCalendarAlt, 
      color: '#ef4444',
      link: '/upcoming-items' 
    }
  ];

  /**
   * 認證項目進度數據結構
   * @type {Array<{
   *   name: string,     // 認證名稱
   *   progress: number  // 完成百分比
   * }>}
   */
  const certificationProgress = [
    { name: 'SMETA 4支柱認證', progress: 75 },
    { name: 'ISO 14001', progress: 90 },
    { name: 'ISO 9001', progress: 100 },
    { name: 'SA8000', progress: 40 }
  ];

  /**
   * 待辦事項數據結構
   * @type {Array<{
   *   id: number,       // 項目ID
   *   title: string,    // 項目標題
   *   urgency: string,  // 緊急程度（high|medium|low）
   *   dueDate: string   // 截止日期
   * }>}
   */
  const todoItems = [
    { 
      id: 1, 
      title: '更新ESG報告文件', 
      urgency: 'high', 
      dueDate: '2023/6/15' 
    },
    { 
      id: 2, 
      title: '準備ISO 9001內部審核', 
      urgency: 'medium',
      dueDate: '2023/6/22' 
    },
    { 
      id: 3, 
      title: '完成供應商評估表格', 
      urgency: 'low', 
      dueDate: '2023/6/30' 
    },
    { 
      id: 4, 
      title: '審核安全合規文件', 
      urgency: 'high', 
      dueDate: '2023/6/18' 
    }
  ];

  /**
   * 最近活動數據結構
   * @type {Array<{
   *   id: number,      // 活動ID
   *   user: string,    // 用戶名稱
   *   action: string,  // 執行的動作
   *   target: string,  // 操作對象
   *   timestamp: string // 時間戳
   * }>}
   */
  const recentActivities = [
    { 
      id: 1, 
      user: '李小明', 
      action: '上傳了文件', 
      target: '2023年第一季度ESG報告.pdf', 
      timestamp: '今天 09:45' 
    },
    { 
      id: 2, 
      user: '王大力', 
      action: '更新了認證進度', 
      target: 'ISO 14001 環境管理系統', 
      timestamp: '昨天 16:30' 
    },
    { 
      id: 3, 
      user: currentUser?.name || '張三豐', 
      action: '完成了任務', 
      target: '準備SMETA審核文件', 
      timestamp: '2023/6/10 14:15' 
    },
    { 
      id: 4, 
      user: '林小華', 
      action: '新增了供應商', 
      target: '台灣綠色科技有限公司', 
      timestamp: '2023/6/9 11:20' 
    }
  ];

  /**
   * 文件到期提醒數據結構
   * @type {Array<{
   *   id: number,      // 文件ID
   *   name: string,    // 文件名稱
   *   expiryDate: string, // 到期日期
   *   status: string   // 狀態（urgent|warning|normal）
   * }>}
   */
  const expiringDocuments = [
    { 
      id: 1, 
      name: '職業安全評估報告', 
      expiryDate: '2023/6/20', 
      status: 'urgent' 
    },
    { 
      id: 2, 
      name: '環境影響評估證書', 
      expiryDate: '2023/7/5', 
      status: 'warning' 
    },
    { 
      id: 3, 
      name: 'ISO 9001證書', 
      expiryDate: '2023/8/15', 
      status: 'normal' 
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
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#6366f1'],
        borderWidth: 0,
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
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6b7280'],
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
        },
      },
    },
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
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>儀表板</h1>
        <div className="date-info">
          <FontAwesomeIcon icon={faCalendarAlt} className="date-icon" />
          <span>{new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
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
            <div key={index} className={`stats-card ${colorClass}`}>
              <div className="stats-card-content">
                <div className="stats-card-header">
                  <div className="stats-card-title">
                    <div className="stats-card-icon">
              <FontAwesomeIcon icon={card.icon} />
            </div>
                    {card.title}
                  </div>
                </div>
                <div className="stats-card-value">
                  {card.value}
              {card.urgentCount && (
                    <span className="stats-card-urgent">
                      (含 {card.urgentCount} 個緊急)
                    </span>
                  )}
                </div>
              {card.description && (
                  <div className="stats-card-description">{card.description}</div>
              )}
              </div>
              <FontAwesomeIcon 
                icon={card.icon} 
                className="stats-card-background-icon"
              />
              <Link to={card.link} className="stats-card-link" />
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
              </h2>
              <Link to="/tasks" className="view-all">
                管理任務 <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>
            <div className="todo-list">
              {todoItems.map(item => (
                <div key={item.id} className={`todo-item urgency-${item.urgency}`}>
                  <div className="todo-info">
                    <div className="todo-title">{item.title}</div>
                    <div className="todo-due-date">
                      <FontAwesomeIcon icon={faClock} className="due-date-icon" />
                      {item.dueDate}
                    </div>
                  </div>
                  <div className={`urgency-indicator urgency-${item.urgency}`}></div>
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
                    <span className="progress-title">{cert.name}</span>
                    <span className="progress-percentage">{cert.progress}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill" 
                      style={{ 
                        width: `${cert.progress}%`, 
                        backgroundColor: cert.progress === 100 ? '#10b981' : '#3b82f6'
                      }}
                    ></div>
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
            </div>
            <div className="activity-list">
              {recentActivities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-avatar">
                    {activity.user.charAt(0)}
                  </div>
                  <div className="activity-content">
                    <div className="activity-text">
                      <span className="activity-user">{activity.user}</span> 
                      {activity.action} <span className="activity-target">{activity.target}</span>
                    </div>
                    <div className="activity-time">{activity.timestamp}</div>
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
              </h2>
              <Link to="/document-management" className="view-all">
                所有文件提醒 <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>
            <div className="expiring-documents">
              {expiringDocuments.map(doc => (
                <div key={doc.id} className={`expiring-document status-${doc.status}`}>
                  <div className="document-info">
                    <div className="document-name">{doc.name}</div>
                    <div className="document-expiry">
                      <FontAwesomeIcon icon={faClock} className="expiry-icon" />
                      到期日：{doc.expiryDate}
                    </div>
                  </div>
                  <div className={`status-indicator status-${doc.status}`}></div>
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