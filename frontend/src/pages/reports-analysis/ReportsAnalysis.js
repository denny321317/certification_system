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
  faSpinner,
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

  // 認證類型分布數據
  const [certTypeChartData, setCertTypeChartData] = useState({
    labels: ['無資料'], // 預設標籤，避免首次渲染錯誤
    datasets: [{
      data: [1], 
      backgroundColor: ['#ccc'],
      borderWidth: 0
    }]
  });

  const [deficiencyCount, setDeficiencyCount] = useState(null);
  const [isCountLoading, setIsCountLoading] = useState(true);
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
  // const projectProgressData = [
  //   { name: 'SMETA 4支柱認證', progress: 75, status: 'in-progress' },
  //   { name: 'ISO 14001 環境管理系統', progress: 90, status: 'in-progress' },
  //   { name: 'ISO 9001 品質管理系統', progress: 100, status: 'completed' },
  //   { name: 'SA8000 社會責任認證', progress: 0, status: 'planned' },
  //   { name: 'SA8000 社會責任認證', progress: 0, status: 'planned' },
  //   { name: 'SA8000 社會責任認證', progress: 0, status: 'planned' }
  // ];
  const [projectProgressSummary, setProjectProgressSummary] = useState([]);
  const [isTypeProgressLoading, setIsTypeProgressLoading] = useState(true);

  const getStatusByProgress = useCallback((progress) => {
    if (progress === 100) return 'completed';
    if (progress >= 10) return 'in-progress';
    return 'planned';
  }, []);

  useEffect(() => {
    const fetchProgressByType = async () => {
        setIsTypeProgressLoading(true);
        try {
            // 使用後端新的 API 路徑
            const response = await fetch('http://localhost:8000/api/projects/progress-by-type'); 
            if (!response.ok) {
                throw new Error('無法獲取專案類型進度資料');
            }
            const data = await response.json(); 
            
            // 將 API 數據 (certType, averageProgress) 轉換為圖表和卡片所需的結構
            const formattedData = data.map(item => ({
                name: item.certType,
                progress: Math.round(item.averageProgress), // 四捨五入到整數
                status: getStatusByProgress(Math.round(item.averageProgress)) // 動態判斷狀態
            }));

            setProjectProgressSummary(formattedData);
        } catch (error) {
            console.error('獲取類型進度失敗:', error);
            setProjectProgressSummary([]);
        } finally {
            setIsTypeProgressLoading(false);
        }
    };

    fetchProgressByType();
  // 將 getStatusByProgress 加入依賴列表
  }, [getStatusByProgress]);

  //缺失項目
  useEffect(() => {
    const fetchDeficiencyCount = async () => {
        setIsCountLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/reports/deficiency-items/count'); 
            if (!response.ok) {
                throw new Error('無法獲取缺失總數');
            }
            // API 回傳的是一個數字
            const data = await response.json(); 
            setDeficiencyCount(data);
        } catch (error) {
            console.error('獲取缺失總數失敗:', error);
            setDeficiencyCount('N/A'); // 載入失敗時顯示 N/A
        } finally {
            setIsCountLoading(false);
        }
    };

    fetchDeficiencyCount();
  }, []);

  const [averageProjectProgress, setAverageProjectProgress] = useState(null);
  const [isProgressLoading, setIsProgressLoading] = useState(true);

  useEffect(() => {
    const fetchAverageProgress = async () => {
        setIsProgressLoading(true);
        try {
            // 這裡我們使用您在 Service 層定義的 API 路徑
            const response = await fetch('http://localhost:8000/api/projects/average-progress'); 
            if (!response.ok) {
                throw new Error('無法獲取平均進度');
            }
            const data = await response.json(); 
            // API 回傳的是 double，四捨五入到整數再儲存，方便顯示
            setAverageProjectProgress(Math.round(data)); 
        } catch (error) {
            console.error('獲取平均進度失敗:', error);
            setAverageProjectProgress('N/A'); // 載入失敗時顯示 N/A
        } finally {
            setIsProgressLoading(false);
        }
    };

    fetchAverageProgress();
  }, []);
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

      // 💡 僅當 projectProgressSummary 不為空且 Canvas 元素存在時才繪製
      if (projectProgressChartRef.current && projectProgressSummary.length > 0) { 
          // 認證進度圖表
          const progressCtx = projectProgressChartRef.current.getContext('2d');
          
          // 取得圖表數據
          const progressLabels = projectProgressSummary.map(project => project.name);
          const progressData = projectProgressSummary.map(project => project.progress);
          
          progressChartInstance.current = new Chart(progressCtx, {
              type: 'bar',
              data: {
                  // 💡 使用 projectProgressSummary 的 name 和 progress
                  labels: progressLabels,
                  datasets: [{
                      label: '平均進度', // 標籤應反映是平均進度
                      data: progressData,
                      backgroundColor: projectProgressSummary.map(project => {
                          // 💡 根據動態進度設置顏色
                          if (project.progress === 100) return '#22c55e';  // 綠色 - 已完成
                          if (project.progress >= 70) return '#3b82f6';    // 藍色 - 進度良好
                          if (project.progress >= 30) return '#f59e0b';    // 橙色 - 中等進度
                          return '#64748b';                                // 灰色 - 尚未開始
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

        // 使用狀態 certTypeChartData
        typeChartInstance.current = new Chart(typeCtx, {
          type: 'doughnut',
          data: certTypeChartData, // <--- 直接使用 API 數據狀態
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: {
                display: true // 甜甜圈圖通常會顯示圖例
              },
              tooltip: { 
                enabled: true,
                callbacks: {
                   // 顯示百分比和數值
                   label: (context) => {
                       const label = context.label || '';
                       const total = context.dataset.data.reduce((sum, v) => sum + v, 0);
                       const value = context.parsed;
                       const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                       return `${label}: ${value} (${percentage}%)`;
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
  }, [projectProgressSummary]);

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

  // 優化 useEffect，圖表資料根據篩選條件動態更新
  useEffect(() => {
    // 更新圖表數據的函數
    const updateCharts = () => {
      // 認證進度圖表更新
      if (progressChartInstance.current) {
        const newData = projectProgressSummary.map(project => project.progress);
        
        progressChartInstance.current.data.datasets[0].data = newData;
        progressChartInstance.current.update('none'); // 不使用動畫以提高性能
      } else if (projectProgressChartRef.current) {
        // 如果圖表實例不存在，重新創建
        const ctx = projectProgressChartRef.current.getContext('2d');
        progressChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: projectProgressSummary.map(project => project.name.replace(/認證|系統/g, '').trim()),
            datasets: [{
              label: '當前進度',
              data: projectProgressSummary.map(project => project.progress),
              backgroundColor: projectProgressSummary.map(project => {
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
                alert('點擊了進度柱狀圖：' + projectProgressSummary[idx].name);
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
      if (typeChartInstance.current && certTypeChartData) {
          // 直接更新 data 屬性
          typeChartInstance.current.data = certTypeChartData; 
          typeChartInstance.current.update('none');
      } 
      // 這裡不需要重新創建，因為數據是在 Step 2 的 useEffect 中獲取的
      // 如果要處理篩選，請將 certTypeChartData 依賴項添加到此 useEffect
    };

    // 延遲更新以確保DOM已準備好
    const timer = setTimeout(updateCharts, 50);

    return () => {
      clearTimeout(timer);
    };
  // eslint-disable-next-line
  }, [filterCertType, filterDateFrom, filterDateTo, certTypeChartData]);

  // 使用 useEffect 從後端 API 獲取**圖表分布資料**
  useEffect(() => {
    const fetchCertDistribution = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/dashboard/certification-distribution');
        if (!response.ok) {
          throw new Error('無法獲取認證類型分布資料');
        }
        const apiData = await response.json();
        
        // 處理 API 數據並格式化
        const labels = apiData.labels.map(label => {
          // 處理 API 回傳的 null 標籤，用 '其他/未知' 代替
          return label ? label.toUpperCase() : '未知類型'; 
        });
        
        const data = apiData.data;

        // 預設顏色列表（可以擴展）
        const backgroundColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
        
        setCertTypeChartData({
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: backgroundColors.slice(0, labels.length),
            borderWidth: 0
          }]
        });

      } catch (error) {
        console.error('獲取認證類型分布失敗:', error);
      }
    };

    fetchCertDistribution();
  }, []); // 首次渲染時執行一次
  /**
   * 動態計算統計數據
   */
  const calculateStats = () => {
    const totalProjects = projectProgressSummary.length;
    const inProgressProjects = projectProgressSummary.filter(p => p.status === 'in-progress').length;
    const completedProjects = projectProgressSummary.filter(p => p.status === 'completed').length;
    const totalIssues = issues.length;
    const criticalIssues = issues.filter(issue => issue.severity === 'high').length;
    
    // 計算平均進度
    const averageProgress = Math.round(
      projectProgressSummary.reduce((sum, project) => sum + project.progress, 0) / totalProjects
    );
    
    return {
      totalTypes: totalProjects,
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
        {/* <div className="header-controls">
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
        </div> */}
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
        {['綜合報表', '缺失追蹤'].map(tab => (
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
                <div className="stats-title">所有專案平均進度</div>
              </div>
              <div className="stats-bottom-row">
                  <div className="stats-value">
                      {isProgressLoading ? (
                          <small>載入中...</small>
                      ) : (
                          averageProjectProgress !== null ? `${averageProjectProgress}%` : 'N/A'
                      )}
                  </div>
                {/* <div className="stats-desc positive"><FontAwesomeIcon icon={faArrowTrendUp} className="me-1" />本月提升 5%</div> */}
                <div className="stats-desc">平均</div>
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
                <div className="stats-value">
                    {isCountLoading ? (
                        <small>載入中...</small>
                    ) : (
                        deficiencyCount !== null ? deficiencyCount : 'N/A'
                    )}
                </div>
                {/* <div className="stats-desc negative"><FontAwesomeIcon icon={faArrowTrendDown} className="me-1" />本月減少 2 項</div> */}
                <div className="stats-desc">總計</div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 圖表區塊 */}
      {activeTab === '綜合報表' && (
        <div className="row g-4 mt-2">
          {/* 認證進度統計 (左側圖表) */}
          <div className="col-lg-6">
              <div className="card p-3">
                  <div className="card-header bg-white border-0 pb-1 d-flex align-items-center">
                      <FontAwesomeIcon icon={faChartBar} className="me-2 text-primary" />
                      <h5 className="mb-0">認證類型平均進度統計</h5> 
                  </div>
                  <div className="card-body">
                      <div className="chart-container" style={{ minHeight: 260 }}>
                          {isTypeProgressLoading ? (
                              <div className="text-center p-5">
                                  <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-primary mb-2" />
                                  <p className="text-muted mt-2">進度數據載入中...</p>
                              </div>
                          ) : projectProgressSummary.length === 0 ? (
                              <div className="text-center p-5">
                                  <FontAwesomeIcon icon={faClipboardList} size="2x" className="mb-2 text-muted" />
                                  <p className="text-muted">無認證類型進度數據</p>
                              </div>
                          ) : (
                              // 載入完成且有數據時，顯示圖表
                              <canvas ref={projectProgressChartRef} height={220} />
                          )}
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
    </div>
  );
};

export default ReportsAnalysis; 