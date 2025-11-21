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
import SupplierModal from '../../components/modals/SupplierModal';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faSearch, 
  faFilter, 
  faEye, 
  faXmark,
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
import * as supplierApi from '../../services/supplierService';
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
  const PAGE_SIZE = 10;
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
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [filters, setFilters] = useState({
 category: 'ALL',
  status: 'ALL',
  risk: 'ALL',
  region: 'ALL',
});
const [draftFilters, setDraftFilters] = useState(filters);


  
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
  const [suppliers, setSuppliers] = useState([]);

  
  /**
   * 根據當前標籤和搜索關鍵字過濾供應商
   * @returns {Array} 過濾後的供應商列表
   */
  const filteredSuppliers = suppliers.filter(supplier => {
    // const totalSuppliers = suppliers.length;
    // const certifiedCount = suppliers.filter(s => s.status === 'approved').length;
    // const pendingCount   = suppliers.filter(s => s.status === 'pending').length;
    // const highRiskCount  = suppliers.filter(s => s.riskLevel === 'high').length;
    // 標籤篩選
    if (activeTab === '已認證' && supplier.status !== 'approved') return false;
    if (activeTab === '待審核' && supplier.status !== 'pending') return false;
    if (activeTab === '風險監控' && supplier.riskLevel !== 'high') return false;
    
    // 搜索篩選
    if (searchTerm && !((supplier.name || '').toLowerCase()).includes(searchTerm.toLowerCase())) {
    return false;
    }
    if (filters.category !== 'ALL') {
    // 以 supplier.type 做為供應商類別比對
      if ((supplier.type || '') !== filters.category) return false;
    }
    if (filters.status !== 'ALL') {
      // filters.status 可能是 'APPROVED' / 'PENDING'
      const want = filters.status.toLowerCase() === 'approved' ? 'approved' : 'pending';
      if (supplier.status !== want) return false;
    }
    if (filters.risk !== 'ALL') {
      // 'LOW' | 'MEDIUM' | 'HIGH'
      if (supplier.riskLevel !== filters.risk.toLowerCase()) return false;
    }
    if (filters.region !== 'ALL') {
      // 以 country code 或文字比對（ex: 'TW','CN','VN' 或 '台灣'…依你資料）
      const loc = (supplier.location || '').toString().toUpperCase();
      if (loc !== filters.region.toUpperCase()) return false;
    }

    
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filteredSuppliers.length / PAGE_SIZE));
  const safePage   = Math.min(Math.max(currentPage, 1), totalPages);
  const startIdx   = (safePage - 1) * PAGE_SIZE;
  const endIdx     = startIdx + PAGE_SIZE;
  const pagedSuppliers = filteredSuppliers.slice(startIdx, endIdx);
  const totalSuppliers = suppliers.length;
  const certifiedCount = suppliers.filter(s => s.status === 'approved').length;
  const pendingCount   = suppliers.filter(s => s.status === 'pending').length;
  const highRiskCount  = suppliers.filter(s => s.riskLevel === 'high').length;
  
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
  // Modal 控制
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view' | 'edit' | 'create'
  const [currentSupplier, setCurrentSupplier] = useState(null);
  const dtoToUi = (dto) => ({
  id: dto.id,
  name: dto.name || '',
  type: dto.type || '',

  // 卡片顯示用
  status: dto.certificateStatus === 'CERTIFICATED' ? 'approved' : 'pending',
  categories: [],
  location: dto.country || '',
  since: dto.collabStart ? String(new Date(dto.collabStart).getFullYear()) : '',
  certifications: 0,
  riskLevel: (dto.riskProfile || 'MEDIUM').toLowerCase(),

  latestCertification: undefined,
  ongoingCertification: undefined,
  expirationReminder: undefined,
  actionNeeded: undefined,

  
  product: (dto.product || '').replace(/\u00A0/g, ' ').replace(/\t/g, ' ').replace(/\s+/g, ' ').trim(),
  address: (dto.address || '').replace(/\u00A0/g, ' ').replace(/\t/g, ' ').replace(/\s+/g, ' ').trim(),
  telephone: (dto.telephone || '').replace(/\u00A0/g, ' ').replace(/\t/g, ' ').replace(/\s+/g, ' ').trim(),
  email: (dto.email || '').replace(/\u00A0/g, ' ').replace(/\t/g, ' ').replace(/\s+/g, ' ').trim(),
  
  collabStart: dto.collabStart ? new Date(dto.collabStart).toISOString().slice(0, 10) : '',
  
  certificateStatus: (dto.certificateStatus || 'UNDER_CERTIFICATION').toUpperCase(),
  riskProfile: (dto.riskProfile || 'MEDIUM').toUpperCase(),
  commonCerts: Array.isArray(dto.commonCerts) ? dto.commonCerts : [],
  otherCertification: dto.otherCertification || '',
});
// ---- 下方新增：把 UI 的表單資料轉成後端 DTO ----
const uiToDto = (form) => {
  const toEnum = (v) => (typeof v === 'string' ? v.trim().toUpperCase() : v);
  return {
    id: form.id ?? null,
    name: form.name ?? '',
    type: form.type ?? null,
    product: form.product ?? null,
    country: form.country ?? '',
    address: form.address ?? null,
    telephone: form.telephone ?? null,
    email: form.email ?? null,
    certificateStatus: toEnum(form.certificateStatus ?? 'UNDER_CERTIFICATION'),
    riskProfile: toEnum(form.riskProfile ?? 'MEDIUM'),
    // ★ yyyy-MM-dd → epoch 毫秒；空值回傳 null
    collabStart: form.collabStart ? new Date(form.collabStart).getTime() : null,
    commonCerts: Array.isArray(form.selectedCerts) ? [...new Set(form.selectedCerts)] : [],
    otherCertification: (form.otherCert || '').trim(),
  };
};

