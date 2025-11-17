/**
 * 報告分析組件
 * 
 * 此組件提供企業認證系統的報告分析功能，包含：
 * 1. 認證項目統計概覽
 * 2. 認證進度追蹤
 * 3. 缺失項目分析
 * 4. 趨勢分析圖表
 * 5. 完成項目追蹤
 * 
 * 特點：
 * - 提供多種統計圖表（柱狀圖、圓餅圖、環形圖）
 * - 支持數據導出和列印
 * - 包含詳細的缺失項目追蹤
 * - 提供完整的進度分析
 * 
 * 使用方式：
 * ```jsx
 * <ReportsAnalysis />
 * ```
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDownload, 
  faPrint, 
  faFilter,
  faCheckSquare, 
  faCheckCircle, 
  faHourglassHalf, 
  faExclamationTriangle,
  faArrowTrendUp,
  faArrowTrendDown,
  faExclamationCircle,
  faPlayCircle,
  faChartLine,
  faChartPie,
  faChartBar,
  faSearch,
  faRefresh,
  faCog,
  faExpand,
  faCompress,
  faFileExcel,
  faFilePdf,
  faFileWord,
  faCalendarAlt,
  faSortAmountDown,
  faSortAmountUp,
  faEye,
  faEyeSlash,
  faTasks,
  faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import Chart from 'chart.js/auto';
import './ReportsAnalysis.css';

const CERT_TYPE_OPTIONS = [
  { label: '全部認證', value: '' },
  { label: 'SMETA', value: 'SMETA' },
  { label: 'ISO 14001', value: 'ISO 14001' },
  { label: 'ISO 9001', value: 'ISO 9001' },
  { label: 'SA8000', value: 'SA8000' }
];

/**
 * 報告分析組件
 * @returns {JSX.Element} 報告分析介面
 */
