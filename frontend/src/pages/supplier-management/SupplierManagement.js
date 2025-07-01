/**
 * 供應商管理組件
 * 
 * 此組件提供企業認證系統的供應商管理功能，包含：
 * 1. 供應商資訊管理
 * 2. 供應商認證狀態追蹤
 * 3. 供應商風險評估
 * 4. 認證到期提醒
 * 5. 供應商篩選和搜索
 * 
 * 特點：
 * - 支持多種供應商分類
 * - 提供風險等級評估
 * - 包含認證狀態追蹤
 * - 支持供應商篩選和搜索
 * 
 * 使用方式：
 * ```jsx
 * <SupplierManagement />
 * ```
 */

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faSearch, 
  faFilter, 
  faEye, 
  faPencil,
  faBuilding,
  faCheckCircle,
  faHourglassHalf,
  faExclamationTriangle,
  faLocationDot,
  faCalendarCheck,
  faCheckSquare
} from '@fortawesome/free-solid-svg-icons';
import './SupplierManagement.css';

/**
 * 供應商管理組件
 * @returns {JSX.Element} 供應商管理介面
 */
const SupplierManagement = ({ canWrite }) => {
  /**
   * 當前選中的標籤狀態
   * @type {[string, Function]} [當前標籤, 設置當前標籤的函數]
   */
  const [activeTab, setActiveTab] = useState('全部');

  /**
   * 搜索關鍵字狀態
   * @type {[string, Function]} [搜索關鍵字, 設置搜索關鍵字的函數]
   */
  const [searchTerm, setSearchTerm] = useState('');
  
  /**
   * 當前頁碼狀態
   * @type {[number, Function]} [當前頁碼, 設置頁碼的函數]
   */
  const [currentPage, setCurrentPage] = useState(1);
  
  /**
   * 供應商數據結構
   * @type {Array<{
   *   id: number,           // 供應商ID
   *   name: string,         // 供應商名稱
   *   status: string,       // 認證狀態（approved/pending/high-risk）
   *   categories: string[], // 供應商類別
   *   location: string,     // 所在地
   *   since: string,        // 合作開始年份
   *   certifications: number, // 已完成認證數量
   *   riskLevel: string,    // 風險等級（low/medium/high）
   *   latestCertification?: { // 最近認證（可選）
   *     name: string,       // 認證名稱
   *     date: string        // 認證日期
   *   },
   *   expirationReminder?: { // 到期提醒（可選）
   *     name: string|null,  // 認證名稱
   *     daysLeft?: number,  // 剩餘天數
   *     text?: string       // 提醒文字
   *   },
   *   ongoingCertification?: { // 進行中認證（可選）
   *     name: string,       // 認證名稱
   *     progress: number    // 完成進度
   *   },
   *   riskReason?: string,  // 風險原因（可選）
   *   actionNeeded?: {      // 需要採取的行動（可選）
   *     name: string,       // 行動名稱
   *     overdueDays: number // 逾期天數
   *   }
   * }>}
   */
  const suppliers = [
    {
      id: 1,
      name: '頂尖電子有限公司',
      status: 'approved',
      categories: ['原材料供應商', '電子元件'],
      location: '台灣新北市',
      since: '2019',
      certifications: 4,
      riskLevel: 'low',
      latestCertification: {
        name: 'SMETA 4支柱認證',
        date: '2023-05-20'
      },
      expirationReminder: {
        name: 'ISO 14001',
        daysLeft: 60
      }
    },
    {
      id: 2,
      name: '優質塑膠工業股份有限公司',
      status: 'pending',
      categories: ['原材料供應商', '塑膠製品'],
      location: '台灣台中市',
      since: '2020',
      certifications: 2,
      riskLevel: 'medium',
      latestCertification: {
        name: 'ISO 9001',
        date: '2022-11-15'
      },
      ongoingCertification: {
        name: 'SMETA',
        progress: 65
      }
    },
    {
      id: 3,
      name: '宏遠五金製造廠',
      status: 'high-risk',
      categories: ['零配件供應商', '金屬零件'],
      location: '中國廣東省',
      since: '2021',
      certifications: 1,
      riskLevel: 'high',
      riskReason: '未完成環境與安全審核',
      actionNeeded: {
        name: '環境管理審核',
        overdueDays: 30
      }
    },
    {
      id: 4,
      name: '東方包裝科技有限公司',
      status: 'approved',
      categories: ['包裝材料供應商'],
      location: '台灣高雄市',
      since: '2018',
      certifications: 3,
      riskLevel: 'low',
      latestCertification: {
        name: 'ISO 14001',
        date: '2023-01-10'
      },
      expirationReminder: {
        name: null,
        text: '無近期到期認證'
      }
    },
    {
      id: 5,
      name: '國際物流運輸有限公司',
      status: 'pending',
      categories: ['服務提供商', '物流運輸'],
      location: '台灣台北市',
      since: '2022',
      certifications: 2,
      riskLevel: 'medium',
      latestCertification: {
        name: 'ISO 9001',
        date: '2022-08-05'
      },
      ongoingCertification: {
        name: 'ISO 14001',
        progress: 40
      }
    }
  ];
  
  /**
   * 根據當前標籤和搜索關鍵字過濾供應商
   * @returns {Array} 過濾後的供應商列表
   */
  const filteredSuppliers = suppliers.filter(supplier => {
    // 標籤篩選
    if (activeTab === '已認證' && supplier.status !== 'approved') return false;
    if (activeTab === '待審核' && supplier.status !== 'pending') return false;
    if (activeTab === '風險監控' && supplier.riskLevel !== 'high') return false;
    
    // 搜索篩選
    if (searchTerm && !supplier.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  /**
   * 根據風險等級渲染風險指示器
   * @param {string} riskLevel - 風險等級（low/medium/high）
   * @returns {JSX.Element} 風險指示器元素
   */
  const renderRiskIndicator = (riskLevel) => {
    let levelClass = '';
    let levelText = '';
    let levelTextClass = '';
    
    switch (riskLevel) {
      case 'low':
        levelClass = 'low';
        levelText = '低風險';
        levelTextClass = 'text-success';
        break;
      case 'medium':
        levelClass = 'medium';
        levelText = '中風險';
        levelTextClass = 'text-warning';
        break;
      case 'high':
        levelClass = 'high';
        levelText = '高風險';
        levelTextClass = 'text-danger';
        break;
      default:
        levelClass = 'low';
        levelText = '低風險';
        levelTextClass = 'text-success';
    }
    
    return (
      <div className="d-flex justify-content-between align-items-center">
        <div className="risk-indicator">
          <div className={`risk-level ${levelClass}`}></div>
        </div>
        <span className={`ms-2 ${levelTextClass}`}>{levelText}</span>
      </div>
    );
  };
  
  /**
   * 渲染狀態標籤
   * @param {string} status - 供應商狀態（approved/pending/high-risk）
   * @returns {JSX.Element} 狀態標籤元素
   */
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="badge-pill approved">
            <FontAwesomeIcon icon={faCheckCircle} className="me-1" />已認證
          </span>
        );
      case 'pending':
        return (
          <span className="badge-pill pending">
            <FontAwesomeIcon icon={faHourglassHalf} className="me-1" />審核中
          </span>
        );
      case 'high-risk':
        return (
          <span className="badge-pill critical">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" />高風險
          </span>
        );
      default:
        return null;
    }
  };
  
  /**
   * 處理頁碼變更
   * @param {number} newPage - 新的頁碼
   */
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  
  return (
    <div className="supplier-management-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>供應商管理</h4>
        <div className="d-flex gap-3">
          <div className="search-bar">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input 
              type="text" 
              className="form-control" 
              placeholder="搜尋供應商"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="btn upload-btn"
            disabled={ !canWrite }
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" />新增供應商
          </button>
        </div>
      </div>
      
      <div className="tabs mb-4">
        {['全部', '已認證', '待審核', '風險監控'].map(tab => (
          <div 
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>
      
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card p-3">
            <h6 className="mb-3">供應商總覽</h6>
            <div className="d-flex justify-content-between mb-3">
              <div>供應商總數</div>
              <div className="fw-bold">68</div>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <div>已認證供應商</div>
              <div className="fw-bold text-success">42</div>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <div>待審核供應商</div>
              <div className="fw-bold text-warning">15</div>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <div>高風險供應商</div>
              <div className="fw-bold text-danger">11</div>
            </div>
          </div>
          
          <div className="card p-3">
            <h6 className="mb-3">篩選條件</h6>
            <div className="mb-3">
              <label className="form-label">供應商類別</label>
              <select className="form-select">
                <option>全部類別</option>
                <option>原材料供應商</option>
                <option>零配件供應商</option>
                <option>包裝材料供應商</option>
                <option>服務提供商</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">認證狀態</label>
              <select className="form-select">
                <option>全部狀態</option>
                <option>已通過認證</option>
                <option>認證進行中</option>
                <option>待認證</option>
                <option>認證過期</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">風險等級</label>
              <select className="form-select">
                <option>全部風險等級</option>
                <option>低風險</option>
                <option>中風險</option>
                <option>高風險</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">所在地區</label>
              <select className="form-select">
                <option>全部地區</option>
                <option>台灣</option>
                <option>中國大陸</option>
                <option>東南亞</option>
                <option>其他地區</option>
              </select>
            </div>
            <button className="btn btn-outline-primary w-100">
              <FontAwesomeIcon icon={faFilter} className="me-2" />套用篩選
            </button>
          </div>
        </div>
        
        <div className="col-md-9">
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-5">
              <h5>未找到符合條件的供應商</h5>
              <p className="text-muted">請嘗試調整搜尋條件</p>
            </div>
          ) : (
            <>
              {filteredSuppliers.map(supplier => (
                <div className="supplier-card" key={supplier.id}>
                  <div className="d-flex justify-content-between">
                    <div className="d-flex">
                      <div className="supplier-logo me-3">
                        <FontAwesomeIcon icon={faBuilding} />
                      </div>
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <h5 className="mb-0">{supplier.name}</h5>
                          {renderStatusBadge(supplier.status)}
                        </div>
                        <div>
                          {supplier.categories.map((category, index) => (
                            <span className="category-badge" key={index}>{category}</span>
                          ))}
                        </div>
                        <div className="supplier-meta">
                          <span>
                            <FontAwesomeIcon icon={faLocationDot} className="me-1" />
                            {supplier.location}
                          </span>
                          <span>
                            <FontAwesomeIcon icon={faCalendarCheck} className="me-1" />
                            合作自 {supplier.since}
                          </span>
                          <span>
                            <FontAwesomeIcon icon={faCheckSquare} className="me-1" />
                            {supplier.certifications} 項已完成認證
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="supplier-actions">
                      <button className="btn btn-sm btn-outline-secondary">
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button className={`btn btn-sm btn-outline-primary${ !canWrite ? 'icon-disabled' : ''}`}>
                        <FontAwesomeIcon icon={faPencil} />
                      </button>
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-md-4">
                      <div className="mb-1">風險評估</div>
                      {renderRiskIndicator(supplier.riskLevel)}
                    </div>
                    <div className="col-md-4">
                      <div className="mb-1">
                        {supplier.riskReason ? '風險原因' : 
                         supplier.ongoingCertification ? '進行中認證' : '最近認證'}
                      </div>
                      <div>
                        {supplier.riskReason ? supplier.riskReason : 
                         supplier.ongoingCertification ? (
                           <>
                             {supplier.ongoingCertification.name} 
                             <span className="text-primary small">
                               進行中 ({supplier.ongoingCertification.progress}%)
                             </span>
                           </>
                         ) : (
                           <>
                             {supplier.latestCertification.name} 
                             <span className="text-muted small">
                               ({supplier.latestCertification.date})
                             </span>
                           </>
                         )}
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-1">
                        {supplier.actionNeeded ? '需要行動' : 
                         supplier.ongoingCertification && !supplier.riskReason ? '最近認證' : '認證到期提醒'}
                      </div>
                      <div>
                        {supplier.actionNeeded ? (
                          <>
                            {supplier.actionNeeded.name} 
                            <span className="text-danger small">
                              逾期 {supplier.actionNeeded.overdueDays} 天
                            </span>
                          </>
                        ) : supplier.ongoingCertification && !supplier.riskReason ? (
                          <>
                            {supplier.latestCertification.name} 
                            <span className="text-muted small">
                              ({supplier.latestCertification.date})
                            </span>
                          </>
                        ) : supplier.expirationReminder && supplier.expirationReminder.name ? (
                          <>
                            {supplier.expirationReminder.name} 
                            <span className="text-warning small">
                              剩餘{supplier.expirationReminder.daysLeft}天
                            </span>
                          </>
                        ) : (
                          supplier.expirationReminder && supplier.expirationReminder.text
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            
              <nav aria-label="供應商分頁">
                <ul className="pagination justify-content-center mt-4">
                  <li className="page-item disabled">
                    <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} disabled>上一頁</button>
                  </li>
                  <li className="page-item active">
                    <button className="page-link" onClick={() => handlePageChange(1)}>1</button>
                  </li>
                  <li className="page-item">
                    <button className="page-link" onClick={() => handlePageChange(2)}>2</button>
                  </li>
                  <li className="page-item">
                    <button className="page-link" onClick={() => handlePageChange(3)}>3</button>
                  </li>
                  <li className="page-item">
                    <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>下一頁</button>
                  </li>
                </ul>
              </nav>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierManagement; 