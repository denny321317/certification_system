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
  faChartLine, faTasks, faFileAlt, faArrowRight, faTrash,
  faArrowUp, faArrowDown, faRefresh, faBell, faEye, 
  faChevronRight, faCheckSquare, faPlus, faFilter, faUser
} from '@fortawesome/free-solid-svg-icons';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { AuthContext } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import './Dashboard.css';

// 註冊Chart.js組件
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * 儀表板組件
 * @returns {JSX.Element} 儀表板介面
 */
const Dashboard = ({ canWrite }) => {
  const { currentUser } = useContext(AuthContext);
  const { settings } = useSettings();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeStatsCard, setActiveStatsCard] = useState(null);

  const [documentCount, setDocumentCount] = useState(0);
  const [projectSummary, setProjectSummary] = useState('0 / 0');
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [todoCount, setTodoCount] = useState(0);
  const [urgentCount, setUrgentCount] = useState(0);

  const [isLoadingTodoCount, setIsLoadingTodoCount] = useState(true);

  const [certificationProgress, setCertificationProgress] = useState([]);
  const [expiringDocuments, setExpiringDocuments] = useState([]);

  const [recentActivities, setRecentActivities] = useState([]);
  const [todos, setTodos] = useState([]);
  const [showAddTodoModal, setShowAddTodoModal] = useState(false);
  const handleOpenAddTodoModal = () => setShowAddTodoModal(true);
  const handleCloseAddTodoModal = () => setShowAddTodoModal(false);

  const [isLoading, setIsLoading] = useState(true);

  const formatDate = (dateInput, includeTime = false) => {
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
        hour12: false,
      };
      if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
      }

      const formatter = new Intl.DateTimeFormat('en-US', options);
      const parts = formatter.formatToParts(date);
      
      const getPart = (partName) => parts.find(p => p.type === partName)?.value;

      const year = getPart('year');
      const month = getPart('month');
      const day = getPart('day');

      if (!year || !month || !day) {
        return date.toLocaleDateString('zh-TW', { timeZone: settings.timezone });
      }

      let formattedDate = settings.dateFormat
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day);
      
      if (includeTime) {
        const hour = getPart('hour');
        const minute = getPart('minute');
        if (hour && minute) {
          return `${formattedDate} ${hour}:${minute}`;
        }
      }
      
      return formattedDate;

    } catch (error) {
      console.error("Error formatting date:", error);
      return new Date(dateInput).toLocaleDateString();
    }
  };

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
  const handleTaskComplete = (taskId, checked) => {
    fetch(`http://localhost:8000/api/dashboard/todos/${taskId}/complete?completed=${checked}`, {
      method: 'PATCH',
    })
    .then(res => {
      if(res.ok){
        setTodos(prev => prev.map(todo => todo.id === taskId ? {...todo, completed: checked} : todo));
      }
    })
    .catch(err => console.error(err));
  };


  // 取得文件總數API
  useEffect(() => {
    const fetchDocumentCount = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/dashboard/document-count');
        const data = await response.json();
        setDocumentCount(data.totalDocuments);
      } catch (error) {
        console.error('抓取文件總數錯誤:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocumentCount();
  }, []);

  //取得完成的認證
  useEffect(() => {
  const fetchProjectCount = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/dashboard/project-count');
      const data = await response.json();
      setProjectSummary(data.summary);  // 這裡拿 summary 字串
    } catch (error) {
      console.error('抓取專案進度錯誤:', error);
    }
  };

  fetchProjectCount();
  }, []);

  //即將到期項目
  useEffect(() => {
    const fetchUpcomingDeadlines = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/dashboard/upcoming-deadlines');
        const data = await response.json();
        setUpcomingCount(data.totalUpcoming);
      } catch (error) {
        console.error('抓取即將到期項目錯誤:', error);
      }
    };

    fetchUpcomingDeadlines();
  }, []);

  //取得待辦清單數量
  useEffect(() => {
    const fetchTodoCount = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/dashboard/todos/count');
        const data = await response.json(); // 後端回傳的是 Long
        setTodoCount(data); // 直接設置數值
      } catch (error) {
        console.error('抓取 Todo 總數錯誤:', error);
      } finally {
        setIsLoadingTodoCount(false);
      }
    };

    fetchTodoCount();
  }, []);

  //if (isLoading) return <div>載入中...</div>;

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
      value: documentCount, 
      icon: faFile, 
      color: '#3b82f6',
      link: '/document-management',
      // trend: { direction: 'up', value: 12, label: '較上月(無後端)' }
    },
    { 
      title: '完成認證', 
      value: projectSummary, 
      icon: faCheckCircle, 
      color: '#10b981',
      link: '/certification-projects',
      // trend: { direction: 'up', value: 1, label: '本月新增(無後端)' }
    },
    { 
      title: '待處理任務', 
      value: isLoadingTodoCount ? '載入中...' : todoCount, 
      urgentCount: urgentCount,
      icon: faExclamationCircle, 
      color: '#f59e0b',
      link: '/tasks',
      // trend: { direction: 'down', value: 5, label: '較上週(無後端)' }
    },
    { 
      title: '即將到期項目', 
      value: upcomingCount, 
      description: '未來30天內',
      icon: faExclamationCircle, 
      color: '#ef4444',
      link: '/upcoming-items',
      // trend: { direction: 'up', value: 2, label: '需要關注' }
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
  //所有認證專案
  useEffect(() => {
    fetch('http://localhost:8000/api/dashboard/project-count')
      .then(res => res.json())
      .then(data => {
        if (data.projects) {
          setCertificationProgress(data.projects);
        }
      })
      .catch(err => console.error('抓取認證專案錯誤:', err));
  }, []);

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
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    urgency: "medium",
    dueDate: "",
    category: ""
  });

  // 新增Todo
  const handleAddTodo = (e) => {
    e.preventDefault();
    fetch("http://localhost:8000/api/dashboard/create/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTodo)
    })
    .then(res => res.json())
    .then(data => {
      setTodos(prev => [...prev, { ...data, assignee: "小明" }]);
      handleCloseAddTodoModal();
    })
    .catch(err => console.error(err));
  };

  useEffect(() => {
    fetch('http://localhost:8000/api/dashboard/todos')
      .then(res => res.json())
      .then(data => {
        // 後端回傳 TodoDTO 陣列
        const mapped = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          urgency: item.urgency,
          dueDate: item.dueDate,
          category: item.category,
          completed: item.completed,
          assignee: "小明" // 先寫死
        }));
        setTodos(mapped);
        setUrgentCount(data.filter(todo => todo.urgency === 'high').length);
      })
      .catch(err => console.error('抓取 Todo 錯誤:', err));
  }, []);

  const handleDelete = (taskId) => {
    const confirmDelete = window.confirm("確定要刪除這個待辦嗎？");
    if (!confirmDelete) return; // 使用者取消

    fetch(`http://localhost:8000/api/dashboard/delete/todos/${taskId}`, {
      method: 'DELETE',
    })
      .then(res => {
        if (res.ok) {
          // 刪除成功後更新前端列表
          setTodos(prev => prev.filter(todo => todo.id !== taskId));
          // 若該任務已完成，也從 completedTasks 移除
          setCompletedTasks(prev => {
            const updated = new Set(prev);
            updated.delete(taskId);
            return updated;
          });
        } else {
          console.error('刪除失敗');
        }
      })
      .catch(err => console.error('刪除 Todo 錯誤:', err));
  };
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
  useEffect(() => {
    fetch('http://localhost:8000/api/dashboard/recent-history')
      .then(res => res.json())
      .then(data => {
        console.log('抓到的歷史活動資料:', data);
        if (data && Array.isArray(data)) {
          const mapped = data.map(item => ({
            id: item.id,
            user: item.user || '未知用戶',
            target: item.target || '',
            timestamp: item.timestamp || '',
            type: item.type || 'operation',
          }));
          console.log('mapped:', mapped);
          setRecentActivities(mapped);
        }
      })
      .catch(err => console.error('抓取歷史任務錯誤:', err));
  }, []);



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
  // 根據剩餘天數決定狀態
  function getStatus(daysLeft) {
    if (daysLeft <= 7) return 'urgent';       // 7天內非常緊急
    if (daysLeft <= 30) return 'warning';     // 30天內需要注意
    return 'normal';                           // 超過30天正常
  }

  useEffect(() => {
    async function fetchExpiringDocuments() {
      try {
        const response = await fetch('http://localhost:8000/api/dashboard/upcoming-deadlines');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const docs = data.projects.map((proj, index) => ({
          id: index + 1,
          name: proj.name,
          expiryDate: proj.deadline,
          daysLeft: proj.daysLeft,
          // status依據dayLeft判斷
          status: getStatus(proj.daysLeft),
        }));

        setExpiringDocuments(docs);
      } catch (error) {
        console.error('抓取即將到期文件錯誤:', error);
      }
    }

    fetchExpiringDocuments();
  }, []);

  /**
   * 認證類型分布圖表配置
   * @type {Object} Chart.js圖表數據配置
   */
    const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 2,
      hoverBackgroundColor: []
    }]
  });

  useEffect(() => {
    const backgroundColors = [
      'rgba(59, 130, 246, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(99, 102, 241, 0.8)'
    ];
    const borderColors = backgroundColors.map(c => c.replace('0.8', '1'));
    const hoverBackgroundColors = backgroundColors.map(c => c.replace('0.8', '0.9'));

    fetch('http://localhost:8000/api/dashboard/certification-distribution')
      .then(res => res.json())
      .then(data => {
        const total = data.data.reduce((sum, val) => sum + val, 0);
        const percentages = data.data.map(val => (val / total) * 100);
        const labels = data.labels.map(label => label ?? '未知');
        setChartData({
          labels,
          datasets: [{
            data: percentages,
            backgroundColor: backgroundColors.slice(0, labels.length),
            borderColor: borderColors.slice(0, labels.length),
            borderWidth: 2,
            hoverBackgroundColor: hoverBackgroundColors.slice(0, labels.length)
          }]
        });
      })
      .catch(err => console.error('抓取認證類型分布錯誤:', err));
  }, []);
  
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
              weekday: 'long',
              timeZone: settings?.timezone
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
                待辦事項(串接使用者未完成)
                <span className="badge urgent-badge">
                  {todos.filter(item => item.completed).length}
                </span>
              </h2>
              <div className="card-actions">
                <button className="filter-btn">
                  <FontAwesomeIcon icon={faFilter} />
                </button>
                <button
                  onClick={handleOpenAddTodoModal}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    margin: 0,
                    cursor: 'pointer',
                    color: 'blue', // 或你想要的文字顏色
                    fontSize: '1rem', // 可調整大小
                  }}
                >
                  管理任務 <FontAwesomeIcon icon={faArrowRight} />
                </button>

              </div>
            </div>

            <div className="todo-list">
              {todos.map(item => (
                <div 
                  key={item.id} 
                  className={`todo-item urgency-${item.urgency} ${item.completed ? 'completed' : ''}`}
                >
                  <div className="todo-checkbox">
                    <input 
                      type="checkbox" 
                      checked={item.completed}  // 用後端 completed
                      onChange={e => handleTaskComplete(item.id, e.target.checked)}
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
                      <span className="todo-due-date">{item.dueDate}</span>
                    </div>
                  </div>
                  <div className={`urgency-indicator urgency-${item.urgency}`}>
                    {item.urgency === 'high' && <FontAwesomeIcon icon={faExclamationCircle} />}
                  </div>
                  <button 
                    onClick={() => handleDelete(item.id)} 
                    className="delete-btn"
                    style={{
                      cursor: 'pointer',
                      color: 'black',   // 想要的顏色
                      border: 'none',
                      background: 'transparent',
                      padding: 0,
                      margin: 0,
                    }}
                    title="刪除"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
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
              <Doughnut data={chartData} options={doughnutOptions} />
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
                <span className="badge warning-badge">{expiringDocuments.filter(doc => doc.status != '').length}</span>
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
                文件狀態分布(後端還沒寫)
              </h2>
            </div>
            <div className="chart-container">
              <Bar data={documentStatusData} options={barOptions} />
            </div>
          </div>
        </div>
        {/* 新增 Todo Modal */}
        {showAddTodoModal && (
          <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">新增 Todo</h5>
                  <button type="button" className="btn-close" onClick={handleCloseAddTodoModal}></button>
                </div>
                <form onSubmit={handleAddTodo}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">標題</label>
                      <input
                        className="form-control"
                        value={newTodo.title}
                        onChange={e => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">截止日期</label>
                      <input
                        type="date"
                        className="form-control"
                        value={newTodo.dueDate}
                        onChange={e => setNewTodo(prev => ({ ...prev, dueDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">緊急程度</label>
                      <select
                        className="form-select"
                        value={newTodo.urgency}
                        onChange={e => setNewTodo(prev => ({ ...prev, urgency: e.target.value }))}
                        required
                      >
                        <option value="high">高</option>
                        <option value="medium">中</option>
                        <option value="low">低</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">類別</label>
                      <input
                        className="form-control"
                        value={newTodo.category}
                        onChange={e => setNewTodo(prev => ({ ...prev, category: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseAddTodoModal}>取消</button>
                    <button type="submit" className="btn btn-primary">新增</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 