const ReportsAnalysis = () => {
  /**
   * 當前選中的標籤狀態
   * @type {[string, Function]} [當前標籤, 設置當前標籤的函數]
   */
  const [activeTab, setActiveTab] = useState('綜合報表');

  // 新增一個 state 來存放從後端獲取的缺失項目
  const [issues, setIssues] = useState([]);

  /**
   * 圖表引用
   * @type {React.MutableRefObject<HTMLCanvasElement>} 圖表Canvas元素引用
   */
  const projectProgressChartRef = useRef(null);
  const certTypeChartRef = useRef(null);
  const issueTypeChartRef = useRef(null);
  
  /**
   * 篩選狀態
   * @type {[string, Function]} [篩選認證類型, 設置篩選認證類型的函數]
   */
  const [filterCertType, setFilterCertType] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // 第三階段優化：新增狀態管理
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // 秒
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    certType: true,
    severity: true,
    discoveryDate: true,
    status: true
  });
  const [exportFormat, setExportFormat] = useState('excel');
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());

  // 趨勢分析新增狀態
  const [trendChartType, setTrendChartType] = useState('line'); // line, bar, area
  const [trendTimeRange, setTrendTimeRange] = useState('12months'); // 6months, 12months, 24months
  const [trendMetric, setTrendMetric] = useState('count'); // count, progress, resolution_rate
  const [showTrendComparison, setShowTrendComparison] = useState(false);
  const [selectedTrendCerts, setSelectedTrendCerts] = useState(['SMETA', 'ISO 14001']); // 用於對比的認證類型

  /**
   * 圖表實例引用
   */
  const progressChartInstance = useRef(null);
  const typeChartInstance = useRef(null);
  const issueChartInstance = useRef(null);
  const trendChartInstance = useRef(null);
  const refreshTimerRef = useRef(null);

  /**
   * 認證專案進度數據（與認證專案頁面同步）
   * @type {Array<{
   *   name: string,         // 專案名稱
   *   progress: number,     // 完成進度
   *   status: string       // 專案狀態
   * }>}
   */
  const projectProgressData = [
    { name: 'SMETA 4支柱認證', progress: 75, status: 'in-progress' },
    { name: 'ISO 14001 環境管理系統', progress: 90, status: 'in-progress' },
    { name: 'ISO 9001 品質管理系統', progress: 100, status: 'completed' },
    { name: 'SA8000 社會責任認證', progress: 0, status: 'planned' }
  ];

  /**
   * 初始化圖表
   * 在組件掛載後創建各種統計圖表
   */
  useEffect(() => {
    // 清理現有圖表實例
    const cleanupCharts = () => {
      if (progressChartInstance.current) {
        progressChartInstance.current.destroy();
        progressChartInstance.current = null;
      }
      if (typeChartInstance.current) {
        typeChartInstance.current.destroy();
        typeChartInstance.current = null;
      }
      if (issueChartInstance.current) {
        issueChartInstance.current.destroy();
        issueChartInstance.current = null;
      }
      if (trendChartInstance.current) {
        trendChartInstance.current.destroy();
        trendChartInstance.current = null;
      }
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };

    // 初始化圖表
    const initCharts = () => {
      // 先清理現有圖表
      cleanupCharts();

      if (projectProgressChartRef.current) {
        // 認證進度圖表
        const progressCtx = projectProgressChartRef.current.getContext('2d');
        progressChartInstance.current = new Chart(progressCtx, {
          type: 'bar',
          data: {
            labels: projectProgressData.map(project => project.name.replace(/認證|系統/g, '').trim()),
            datasets: [{
              label: '當前進度',
              data: projectProgressData.map(project => project.progress),
              backgroundColor: projectProgressData.map(project => {
                if (project.progress === 100) return '#22c55e';  // 綠色 - 已完成
                if (project.progress >= 70) return '#3b82f6';    // 藍色 - 進度良好
                if (project.progress >= 30) return '#f59e0b';    // 橙色 - 中等進度
                return '#64748b';                                // 灰色 - 尚未開始
              }),
              borderWidth: 0,
              borderRadius: 4,
              borderSkipped: false,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                  callback: function(value) {
                    return value + '%';
                  }
                }
              },
              x: {
                ticks: {
                  maxRotation: 45,
                  minRotation: 0
                }
              }
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `完成度: ${context.parsed.y}%`;
                  }
                }
              }
            }
          }
        });
      }
      
      if (certTypeChartRef.current) {
        // 認證類型分布圖表
        const typeCtx = certTypeChartRef.current.getContext('2d');
        typeChartInstance.current = new Chart(typeCtx, {
          type: 'doughnut',
          data: {
            labels: ['SMETA', 'ISO 14001', 'ISO 9001', 'SA8000'],
            datasets: [{
              data: [5, 3, 3, 1],
              backgroundColor: [
                '#3b82f6',
                '#10b981',
                '#f59e0b',
                '#ef4444'
              ],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: {
                display: false
              }
            }
          }
        });
      }
      
      if (issueTypeChartRef.current) {
        // 缺失項目分類圖表
        const issueCtx = issueTypeChartRef.current.getContext('2d');
        issueChartInstance.current = new Chart(issueCtx, {
          type: 'pie',
          data: {
            labels: ['勞工權益', '環境管理', '職業安全', '品質管理', '商業道德'],
            datasets: [{
              data: [10, 6, 4, 3, 1],
              backgroundColor: [
                '#3b82f6',
                '#10b981',
                '#f59e0b',
                '#8b5cf6',
                '#ec4899'
              ],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  boxWidth: 10,
                  padding: 10,
                  font: {
                    size: 11
                  }
                }
              }
            }
          }
        });
      }
    };

    // 延遲執行以確保DOM元素已經加載
    const timer = setTimeout(() => {
      initCharts();
    }, 100);

    return () => {
      clearTimeout(timer);
      cleanupCharts();
    };
  }, []);

  /**
   * 缺失項目數據結構 (現在會從後端獲取，這裡的註解留作參考)
   * @type {Array<{
   *   name: string,         // 問題名稱
   *   certType: string,     // 認證類型
   *   severity: string,     // 嚴重程度（high/medium/low）
   *   discoveryDate: string, // 發現日期
   *   status: string,       // 狀態（in-progress/completed）
   *   progress: number      // 完成進度
   * }>}
   */
  // const issues = [
  //   {
  //     name: '工時記錄不完整',
  //     certType: 'SMETA',
  //     severity: 'high',
  //     discoveryDate: '2023-08-15',
  //     status: 'in-progress',
  //     progress: 75
  //   },
  //   {
  //     name: '環境管理記錄缺漏',
  //     certType: 'ISO 14001',
  //     severity: 'medium',
  //     discoveryDate: '2023-07-20',
  //     status: 'completed',
  //     progress: 100
  //   },
  //   {
  //     name: '職業安全培訓未定期執行',
  //     certType: 'SMETA',
  //     severity: 'high',
  //     discoveryDate: '2023-09-05',
  //     status: 'in-progress',
  //     progress: 40
  //   },
  //   {
  //     name: '品質控制程序未文件化',
  //     certType: 'ISO 9001',
  //     severity: 'medium',
  //     discoveryDate: '2023-08-02',
  //     status: 'completed',
  //     progress: 100
  //   },
  //   {
  //     name: '廢棄物處理不符合規範',
  //     certType: 'ISO 14001',
  //     severity: 'high',
  //     discoveryDate: '2023-09-10',
  //     status: 'in-progress',
  //     progress: 20
  //   }
  // ];

  /**
   * 已完成項目數據結構
   * @type {Array<{
   *   name: string,         // 項目名稱
   *   responsible?: string, // 負責人（可選）
   *   certType?: string,   // 認證類型（可選）
   *   date: string         // 完成日期
   * }>}
   */
  const completedItems = [
    {
      name: 'ISO 9001 品質管理系統認證',
      responsible: '張經理',
      date: '2023-08-15'
    },
    {
      name: '環境管理記錄更新',
      certType: 'ISO 14001',
      date: '2023-09-20'
    },
    {
      name: '品質控制程序文件化',
      certType: 'ISO 9001',
      date: '2023-09-15'
    },
    {
      name: '工會組織架構更新',
      certType: 'SMETA',
      date: '2023-09-01'
    }
  ];

  /**
   * 格式化日期為 YYYY/MM/DD
   * @param {string} dateString - 日期字串 (YYYY-MM-DD)
   * @returns {string} 格式化後的日期
   */
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  /**
   * 渲染嚴重程度標籤
   * @param {string} severity - 嚴重程度（high/medium/low）
   * @returns {JSX.Element} 嚴重程度標籤元素
   */
  const renderSeverityBadge = (severity) => {
    let badgeClass, icon, text;
    
    switch (severity) {
      case 'high':
        badgeClass = 'status-badge critical';
        icon = faExclamationCircle;
        text = '高';
        break;
      case 'medium':
        badgeClass = 'status-badge warning';
        icon = faExclamationTriangle;
        text = '中';
        break;
      default:
        badgeClass = 'status-badge';
        icon = faExclamationTriangle;
        text = '低';
    }
    
    return (
      <div className={badgeClass}>
        <FontAwesomeIcon icon={icon} className="me-1" />
        {text}
      </div>
    );
  };

  /**
   * 渲染狀態標籤
   * @param {string} status - 狀態（in-progress/completed/planned）
   * @returns {JSX.Element} 狀態標籤元素
   */
  const renderStatusBadge = (status) => {
    let badgeClass, icon, text;
    
    switch (status) {
      case 'in-progress':
      case '進行中':
        badgeClass = 'status-badge in-progress';
        icon = faPlayCircle;
        text = '進行中';
        break;
      case 'completed':
      case '已解決':
        badgeClass = 'status-badge completed';
        icon = faCheckCircle;
        text = '已解決';
        break;
      default:
        badgeClass = 'status-badge planned';
        icon = faPlayCircle;
        text = '計畫中';
    }
    
    return (
      <div className={badgeClass}>
        <FontAwesomeIcon icon={icon} className="me-1" />
        {text}
      </div>
    );
  };

  /**
   * 渲染進度條
   * @param {number} progress - 完成進度（0-100）
   * @returns {JSX.Element} 進度條元素
   */
  const renderProgressBar = (progress) => {
    let barColor;
    
    if (progress === 100) {
      barColor = 'var(--success)';
    } else if (progress >= 60) {
      barColor = 'var(--primary-color)';
    } else if (progress >= 30) {
      barColor = 'var(--warning)';
    } else {
      barColor = 'var(--danger)';
    }
    
    return (
      <div className="d-flex align-items-center">
        <div className="percentage-bar me-2">
          <div 
            className="percentage-fill" 
            style={{
              width: `${progress}%`, 
              backgroundColor: barColor
            }}
          ></div>
        </div>
        <div>{progress}%</div>
      </div>
    );
  };

  // 第三階段優化：高級篩選、搜索和排序功能
  const filteredAndSortedIssues = useMemo(() => {
    let filtered = issues.filter(issue => {
      // 基本篩選
      const matchType = !filterCertType || issue.certType === filterCertType;
      const matchFrom = !filterDateFrom || issue.discoveryDate >= filterDateFrom;
      const matchTo = !filterDateTo || issue.discoveryDate <= filterDateTo;
      
      // 高級篩選
      const matchSeverity = !selectedSeverity || issue.severity === selectedSeverity;
      const matchStatus = !selectedStatus || issue.status === selectedStatus;
      
      // 搜索 (更新 issue 的 name 為 issueName)
      const matchSearch = !searchQuery || 
        issue.issueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.certType.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchType && matchFrom && matchTo && matchSeverity && matchStatus && matchSearch;
    });

    // 排序 (更新 issue 的 name 為 issueName)
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.issueName.toLowerCase();
          bValue = b.issueName.toLowerCase();
          break;
        case 'certType':
          aValue = a.certType.toLowerCase();
          bValue = b.certType.toLowerCase();
          break;
        case 'severity':
          const severityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          aValue = severityOrder[a.severity] || 0;
          bValue = severityOrder[b.severity] || 0;
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'date':
        default:
          aValue = new Date(a.discoveryDate);
          bValue = new Date(b.discoveryDate);
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [issues, filterCertType, filterDateFrom, filterDateTo, selectedSeverity, selectedStatus, searchQuery, sortBy, sortOrder]);

  // 數據導出功能
  const exportData = useCallback((format = 'excel') => {
    const data = filteredAndSortedIssues.map(issue => ({
      '問題名稱': issue.issueName, // 更新 issue 的 name 為 issueName
      '認證類型': issue.certType,
      '嚴重程度': issue.severity, // 後端已處理好，直接使用
      '發現日期': formatDate(issue.discoveryDate),
      '狀態': issue.status // 後端已處理好，直接使用
    }));

    if (format === 'excel') {
      // 模擬Excel導出
      const csvContent = [
        Object.keys(data[0]).join(','),
        ...data.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `缺失項目報表_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } else if (format === 'pdf') {
      // 模擬PDF導出
      alert('PDF 導出功能開發中，敬請期待！');
    }
  }, [filteredAndSortedIssues]);

  // 自動刷新功能
  useEffect(() => {
    if (isAutoRefresh && refreshInterval > 0) {
      refreshTimerRef.current = setInterval(() => {
        setLastRefreshTime(new Date());
        // 這裡可以添加實際的數據刷新邏輯
        console.log('自動刷新數據...');
      }, refreshInterval * 1000);
    } else {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    }

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [isAutoRefresh, refreshInterval]);

  // 手動刷新功能
  const handleManualRefresh = useCallback(() => {
    setLastRefreshTime(new Date());
    // 這裡可以添加實際的數據刷新邏輯
    console.log('手動刷新數據...');
  }, []);

  // 切換列可見性
  const toggleColumnVisibility = useCallback((column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  }, []);

  // 重置篩選器
  const resetFilters = useCallback(() => {
    setFilterCertType('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setSelectedSeverity('');
    setSelectedStatus('');
    setSearchQuery('');
    setSortBy('date');
    setSortOrder('desc');
  }, []);

  // 使用 useEffect 從後端 API 獲取缺失項目資料
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/reports/deficiency-items');
        if (!response.ok) {
          throw new Error('無法獲取缺失項目資料');
        }
        const data = await response.json();
        setIssues(data);
      } catch (error) {
        console.error('獲取缺失項目失敗:', error);
        // 可以在此處設定錯誤狀態，並在 UI 上顯示錯誤訊息
      }
    };

    fetchIssues();
  }, []); // 空依賴陣列，確保只在元件首次渲染時執行一次

  // 1. 新增年度趨勢資料（假資料，可根據 filterCertType、filterDateFrom、filterDateTo 篩選）
  const trendData = [
    { 
      month: '2023-01', 
      SMETA: { count: 1, resolved: 0, progress: 20 }, 
      'ISO 14001': { count: 0, resolved: 0, progress: 0 }, 
      'ISO 9001': { count: 1, resolved: 1, progress: 100 }, 
      SA8000: { count: 0, resolved: 0, progress: 0 } 
    },
    { 
      month: '2023-02', 
      SMETA: { count: 2, resolved: 1, progress: 40 }, 
      'ISO 14001': { count: 1, resolved: 0, progress: 30 }, 
      'ISO 9001': { count: 1, resolved: 1, progress: 100 }, 
      SA8000: { count: 0, resolved: 0, progress: 0 } 
    },
    { 
      month: '2023-03', 
      SMETA: { count: 2, resolved: 1, progress: 60 }, 
      'ISO 14001': { count: 1, resolved: 1, progress: 80 }, 
      'ISO 9001': { count: 1, resolved: 1, progress: 100 }, 
      SA8000: { count: 0, resolved: 0, progress: 0 } 
    },
    { 
      month: '2023-04', 
      SMETA: { count: 3, resolved: 2, progress: 65 }, 
      'ISO 14001': { count: 1, resolved: 1, progress: 85 }, 
      'ISO 9001': { count: 2, resolved: 2, progress: 100 }, 
      SA8000: { count: 0, resolved: 0, progress: 0 } 
    },
    { 
      month: '2023-05', 
      SMETA: { count: 4, resolved: 2, progress: 70 }, 
      'ISO 14001': { count: 2, resolved: 1, progress: 75 }, 
      'ISO 9001': { count: 2, resolved: 2, progress: 100 }, 
      SA8000: { count: 1, resolved: 0, progress: 15 } 
    },
    { 
      month: '2023-06', 
      SMETA: { count: 5, resolved: 3, progress: 75 }, 
      'ISO 14001': { count: 2, resolved: 2, progress: 90 }, 
      'ISO 9001': { count: 3, resolved: 3, progress: 100 }, 
      SA8000: { count: 1, resolved: 0, progress: 25 } 
    },
    { 
      month: '2023-07', 
      SMETA: { count: 6, resolved: 4, progress: 78 }, 
      'ISO 14001': { count: 3, resolved: 2, progress: 85 }, 
      'ISO 9001': { count: 3, resolved: 3, progress: 100 }, 
      SA8000: { count: 1, resolved: 0, progress: 40 } 
    },
    { 
      month: '2023-08', 
      SMETA: { count: 7, resolved: 5, progress: 80 }, 
      'ISO 14001': { count: 3, resolved: 3, progress: 95 }, 
      'ISO 9001': { count: 4, resolved: 4, progress: 100 }, 
      SA8000: { count: 2, resolved: 1, progress: 60 } 
    },
    { 
      month: '2023-09', 
      SMETA: { count: 8, resolved: 6, progress: 82 }, 
      'ISO 14001': { count: 4, resolved: 3, progress: 90 }, 
      'ISO 9001': { count: 4, resolved: 4, progress: 100 }, 
      SA8000: { count: 2, resolved: 1, progress: 70 } 
    },
    { 
      month: '2023-10', 
      SMETA: { count: 9, resolved: 7, progress: 85 }, 
      'ISO 14001': { count: 4, resolved: 4, progress: 95 }, 
      'ISO 9001': { count: 5, resolved: 5, progress: 100 }, 
      SA8000: { count: 3, resolved: 2, progress: 75 } 
    },
    { 
      month: '2023-11', 
      SMETA: { count: 10, resolved: 8, progress: 88 }, 
      'ISO 14001': { count: 5, resolved: 4, progress: 92 }, 
      'ISO 9001': { count: 5, resolved: 5, progress: 100 }, 
      SA8000: { count: 3, resolved: 2, progress: 80 } 
    },
    { 
      month: '2023-12', 
      SMETA: { count: 11, resolved: 9, progress: 90 }, 
      'ISO 14001': { count: 5, resolved: 5, progress: 98 }, 
      'ISO 9001': { count: 6, resolved: 6, progress: 100 }, 
      SA8000: { count: 4, resolved: 3, progress: 85 } 
    }
  ];

  // 2. 動態圖表資料（根據篩選條件）
  const filteredTrendData = useMemo(() => {
    // 根據時間範圍篩選
    let months = 12;
    if (trendTimeRange === '6months') months = 6;
    if (trendTimeRange === '24months') months = 24;
    
    const filteredData = trendData.slice(-months).filter(row => {
      const inRange = (!filterDateFrom || row.month >= filterDateFrom.slice(0,7)) && 
                     (!filterDateTo || row.month <= filterDateTo.slice(0,7));
      return inRange;
    });
    
    return filteredData;
  }, [trendData, trendTimeRange, filterDateFrom, filterDateTo]);

  const trendLabels = filteredTrendData.map(row => {
    const date = new Date(row.month + '-01');
    return date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'short' });
  });

  // 根據選擇的指標生成數據集
  const trendDatasets = useMemo(() => {
    const certTypes = showTrendComparison ? selectedTrendCerts : CERT_TYPE_OPTIONS.filter(opt => opt.value);
    
    return certTypes.map((certType, index) => {
      const type = typeof certType === 'string' ? certType : certType.value;
      if (!type) return null;
      
      let data;
      let label;
      
      switch (trendMetric) {
        case 'progress':
          data = filteredTrendData.map(row => row[type]?.progress || 0);
          label = `${type} - 平均進度`;
          break;
        case 'resolution_rate':
          data = filteredTrendData.map(row => {
            const item = row[type];
            return item?.count > 0 ? Math.round((item.resolved / item.count) * 100) : 0;
          });
          label = `${type} - 解決率`;
          break;
        case 'count':
        default:
          data = filteredTrendData.map(row => row[type]?.count || 0);
          label = `${type} - 缺失數量`;
          break;
      }
      
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
      const color = colors[index % colors.length];
      
      return {
        label,
        data,
        borderColor: color,
        backgroundColor: `${color}20`,
        tension: trendChartType === 'line' ? 0.4 : 0,
        fill: trendChartType === 'area',
        hidden: filterCertType && type !== filterCertType
      };
    }).filter(Boolean);
  }, [filteredTrendData, trendMetric, showTrendComparison, selectedTrendCerts, filterCertType, trendChartType]);

  // 趨勢分析統計數據
  const trendStats = useMemo(() => {
    const current = filteredTrendData[filteredTrendData.length - 1];
    const previous = filteredTrendData[filteredTrendData.length - 2];
    
    if (!current || !previous) return null;
    
    const stats = {};
    CERT_TYPE_OPTIONS.filter(opt => opt.value).forEach(opt => {
      const type = opt.value;
      const currentData = current[type] || { count: 0, resolved: 0, progress: 0 };
      const previousData = previous[type] || { count: 0, resolved: 0, progress: 0 };
      
      stats[type] = {
        currentCount: currentData.count,
        countChange: currentData.count - previousData.count,
        currentProgress: currentData.progress,
        progressChange: currentData.progress - previousData.progress,
        currentResolutionRate: currentData.count > 0 ? Math.round((currentData.resolved / currentData.count) * 100) : 0,
        resolutionRateChange: (currentData.count > 0 ? Math.round((currentData.resolved / currentData.count) * 100) : 0) - 
                             (previousData.count > 0 ? Math.round((previousData.resolved / previousData.count) * 100) : 0)
      };
    });
    
    return stats;
  }, [filteredTrendData]);

  // 3. 優化 useEffect，圖表資料根據篩選條件動態更新
  useEffect(() => {
    // 更新圖表數據的函數
    const updateCharts = () => {
      // 認證進度圖表更新
      if (progressChartInstance.current) {
        const newData = projectProgressData.map(project => project.progress);
        
        progressChartInstance.current.data.datasets[0].data = newData;
        progressChartInstance.current.update('none'); // 不使用動畫以提高性能
      } else if (projectProgressChartRef.current) {
        // 如果圖表實例不存在，重新創建
        const ctx = projectProgressChartRef.current.getContext('2d');
        progressChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: projectProgressData.map(project => project.name.replace(/認證|系統/g, '').trim()),
            datasets: [{
              label: '當前進度',
              data: projectProgressData.map(project => project.progress),
              backgroundColor: projectProgressData.map(project => {
                if (project.progress === 100) return '#22c55e';  // 綠色 - 已完成
                if (project.progress >= 70) return '#3b82f6';    // 藍色 - 進度良好
                if (project.progress >= 30) return '#f59e0b';    // 橙色 - 中等進度
                return '#64748b';                                // 灰色 - 尚未開始
              }),
              borderWidth: 0,
              borderRadius: 4,
              borderSkipped: false,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              tooltip: { enabled: true },
              legend: { display: false },
            },
            onClick: (e, elements) => {
              if (elements.length) {
                const idx = elements[0].index;
                alert('點擊了進度柱狀圖：' + projectProgressData[idx].name);
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                ticks: { callback: v => v + '%' }
              },
              x: {
                ticks: {
                  maxRotation: 45,
                  minRotation: 0
                }
              }
            }
          }
        });
      }

      // 認證類型分布圖表更新
      if (typeChartInstance.current) {
        const newData = ['SMETA', 'ISO 14001', 'ISO 9001', 'SA8000'].map(type => 
          issues.filter(i => i.certType === type).length
        );
        
        typeChartInstance.current.data.datasets[0].data = newData;
        typeChartInstance.current.update('none');
      } else if (certTypeChartRef.current) {
        // 如果圖表實例不存在，重新創建
        const ctx = certTypeChartRef.current.getContext('2d');
        typeChartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['SMETA', 'ISO 14001', 'ISO 9001', 'SA8000'],
            datasets: [{
              data: ['SMETA', 'ISO 14001', 'ISO 9001', 'SA8000'].map(type => 
                issues.filter(i => i.certType === type).length
              ),
              backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              tooltip: { enabled: true },
              legend: {
                display: true,
                position: 'bottom',
                onClick: (e, legendItem, legend) => {
                  const ci = legend.chart;
                  ci.toggleDataVisibility(legendItem.index);
                  ci.update();
                }
              }
            },
            onClick: (e, elements) => {
              if (elements.length) {
                const idx = elements[0].index;
                alert('點擊了圓餅圖：' + ['SMETA', 'ISO 14001', 'ISO 9001', 'SA8000'][idx]);
              }
            }
          }
        });
      }

      // 趨勢折線圖更新
      const trendCanvas = document.getElementById('trendLineChart');
      if (trendChartInstance.current) {
        trendChartInstance.current.destroy();
        trendChartInstance.current = null;
      }
      
      if (trendCanvas) {
        const ctx = trendCanvas.getContext('2d');
        trendChartInstance.current = new Chart(ctx, {
          type: trendChartType === 'area' ? 'line' : trendChartType,
          data: {
            labels: trendLabels,
            datasets: trendDatasets
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            plugins: {
              tooltip: { 
                enabled: true,
                callbacks: {
                  afterLabel: function(context) {
                    if (trendMetric === 'progress' || trendMetric === 'resolution_rate') {
                      return `${context.parsed.y}%`;
                    }
                    return `${context.parsed.y} 項`;
                  }
                }
              },
              legend: {
                display: true,
                position: 'bottom',
                onClick: (e, legendItem, legend) => {
                  const ci = legend.chart;
                  ci.toggleDataVisibility(legendItem.datasetIndex);
                  ci.update();
                }
              }
            },
            scales: {
              x: {
                display: true,
                title: {
                  display: true,
                  text: '時間'
                }
              },
              y: {
                display: true,
                title: {
                  display: true,
                  text: trendMetric === 'count' ? '缺失項目數量' : 
                        trendMetric === 'progress' ? '平均進度 (%)' : '解決率 (%)'
                },
                beginAtZero: true,
                max: (trendMetric === 'progress' || trendMetric === 'resolution_rate') ? 100 : undefined,
                ticks: {
                  callback: function(value) {
                    if (trendMetric === 'progress' || trendMetric === 'resolution_rate') {
                      return value + '%';
                    }
                    return value;
                  }
                }
              }
            },
            onClick: (e, elements) => {
              if (elements.length) {
                const idx = elements[0].index;
                const datasetIdx = elements[0].datasetIndex;
                const dataset = trendDatasets[datasetIdx];
                alert(`點擊了趨勢圖：${dataset.label} - ${trendLabels[idx]}: ${dataset.data[idx]}`);
              }
            }
          }
        });
      }
    };

    // 延遲更新以確保DOM已準備好
    const timer = setTimeout(updateCharts, 50);

    return () => {
      clearTimeout(timer);
    };
  // eslint-disable-next-line
  }, [filterCertType, filterDateFrom, filterDateTo, trendChartType, trendTimeRange, trendMetric, showTrendComparison, selectedTrendCerts]);

  /**
   * 動態計算統計數據
   */
  const calculateStats = () => {
    const totalProjects = projectProgressData.length;
    const inProgressProjects = projectProgressData.filter(p => p.status === 'in-progress').length;
    const completedProjects = projectProgressData.filter(p => p.status === 'completed').length;
    const totalIssues = issues.length;
    const criticalIssues = issues.filter(issue => issue.severity === 'high').length;
    
    // 計算平均進度
    const averageProgress = Math.round(
      projectProgressData.reduce((sum, project) => sum + project.progress, 0) / totalProjects
    );
    
    return {
      totalProjects,
      inProgressProjects,
      completedProjects,
      totalIssues,
      criticalIssues,
      averageProgress
    };
  };

  const stats = calculateStats();

  return (
    <div className="reports-analysis-container">
      <div className="header-actions">
        <h4>報告分析</h4>
        <div className="header-controls">
          <button className="btn btn-outline-primary">
            <FontAwesomeIcon icon={faFilter} className="me-2" />
            篩選
          </button>
          <button className="btn btn-outline-primary">
            <FontAwesomeIcon icon={faPrint} className="me-2" />
            列印
          </button>
          <button className="btn btn-primary">
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            匯出報告
          </button>
        </div>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="stats-card-new">
            <div className="stats-top-row">
              <div className="stats-icon-new blue">
                <FontAwesomeIcon icon={faPlayCircle} />
              </div>
              <div className="stats-value">{stats.inProgressProjects}</div>
            </div>
            <div className="stats-bottom-row">
              <div className="stats-title">進行中專案</div>
              <div className="stats-desc">
                <span>平均進度 {stats.averageProgress}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="stats-card-new">
            <div className="stats-top-row">
              <div className="stats-icon-new green">
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <div className="stats-value">{stats.completedProjects}</div>
            </div>
            <div className="stats-bottom-row">
              <div className="stats-title">已完成認證</div>
              <div className="stats-desc positive">
                <FontAwesomeIcon icon={faArrowTrendUp} className="me-1" />
                完成率 {Math.round((stats.completedProjects / stats.totalProjects) * 100)}%
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="stats-card-new">
            <div className="stats-top-row">
              <div className="stats-icon-new amber">
                <FontAwesomeIcon icon={faHourglassHalf} />
              </div>
              <div className="stats-value">{stats.totalIssues}</div>
            </div>
            <div className="stats-bottom-row">
              <div className="stats-title">待處理問題項</div>
              <div className="stats-desc negative">
                <FontAwesomeIcon icon={faArrowTrendDown} className="me-1" />
                較上次減少 15%
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="stats-card-new">
            <div className="stats-top-row">
              <div className="stats-icon-new red">
                <FontAwesomeIcon icon={faExclamationTriangle} />
              </div>
              <div className="stats-value">{stats.criticalIssues}</div>
            </div>
            <div className="stats-bottom-row">
              <div className="stats-title">重大缺失</div>
              <div className="stats-desc negative">
                <FontAwesomeIcon icon={faArrowTrendDown} className="me-1" />
                較上次減少 40%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 高級篩選面板 */}
      <div className="advanced-filters-panel mb-4">
        <div className="row g-3">
          {/* 基本篩選 */}
          <div className="col-md-2">
            <label className="filter-label">認證類型</label>
            <select 
              className="form-select form-select-sm" 
              value={filterCertType} 
              onChange={e => setFilterCertType(e.target.value)}
            >
              {CERT_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          
          <div className="col-md-2">
            <label className="filter-label">嚴重程度</label>
            <select 
              className="form-select form-select-sm" 
              value={selectedSeverity} 
              onChange={e => setSelectedSeverity(e.target.value)}
            >
              <option value="">全部</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
          
          <div className="col-md-2">
            <label className="filter-label">處理狀態</label>
            <select 
              className="form-select form-select-sm" 
              value={selectedStatus} 
              onChange={e => setSelectedStatus(e.target.value)}
            >
              <option value="">全部</option>
              <option value="in-progress">進行中</option>
              <option value="completed">已解決</option>
              <option value="planned">計畫中</option>
            </select>
          </div>
          
          <div className="col-md-2">
            <label className="filter-label">開始日期</label>
            <input 
              type="date" 
              className="form-control form-control-sm" 
              value={filterDateFrom} 
              onChange={e => setFilterDateFrom(e.target.value)}
            />
          </div>
          
          <div className="col-md-2">
            <label className="filter-label">結束日期</label>
            <input 
              type="date" 
              className="form-control form-control-sm" 
              value={filterDateTo} 
              onChange={e => setFilterDateTo(e.target.value)}
            />
          </div>
          
          <div className="col-md-2">
            <label className="filter-label">&nbsp;</label>
            <div className="d-flex gap-1">
              <button 
                className="btn btn-outline-secondary btn-sm flex-1"
                onClick={resetFilters}
                title="重置篩選"
              >
                <FontAwesomeIcon icon={faRefresh} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['綜合報表', '缺失追蹤', '趨勢分析'].map(tab => (
          <div
            key={tab}
            className={`tab${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>
      {/* 綜合報表卡片區塊 */}
      {activeTab === '綜合報表' && (
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <div className="card stats-card-new">
              <div className="stats-top-row">
                <div className="stats-icon-new blue"><FontAwesomeIcon icon={faCheckCircle} /></div>
                <div className="stats-title">認證進度</div>
              </div>
              <div className="stats-bottom-row">
                <div className="stats-value">90%</div>
                <div className="stats-desc positive"><FontAwesomeIcon icon={faArrowTrendUp} className="me-1" />本月提升 5%</div>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="card stats-card-new">
              <div className="stats-top-row">
                <div className="stats-icon-new green"><FontAwesomeIcon icon={faChartPie} /></div>
                <div className="stats-title">認證類型分布</div>
              </div>
              <div className="stats-bottom-row">
                <div className="stats-value">4</div>
                <div className="stats-desc">類型</div>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="card stats-card-new">
              <div className="stats-top-row">
                <div className="stats-icon-new amber"><FontAwesomeIcon icon={faExclamationTriangle} /></div>
                <div className="stats-title">缺失項目</div>
              </div>
              <div className="stats-bottom-row">
                <div className="stats-value">{filteredAndSortedIssues.length}</div>
                <div className="stats-desc negative"><FontAwesomeIcon icon={faArrowTrendDown} className="me-1" />本月減少 2 項</div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 圖表區塊 */}
      {activeTab === '綜合報表' && (
        <div className="row g-4 mt-2">
          <div className="col-lg-6">
            <div className="card p-3">
              <div className="card-header bg-white border-0 pb-1 d-flex align-items-center">
                <FontAwesomeIcon icon={faChartBar} className="me-2 text-primary" />
                <h5 className="mb-0">認證進度統計</h5>
              </div>
              <div className="card-body">
                <div className="chart-container" style={{ minHeight: 260 }}>
                  <canvas ref={projectProgressChartRef} height={220} />
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="card p-3">
              <div className="card-header bg-white border-0 pb-1 d-flex align-items-center">
                <FontAwesomeIcon icon={faChartPie} className="me-2 text-success" />
                <h5 className="mb-0">認證類型分布</h5>
              </div>
              <div className="card-body">
                <div className="chart-container" style={{ minHeight: 260 }}>
                  <canvas ref={certTypeChartRef} height={220} />
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="card p-3">
              <div className="card-header bg-white border-0 pb-1 d-flex align-items-center">
                <FontAwesomeIcon icon={faChartPie} className="me-2 text-warning" />
                <h5 className="mb-0">缺失類型分布</h5>
              </div>
              <div className="card-body">
                <div className="chart-container" style={{ minHeight: 260 }}>
                  <canvas ref={issueTypeChartRef} height={220} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 缺失追蹤卡片區塊 */}
      {activeTab === '缺失追蹤' && (
        <div className="card p-3 mt-3">
          <div className="card-header bg-white border-0 pb-1 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faExclamationCircle} className="me-2 text-danger" />
              <h5 className="mb-0">缺失項目追蹤</h5>
              <span className="badge bg-secondary ms-2">{filteredAndSortedIssues.length} 項</span>
            </div>
            
            {/* 表格控制工具 */}
            <div className="table-controls d-flex gap-2 align-items-center">
              {/* 排序控制 */}
              <div className="sort-controls d-flex align-items-center">
                <select 
                  className="form-select form-select-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ minWidth: '120px' }}
                >
                  <option value="date">發現日期</option>
                  <option value="name">問題名稱</option>
                  <option value="certType">認證類型</option>
                  <option value="severity">嚴重程度</option>
                  <option value="status">狀態</option>
                </select>
                <button 
                  className="btn btn-outline-secondary btn-sm ms-1"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  title={`當前：${sortOrder === 'asc' ? '升序' : '降序'}`}
                >
                  <FontAwesomeIcon icon={sortOrder === 'asc' ? faSortAmountUp : faSortAmountDown} />
                </button>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    {visibleColumns.name && <th>問題名稱</th>}
                    {visibleColumns.certType && <th>認證類型</th>}
                    {visibleColumns.severity && <th>嚴重程度</th>}
                    {visibleColumns.discoveryDate && <th>發現日期</th>}
                    {visibleColumns.status && <th>狀態</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedIssues.map((issue, idx) => (
                    <tr key={idx} className="table-row-hover">
                      {visibleColumns.name && (
                        <td className="fw-medium">{issue.issueName}</td>
                      )}
                      {visibleColumns.certType && (
                        <td>
                          <span className="badge bg-light text-dark">{issue.certType}</span>
                        </td>
                      )}
                      {visibleColumns.severity && (
                        <td>{renderSeverityBadge(issue.severity)}</td>
                      )}
                      {visibleColumns.discoveryDate && (
                        <td className="text-muted">{formatDate(issue.discoveryDate)}</td>
                      )}
                      {visibleColumns.status && (
                        <td>{renderStatusBadge(issue.status)}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredAndSortedIssues.length === 0 && (
                <div className="text-center py-4 text-muted">
                  <FontAwesomeIcon icon={faClipboardList} size="2x" className="mb-2" />
                  <div>沒有符合條件的缺失項目</div>
                  <small>請調整篩選條件或重置篩選器</small>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* 趨勢分析卡片區塊 */}
      {activeTab === '趨勢分析' && (
        <div className="trend-analysis-section">
          {/* 趨勢分析控制面板 */}
          <div className="card mb-4">
            <div className="card-header bg-white border-0 pb-3">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faChartLine} className="me-2 text-info" />
                  <h5 className="mb-0">趨勢分析控制面板</h5>
                </div>
              </div>
              
              {/* 控制項分組布局 */}
              <div className="trend-controls-grid">
                {/* 第一行：圖表設置 */}
                <div className="control-group">
                  <label className="control-label">圖表類型</label>
                  <div className="btn-group chart-type-selector" role="group">
                    <button 
                      className={`btn btn-sm ${trendChartType === 'line' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setTrendChartType('line')}
                      title="折線圖"
                    >
                      <FontAwesomeIcon icon={faChartLine} className="me-1" />
                      折線圖
                    </button>
                    <button 
                      className={`btn btn-sm ${trendChartType === 'bar' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setTrendChartType('bar')}
                      title="柱狀圖"
                    >
                      <FontAwesomeIcon icon={faChartBar} className="me-1" />
                      柱狀圖
                    </button>
                    <button 
                      className={`btn btn-sm ${trendChartType === 'area' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setTrendChartType('area')}
                      title="面積圖"
                    >
                      <FontAwesomeIcon icon={faChartPie} className="me-1" />
                      面積圖
                    </button>
                  </div>
                </div>
                
                {/* 第二行：時間和指標設置 */}
                <div className="control-group">
                  <label className="control-label">時間範圍</label>
                  <select 
                    className="form-select form-select-sm"
                    value={trendTimeRange}
                    onChange={(e) => setTrendTimeRange(e.target.value)}
                  >
                    <option value="6months">近6個月</option>
                    <option value="12months">近12個月</option>
                    <option value="24months">近24個月</option>
                  </select>
                </div>
                
                <div className="control-group">
                  <label className="control-label">分析指標</label>
                  <select 
                    className="form-select form-select-sm"
                    value={trendMetric}
                    onChange={(e) => setTrendMetric(e.target.value)}
                  >
                    <option value="count">缺失項目數量</option>
                    <option value="progress">平均進度</option>
                    <option value="resolution_rate">解決率</option>
                  </select>
                </div>
                
                {/* 第三行：對比設置 */}
                <div className="control-group comparison-toggle">
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="trendComparison"
                      checked={showTrendComparison}
                      onChange={(e) => setShowTrendComparison(e.target.checked)}
                    />
                    <label className="form-check-label fw-medium" htmlFor="trendComparison">
                      <FontAwesomeIcon icon={faFilter} className="me-2" />
                      啟用對比模式
                    </label>
                  </div>
                  {showTrendComparison && (
                    <small className="text-muted d-block mt-1">
                      可選擇特定認證類型進行對比分析
                    </small>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 趨勢統計卡片 */}
          {trendStats && (
            <div className="row g-3 mb-4">
              {Object.entries(trendStats).map(([certType, stats]) => (
                <div key={certType} className="col-lg-3 col-md-6">
                  <div className="card trend-stats-card">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <h6 className="card-title text-muted mb-1">{certType}</h6>
                          <div className="trend-metric">
                            {trendMetric === 'count' && (
                              <>
                                <div className="metric-value">{stats.currentCount}</div>
                                <div className={`metric-change ${stats.countChange >= 0 ? 'positive' : 'negative'}`}>
                                  <FontAwesomeIcon icon={stats.countChange >= 0 ? faArrowTrendUp : faArrowTrendDown} className="me-1" />
                                  {stats.countChange >= 0 ? '+' : ''}{stats.countChange} 項
                                </div>
                              </>
                            )}
                            {trendMetric === 'progress' && (
                              <>
                                <div className="metric-value">{stats.currentProgress}%</div>
                                <div className={`metric-change ${stats.progressChange >= 0 ? 'positive' : 'negative'}`}>
                                  <FontAwesomeIcon icon={stats.progressChange >= 0 ? faArrowTrendUp : faArrowTrendDown} className="me-1" />
                                  {stats.progressChange >= 0 ? '+' : ''}{stats.progressChange}%
                                </div>
                              </>
                            )}
                            {trendMetric === 'resolution_rate' && (
                              <>
                                <div className="metric-value">{stats.currentResolutionRate}%</div>
                                <div className={`metric-change ${stats.resolutionRateChange >= 0 ? 'positive' : 'negative'}`}>
                                  <FontAwesomeIcon icon={stats.resolutionRateChange >= 0 ? faArrowTrendUp : faArrowTrendDown} className="me-1" />
                                  {stats.resolutionRateChange >= 0 ? '+' : ''}{stats.resolutionRateChange}%
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="trend-icon">
                          <FontAwesomeIcon icon={faTasks} className="text-primary" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 對比選擇面板 */}
          {showTrendComparison && (
            <div className="card mb-4">
              <div className="card-body">
                <h6 className="card-title">
                  <FontAwesomeIcon icon={faFilter} className="me-2" />
                  選擇對比的認證類型
                </h6>
                <div className="comparison-checkboxes">
                  {CERT_TYPE_OPTIONS.filter(opt => opt.value).map(opt => (
                    <div key={opt.value} className="form-check form-check-inline">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id={`trend-${opt.value}`}
                        checked={selectedTrendCerts.includes(opt.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTrendCerts([...selectedTrendCerts, opt.value]);
                          } else {
                            setSelectedTrendCerts(selectedTrendCerts.filter(c => c !== opt.value));
                          }
                        }}
                      />
                      <label className="form-check-label" htmlFor={`trend-${opt.value}`}>
                        {opt.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 主要趨勢圖表 */}
          <div className="card">
            <div className="card-header bg-white border-0 pb-1 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faChartLine} className="me-2 text-info" />
                <h5 className="mb-0">
                  {trendMetric === 'count' ? '缺失項目數量趨勢' : 
                   trendMetric === 'progress' ? '平均進度趨勢' : '解決率趨勢'}
                </h5>
              </div>
              <div className="chart-info">
                <small className="text-muted">
                  時間範圍：{trendTimeRange === '6months' ? '近6個月' : 
                           trendTimeRange === '12months' ? '近12個月' : '近24個月'}
                </small>
              </div>
            </div>
            <div className="card-body">
              <div className="chart-container" style={{ minHeight: 400 }}>
                <canvas id="trendLineChart" height={300} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsAnalysis; 