// ---- 下方新增：統一的重新載入函式 ----
const reload = async () => {
  try {
    setLoading(true);
    const data = await supplierApi.listSuppliers();
    setSuppliers(prev => {
      const prevMap = new Map(prev.map(s => [s.id, s]));
      return (Array.isArray(data) ? data.map(dtoToUi) : []).map(next => {
        const old = prevMap.get(next.id);
        return {
          ...next,
          commonCerts: (Array.isArray(next.commonCerts) && next.commonCerts.length)
            ? next.commonCerts
            : (old?.commonCerts || []),
          otherCertification: (next.otherCertification ?? '') !== ''
            ? next.otherCertification
            : (old?.otherCertification || ''),
        };
      });
    });
  } finally {
    setLoading(false);
  }
};



React.useEffect(() => {
  let mounted = true;
  (async () => {
    if (!mounted) return;
    await reload();
  })();
  return () => { mounted = false; };
}, []);


  // 查看
const handleView = (s) => {
  setCurrentSupplier(s);
  setModalMode('view');
  setModalOpen(true);
};

// 編輯
const handleEdit = (s) => {
  
  setCurrentSupplier(s);
  setModalMode('edit');
  setModalOpen(true);
};

// 新增
const handleCreate = () => {
  
  setCurrentSupplier({
    id: null, name: '', type: '', product: '', country: '',
    address: '', telephone: '', email: '', collabStart: '',
    certificateStatus: 'UNDER_CERTIFICATION', riskProfile: 'MEDIUM',
  });
  setModalMode('create');
  setModalOpen(true);
};

