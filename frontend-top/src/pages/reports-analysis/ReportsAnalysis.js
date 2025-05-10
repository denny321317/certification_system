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

import React, { useState, useEffect, useRef } from 'react';
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
  faPlayCircle
} from '@fortawesome/free-solid-svg-icons';
import Chart from 'chart.js/auto';
import './ReportsAnalysis.css';

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

  /**
   * 圖表引用
   * @type {React.MutableRefObject<HTMLCanvasElement>} 圖表Canvas元素引用
   */
  const projectProgressChartRef = useRef(null);
  const certTypeChartRef = useRef(null);
  const issueTypeChartRef = useRef(null);

  /**
   * 初始化圖表
   * 在組件掛載後創建各種統計圖表
   */
  useEffect(() => {
    // 初始化圖表
    const initCharts = () => {
      if (projectProgressChartRef.current) {
        // 認證進度圖表
        const progressCtx = projectProgressChartRef.current.getContext('2d');
        new Chart(progressCtx, {
          type: 'bar',
          data: {
            labels: ['SMETA', 'ISO 14001', 'ISO 9001', 'SA8000'],
            datasets: [{
              label: '當前進度',
              data: [75, 90, 100, 0],
              backgroundColor: [
                '#3b82f6',
                '#10b981',
                '#22c55e',
                '#64748b'
              ],
              borderWidth: 0
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                  callback: function(value) {
                    return value + '%';
                  }
                }
              }
            },
            plugins: {
              legend: {
                display: false
              }
            }
          }
        });
      }
      
      if (certTypeChartRef.current) {
        // 認證類型分布圖表
        const typeCtx = certTypeChartRef.current.getContext('2d');
        new Chart(typeCtx, {
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
        new Chart(issueCtx, {
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

    return () => clearTimeout(timer);
  }, []);

  /**
   * 缺失項目數據結構
   * @type {Array<{
   *   name: string,         // 問題名稱
   *   certType: string,     // 認證類型
   *   severity: string,     // 嚴重程度（high/medium/low）
   *   discoveryDate: string, // 發現日期
   *   status: string,       // 狀態（in-progress/completed）
   *   progress: number      // 完成進度
   * }>}
   */
  const issues = [
    {
      name: '工時記錄不完整',
      certType: 'SMETA',
      severity: 'high',
      discoveryDate: '2023-08-15',
      status: 'in-progress',
      progress: 75
    },
    {
      name: '環境管理記錄缺漏',
      certType: 'ISO 14001',
      severity: 'medium',
      discoveryDate: '2023-07-20',
      status: 'completed',
      progress: 100
    },
    {
      name: '職業安全培訓未定期執行',
      certType: 'SMETA',
      severity: 'high',
      discoveryDate: '2023-09-05',
      status: 'in-progress',
      progress: 40
    },
    {
      name: '品質控制程序未文件化',
      certType: 'ISO 9001',
      severity: 'medium',
      discoveryDate: '2023-08-02',
      status: 'completed',
      progress: 100
    },
    {
      name: '廢棄物處理不符合規範',
      certType: 'ISO 14001',
      severity: 'high',
      discoveryDate: '2023-09-10',
      status: 'in-progress',
      progress: 20
    }
  ];

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
        badgeClass = 'status-badge in-progress';
        icon = faPlayCircle;
        text = '進行中';
        break;
      case 'completed':
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

  return (
    <div className="reports-analysis-container">
      <div className="page-header d-flex justify-content-between align-items-center">
        <h4>報表分析</h4>
        <div className="page-actions">
          <button className="btn btn-light me-2">
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            匯出報表
          </button>
          <button className="btn btn-primary">
            <FontAwesomeIcon icon={faPrint} className="me-2" />
            列印報表
          </button>
        </div>
      </div>
      
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="stats-card-new">
            <div className="stats-top-row">
              <div className="stats-icon-new blue">
                <FontAwesomeIcon icon={faCheckSquare} />
              </div>
              <div className="stats-value">12</div>
            </div>
            <div className="stats-bottom-row">
              <div className="stats-title">總認證專案</div>
              <div className="stats-desc positive">
                <FontAwesomeIcon icon={faArrowTrendUp} className="me-1" />
                較上季增加 20%
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
              <div className="stats-value">8</div>
            </div>
            <div className="stats-bottom-row">
              <div className="stats-title">已通過認證</div>
              <div className="stats-desc positive">
                <FontAwesomeIcon icon={faArrowTrendUp} className="me-1" />
                較上季增加 33%
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
              <div className="stats-value">24</div>
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
              <div className="stats-value">3</div>
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
      
      <div className="tabs mb-4">
        {['綜合報表', '進度分析', '缺失統計', '趨勢分析', '自訂報表'].map(tab => (
          <div 
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>
      
      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">認證項目完成進度</h5>
              <div>
                <select className="form-select form-select-sm">
                  <option>按項目分類</option>
                  <option>按月份分類</option>
                  <option>按供應商分類</option>
                </select>
              </div>
            </div>
            <div className="card-body">
              <div className="chart-container">
                <canvas ref={projectProgressChartRef}></canvas>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">各項認證缺失明細</h5>
              <button className="btn btn-sm btn-outline-secondary">
                <FontAwesomeIcon icon={faFilter} />
              </button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>問題項目</th>
                      <th>認證類型</th>
                      <th>嚴重程度</th>
                      <th>發現日期</th>
                      <th>狀態</th>
                      <th>完成進度</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((issue, index) => (
                      <tr key={index}>
                        <td>{issue.name}</td>
                        <td>{issue.certType}</td>
                        <td>{renderSeverityBadge(issue.severity)}</td>
                        <td>{issue.discoveryDate}</td>
                        <td>{renderStatusBadge(issue.status)}</td>
                        <td>{renderProgressBar(issue.progress)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">認證類型分布</h5>
            </div>
            <div className="card-body">
              <div className="chart-container">
                <canvas ref={certTypeChartRef}></canvas>
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color" style={{backgroundColor: '#3b82f6'}}></div>
                  <div>SMETA</div>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{backgroundColor: '#10b981'}}></div>
                  <div>ISO 14001</div>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{backgroundColor: '#f59e0b'}}></div>
                  <div>ISO 9001</div>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{backgroundColor: '#ef4444'}}></div>
                  <div>SA8000</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">缺失項目分類</h5>
            </div>
            <div className="card-body">
              <div className="chart-container">
                <canvas ref={issueTypeChartRef}></canvas>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">近期完成項目</h5>
            </div>
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                {completedItems.map((item, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center p-3">
                    <div>
                      <div className="fw-bold">{item.name}</div>
                      <div className="text-muted small">
                        {item.responsible ? `負責人: ${item.responsible}` : item.certType}
                      </div>
                    </div>
                    <div className="text-muted small">{item.date}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalysis; 