// 先本地更新加上後端更新
const handleSave = async (form) => {
  try {
    const dto = uiToDto(form);
    
    if (modalMode === 'create') {
      await supplierApi.createSupplier(dto);
    } else if (modalMode === 'edit' && form.id != null) {
      await supplierApi.updateSupplier(form.id, dto);
    }
    setSuppliers(prev =>
      prev.map(s =>
        s.id === (form.id ?? null)
          ? {
              ...s,
              // 把表單的選擇直接寫回列表物件（後端若尚未實作也能顯示）
              commonCerts: Array.isArray(form.selectedCerts) ? [...new Set(form.selectedCerts)] : [],
              otherCertification: (form.otherCert || '').trim(),
            }
          : s
      )
    );
    await reload();      // 成功後重抓列表
    setModalOpen(false); // 關閉 Modal
  } catch (e) {
    console.error(e);
    alert(`儲存失敗：${e?.response?.data?.message || e.message || e}`);
  }
};
// 刪除（暫用瀏覽器確認窗）
const askDelete = async (id) => {
  if (!window.confirm('刪除後將無法復原，確定要刪除此供應商嗎？')) return;
  try {
    await supplierApi.deleteSupplier(id); // ← 打後端
    await reload();                       // ← 刷新列表
  } catch (e) {
    console.error(e);
    alert(`刪除失敗：${e?.response?.data?.message || e.message || e}`);
  }
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
          <button className="btn btn-sm btn-outline-secondary" onClick={handleCreate}>
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
              <div className="fw-bold">{totalSuppliers}</div>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <div>已認證供應商</div>
              <div className="fw-bold text-success">{certifiedCount}</div>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <div>待審核供應商</div>
              <div className="fw-bold text-warning">{pendingCount}</div>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <div>高風險供應商</div>
              <div className="fw-bold text-danger">{highRiskCount}</div>
            </div>
          </div>
          
          <div className="card p-3">
            <h6 className="mb-3">篩選條件</h6>
            <div className="mb-3">
              <label className="form-label">供應商類別</label>
              <select
                className="form-select"
                value={draftFilters.category}
                onChange={(e) => setDraftFilters(d => ({ ...d, category: e.target.value }))}
              > 
              <option value="ALL">全部類別</option>
                {/* 依照你的 dto.type 實際值調整 value */}
                <option value="RAW_MATERIAL">原材料供應商</option>
                <option value="PARTS">零配件供應商</option>
                <option value="PACKAGING">包裝材料供應商</option>
                <option value="SERVICE">服務提供商</option>
              </select>
              
            </div>
            <div className="mb-3">
              <label className="form-label">認證狀態</label>
              <select
              className="form-select"
              value={draftFilters.status}
              onChange={(e) => setDraftFilters(d => ({ ...d, status: e.target.value }))}
            >
              <option value="ALL">全部狀態</option>
              <option value="APPROVED">已通過認證</option>
              <option value="UNDER_CERTIFICATION">認證進行中</option>
              <option value="PENDING">待認證</option>
              <option value="EXPIRED">認證過期</option>
            </select>
            </div>
            <div className="mb-3">
              <label className="form-label">風險等級</label>
              <select
                className="form-select"
                value={draftFilters.risk}
                onChange={(e) => setDraftFilters(d => ({ ...d, risk: e.target.value }))}
              >
                <option value="ALL">全部風險等級</option>
                <option value="LOW">低風險</option>
                <option value="MEDIUM">中風險</option>
                <option value="HIGH">高風險</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">所在地區</label>
              <select
                className="form-select"
                value={draftFilters.region}
                onChange={(e) => setDraftFilters(d => ({ ...d, region: e.target.value }))}
              >
                <option value="ALL">全部地區</option>
                <option value="TW">台灣</option>
                <option value="CN">中國大陸</option>
                <option value="SEA">東南亞</option>
                <option value="OTHER">其他地區</option>
              </select>
            </div>
            <button
                className="btn btn-outline-primary w-100"
                onClick={() => { setFilters(draftFilters); setCurrentPage(1); }}
              >
                <FontAwesomeIcon icon={faFilter} className="me-2" />套用篩選
              </button>
          </div>
        </div>
        
       <div className="col-md-9">
          {loading ? (
            <div className="text-center py-5">資料載入中…</div>
          ) : error ? (
            <div className="text-center py-5 text-danger">載入失敗：{String(error)}</div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-5">
              <h5>未找到符合條件的供應商</h5>
              <p className="text-muted">請嘗試調整搜尋條件</p>
            </div>
          ) : (
            <>
              {pagedSuppliers.map((supplier) => (
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
                          {(Array.isArray(supplier.categories) ? supplier.categories : []).map(
                            (category, index) => (
                              <span className="category-badge" key={`cat-${supplier.id}-${index}`}>
                                {category}
                              </span>
                            )
                          )}
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
                          {(() => {
                              const completedCerts = [
                                ...(Array.isArray(supplier.commonCerts) ? supplier.commonCerts : []),
                                ...(supplier.otherCertification ? [supplier.otherCertification] : []),
                              ].filter(Boolean);

                              return (
                                <span className="d-inline-flex align-items-center flex-wrap gap-2">
                                  <FontAwesomeIcon icon={faCheckSquare} className="me-1" />
                                  <span className="me-1">{completedCerts.length} 項已完成認證</span>

                                  
                                </span>
                              );
                            })()}

                        </div>
                      </div>
                    </div>

                    <div className="supplier-actions">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handleView(supplier)}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary mx-2"
                        onClick={() => handleEdit(supplier)}
                      >
                        <FontAwesomeIcon icon={faPencil} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => askDelete(supplier.id)}
                        aria-label="刪除供應商"
                      >
                        <FontAwesomeIcon icon={faXmark} />
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
                        {supplier.riskReason
                          ? '風險原因'
                          : supplier.ongoingCertification
                          ? '進行中認證'
                          : supplier.latestCertification
                          ? '最近認證'
                          : '已完成認證：'}
                      </div>
                      <div>
                        {supplier.riskReason ? (
                          supplier.riskReason
                        ) : supplier.ongoingCertification ? (
                          <>
                            {supplier.ongoingCertification.name}{' '}
                            <span className="text-primary small">
                              進行中 ({supplier.ongoingCertification.progress}%)
                            </span>
                          </>
                        ) : supplier.latestCertification ? (
                          <>
                            {supplier.latestCertification.name}{' '}
                            <span className="text-muted small">
                              ({supplier.latestCertification.date})
                            </span>
                          </>
                        ) : (
                          (() => {
                      const items = [
                        ...(Array.isArray(supplier.commonCerts) ? supplier.commonCerts : []),
                        ...(supplier.otherCertification ? [supplier.otherCertification] : []),
                      ].filter(Boolean);

                      if (items.length === 0) {
                        return <span className="text-muted small">無資料</span>;
                      }

                      return (
                        <div className="d-flex flex-wrap gap-2">
                          {items.map((cert, i) => (
                            <span
                              key={`${supplier.id}-cert-${i}`}
                              className="badge rounded-pill bg-primary-subtle text-primary fs-5"
                            >
                              {cert}
                            </span>
                          ))}
                        </div>
                      );
                    })()

                        )}
                      </div>
                    </div>

                    
                  </div>
                </div>
              ))}

              <nav aria-label="供應商分頁">
                  <ul className="pagination justify-content-center mt-4">
                    {/* 上一頁 */}
                    <li className={`page-item ${safePage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={safePage === 1}
                      >
                        上一頁
                      </button>
                    </li>

                    {/* 動態頁碼（最多顯示 7 個） */}
                    {Array.from({ length: totalPages })
                      .slice(
                        Math.max(0, safePage - 4),
                        Math.max(0, safePage - 4) + Math.min(7, totalPages)
                      )
                      .map((_, i) => {
                        const first = Math.max(1, safePage - 3);
                        const page = first + i;
                        return (
                          <li key={page} className={`page-item ${page === safePage ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => setCurrentPage(page)}>
                              {page}
                            </button>
                          </li>
                        );
                      })}

                    {/* 下一頁 */}
                    <li className={`page-item ${safePage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={safePage === totalPages}
                      >
                        下一頁
                      </button>
                    </li>
                  </ul>
                </nav>

            </>
          )}
        </div>
        </div>

        <SupplierModal
          open={modalOpen}
          mode={modalMode}            // 'view' | 'edit' | 'create'
          supplier={currentSupplier}
          canWrite={canWrite}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
        </div>

        );
        };

        
        export default SupplierManagement;