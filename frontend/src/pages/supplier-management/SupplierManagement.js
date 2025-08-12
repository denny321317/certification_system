import React, { useState, useEffect } from 'react';
import { fetchSuppliers, addSupplier } from '../../services/supplierService'
import { deleteSupplier } from '../../services/supplierService';  
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { updateSupplier } from '../../services/supplierService';
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

const SupplierManagement = () => {
  const [activeTab, setActiveTab] = useState('全部');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [suppliers, setSuppliers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null); // null: 沒有在編輯
  const [formValues, setFormValues] = useState({
    name: '',
    status: '',
    categories: [],
    location: '',
    since: '',
    certifications: 0,
    riskLevel: '',
    latestCertification: { name: '', date: '' },
    expirationReminder: { name: '', daysLeft: 0, text: '' },
    actionNeeded: { name: '', overdueDays: 0 },
    ongoingCertification: { name: '', progress: 0 },
    riskReason: ''
});
  const [newSupplier, setNewSupplier] = useState({
    id:'',
    name: '',
    status: '',
    categories: [],
    location: '',
    since: '',
    certifications: 0,
    riskLevel: '',
    latestCertification: { name: '', date: '' },
    expirationReminder: { name: '', daysLeft: 0, text: '' },
    actionNeeded: { name: '', overdueDays: 0 },
    ongoingCertification: { name: '', progress: 0 },
    riskReason: ''
    // 其他欄位...
  });
  // 供應商數據

  
  // 篩選供應商基於當前標籤和搜索詞
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
  
  // 根據風險等級渲染風險指示器
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
  
  // 渲染狀態標籤
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
  
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
const handleAddSupplier = async () => {
  try {
    if (editingSupplier) {
      
      // 這裡呼叫你的更新 API
      await updateSupplier(editingSupplier.id, formValues); 
    } else {
      // 呼叫 API 新增
      await addSupplier(formValues);
      // 新增成功後，再 fetch 一次所有供應商，讓畫面同步
      const newList = await fetchSuppliers();
      setSuppliers(newList);
    }
    setShowAddModal(false);
    setEditingSupplier(null);
    setFormValues({
      name: '',
      status: '',
      categories: [],
      location: '',
      since: '',
      certifications: 0,
      riskLevel: '',
      latestCertification: { name: '', date: '' },
      expirationReminder: { name: '', daysLeft: 0, text: '' },
      actionNeeded: { name: '', overdueDays: 0 },
      ongoingCertification: { name: '', progress: 0 },
      riskReason: ''
    });
  } catch (error) {
    console.error('新增供應商失敗', error);
    alert('新增失敗，請稍後再試');
  }
};

const handleDeleteSupplier = async(id) => {
 if (window.confirm('確定要刪除這個供應商嗎？')) {
    try {
      await deleteSupplier(id);
      // 刪除成功後重新獲取供應商列表
      const updatedList = await fetchSuppliers();
      setSuppliers(updatedList);
    } catch (err) {
      alert('刪除失敗，請稍後再試');
      console.error(err);
    }
  }
};

const handleOpenAddModal = () => {
  setEditingSupplier(null); // 這行超重要，讓 useEffect 走到新增模式
  setFormValues({
    name: '',
    status: '',
    categories: [],
    location: '',
    since: '',
    certifications: 0,
    riskLevel: '',
    latestCertification: { name: '', date: '' },
    expirationReminder: { name: '', daysLeft: 0, text: '' },
    actionNeeded: { name: '', overdueDays: 0 },
    ongoingCertification: { name: '', progress: 0 },
    riskReason: ''
  });
  setShowAddModal(true);
};
const [viewingSupplier, setViewingSupplier] = useState(null);

useEffect(() => {
  if (showAddModal) {  // 你用哪個modal狀態都可以
    if (editingSupplier) {
      // 編輯模式，填入資料
      setFormValues({
        name: editingSupplier.name || '',
        location: editingSupplier.location || '',
        since: editingSupplier.since || '',
        certifications: editingSupplier.certifications || 0,
        riskLevel: editingSupplier.riskLevel || '',
        latestCertification: editingSupplier.latestCertification || { name: '', date: '' },
        expirationReminder: editingSupplier.expirationReminder || { name: '', daysLeft: 0, text: '' },
        actionNeeded: editingSupplier.actionNeeded || { name: '', overdueDays: 0 },
        ongoingCertification: editingSupplier.ongoingCertification || { name: '', progress: 0 },
        riskReason: editingSupplier.riskReason || ''
      });
    } else {
      // 新增模式，清空
      setFormValues({
        name: '',
        status: '',
        categories: [],
        location: '',
        since: '',
        certifications: 0,
        riskLevel: '',
        latestCertification: { name: '', date: '' },
        expirationReminder: { name: '', daysLeft: 0, text: '' },
        actionNeeded: { name: '', overdueDays: 0 },
        ongoingCertification: { name: '', progress: 0 },
        riskReason: ''
      });
    }
  }
}, [showAddModal, editingSupplier]);
useEffect(() => {
  fetchSuppliers().then(data => setSuppliers(data));
}, []);


  return (
    <div className="supplier-management-container">
              {viewingSupplier && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <h5>供應商詳細資訊</h5>
              <div>
                <strong>名稱：</strong> {viewingSupplier.name}<br/>
                <strong>所在地：</strong> {viewingSupplier.location}<br/>
                <strong>合作自：</strong> {viewingSupplier.since}<br/>
                <strong>認證數量：</strong> {viewingSupplier.certifications}<br/>
                <strong>風險等級：</strong> {viewingSupplier.riskLevel}<br/>
                {/* 其他欄位... */}
              </div>
              <button onClick={() => setViewingSupplier(null)}>關閉</button>
            </div>
          </div>
        )}

      {showAddModal && (
  <div className="modal-backdrop">
    <div className="modal-content">
      <h5>{editingSupplier ? '編輯供應商' : '新增供應商'}</h5>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
             if (editingSupplier) {
                // 編輯
                await updateSupplier(editingSupplier.id, formValues);  // 這個API是你自己定義的
              } else {
                // 新增
                await addSupplier(formValues);
              }    // 送到後端
            const updated = await fetchSuppliers(); // 重新抓後端最新資料
            setSuppliers(updated);              // 用 setSuppliers 更新
            setShowAddModal(false);
            setEditingSupplier(null);
            // ...reset 表單
          } catch (err) {
            alert('新增失敗！');
            console.error(err);
  }
        }}
      >
        <div>
          <label>供應商名稱</label>
          <input
            type="text"
            value={formValues.name}
            onChange={e => setFormValues({ ...formValues, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label>所在地</label>
          <input
            type="text"
            value={formValues.location}
            onChange={e => setFormValues({ ...formValues, location: e.target.value })}
            required
          />
        </div>
        
        {/* 你可以繼續增加更多欄位 */}
        {/* 合作年 */}
        <div>
          <label>合作自（年）</label>
          <input
            type="number"
            value={formValues.since}
            onChange={e => setFormValues({ ...formValues, since: e.target.value })}
            required
            min="2000"
            max={new Date().getFullYear()}
          />
        </div>

        {/* 認證數量 */}
        <div>
          <label>認證數量</label>
          <input
            type="number"
            value={formValues.certifications}
            onChange={e => setFormValues({ ...formValues, certifications: parseInt(e.target.value) || 0 })}
            min="0"
            required
          />
        </div>

        {/* 風險等級 */}
        <div>
          <label>風險等級</label>
          <select
            value={formValues.riskLevel}
            onChange={e => setFormValues({ ...formValues, riskLevel: e.target.value })}
            required
          >
            <option value="">請選擇</option>
            <option value="low">低風險</option>
            <option value="medium">中風險</option>
            <option value="high">高風險</option>
          </select>
        </div>
         {/* 最近認證 */}
        <div>
          <label>最近認證名稱</label>
          <input
            type="text"
            value={formValues.latestCertification.name}
            onChange={e =>
              setFormValues({
                ...formValues,
                latestCertification: {
                  ...formValues.latestCertification,
                  name: e.target.value,
                }
              })
            }
          />
        </div>
        <div>
          <label>最近認證日期</label>
          <input
            type="date"
            value={formValues.latestCertification.date}
            onChange={e =>
              setFormValues({
                ...formValues,
                latestCertification: {
                  ...formValues.latestCertification,
                  date: e.target.value,
                }
              })
            }
          />
        </div>

        {/* 認證到期提醒 */}
        <div>
          <label>認證到期提醒名稱</label>
          <input
            type="text"
            value={formValues.expirationReminder.name}
            onChange={e =>
              setFormValues({
                ...formValues,
                expirationReminder: {
                  ...formValues.expirationReminder,
                  name: e.target.value,
                }
              })
            }
          />
        </div>
        <div>
          <label>認證到期剩餘天數</label>
          <input
            type="number"
            value={formValues.expirationReminder.daysLeft}
            onChange={e =>
              setFormValues({
                ...formValues,
                expirationReminder: {
                  ...formValues.expirationReminder,
                  daysLeft: parseInt(e.target.value) || 0,
                }
              })
            }
          />
        </div>
        <div>
          <label>到期說明文字</label>
          <input
            type="text"
            value={formValues.expirationReminder.text}
            onChange={e =>
              setFormValues({
                ...formValues,
                expirationReminder: {
                  ...formValues.expirationReminder,
                  text: e.target.value,
                }
              })
            }
          />
        </div>

        {/* 需要行動 */}
        <div>
          <label>需要行動名稱</label>
          <input
            type="text"
            value={newSupplier.actionNeeded.name}
            onChange={e =>
              setNewSupplier({
                ...newSupplier,
                actionNeeded: {
                  ...newSupplier.actionNeeded,
                  name: e.target.value,
                }
              })
            }
          />
        </div>
        <div>
          <label>逾期天數</label>
          <input
            type="number"
            value={newSupplier.actionNeeded.overdueDays}
            onChange={e =>
              setNewSupplier({
                ...newSupplier,
                actionNeeded: {
                  ...newSupplier.actionNeeded,
                  overdueDays: parseInt(e.target.value) || 0,
                }
              })
            }
          />
        </div>

        {/* 進行中認證 */}
        <div>
          <label>進行中認證名稱</label>
          <input
            type="text"
            value={newSupplier.ongoingCertification.name}
            onChange={e =>
              setNewSupplier({
                ...newSupplier,
                ongoingCertification: {
                  ...newSupplier.ongoingCertification,
                  name: e.target.value,
                }
              })
            }
          />
        </div>
        <div>
          <label>進行中認證進度 (%)</label>
          <input
            type="number"
            value={newSupplier.ongoingCertification.progress}
            onChange={e =>
              setNewSupplier({
                ...newSupplier,
                ongoingCertification: {
                  ...newSupplier.ongoingCertification,
                  progress: parseInt(e.target.value) || 0,
                }
              })
            }
          />
        </div>

        {/* 風險原因 */}
        <div>
          <label>風險原因</label>
          <input
            type="text"
            value={newSupplier.riskReason}
            onChange={e => setNewSupplier({ ...newSupplier, riskReason: e.target.value })}
          />
        </div>
        <div style={{marginTop: 12}}>
          <button type="submit">送出</button>
          <button type="button" onClick={() => setShowAddModal(false)}>取消</button>
        </div>
      </form>
    </div>
  </div>
)}

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
              <button className="btn upload-btn" onClick={handleOpenAddModal}>
                 <FontAwesomeIcon icon={faPlus} className="me-2" />
                新增供應商
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
              {filteredSuppliers &&
  filteredSuppliers
    .filter(s => s && s.name) // 過濾掉沒資料或沒 name 的 supplier
    .map((supplier, idx) => (
      <div className="supplier-card" key={supplier.id || idx}>
        <div className="d-flex justify-content-between">
          <div className="d-flex">
            <div className="supplier-logo me-3">
              <FontAwesomeIcon icon={faBuilding} />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h5 className="mb-0">{supplier.name || '(無名稱)'}</h5>
                {renderStatusBadge(supplier.status)}
              </div>
              <div>
                {(supplier.categories || []).map((category, index) => (
                  <span className="category-badge" key={index}>{category}</span>
                ))}
              </div>
              <div className="supplier-meta">
                <span>
                  <FontAwesomeIcon icon={faLocationDot} className="me-1" />
                  {supplier.location || ''}
                </span>
                <span>
                  <FontAwesomeIcon icon={faCalendarCheck} className="me-1" />
                  合作自 {supplier.since || ''}
                </span>
                <span>
                  <FontAwesomeIcon icon={faCheckSquare} className="me-1" />
                  {supplier.certifications || 0} 項已完成認證
                </span>
              </div>
            </div>
          </div>
          <div className="supplier-actions">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setViewingSupplier(supplier)}
            >
              <FontAwesomeIcon icon={faEye} />
            </button>


            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => {
                setEditingSupplier(supplier);
                setFormValues({
                    name: '',
                    status: '',
                    categories: [],
                    location: '',
                    since: '',
                    certifications: 0,
                    riskLevel: '',
                    latestCertification: { name: '', date: '' },
                    expirationReminder: { name: '', daysLeft: 0, text: '' },
                    actionNeeded: { name: '', overdueDays: 0 },
                    ongoingCertification: { name: '', progress: 0 },
                    riskReason: ''
                  });
                setShowAddModal(true);
              }}
            >
              <FontAwesomeIcon icon={faPencil} />
            </button>
            <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDeleteSupplier(supplier.id)}
              >
                <FontAwesomeIcon icon={faTrash} />
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
                : '最近認證'}
            </div>
            <div>
              {supplier.riskReason
                ? supplier.riskReason
                : supplier.ongoingCertification
                ? (
                  <>
                    {supplier.ongoingCertification.name || ''}
                    <span className="text-primary small">
                      進行中 ({supplier.ongoingCertification.progress || 0}%)
                    </span>
                  </>
                )
                : (
                  <>
                    {(supplier.latestCertification && supplier.latestCertification.name) || ''}
                    <span className="text-muted small">
                      ({(supplier.latestCertification && supplier.latestCertification.date) || ''})
                    </span>
                  </>
                )}
            </div>
          </div>
          <div className="col-md-4">
            <div className="mb-1">
              {supplier.actionNeeded
                ? '需要行動'
                : supplier.ongoingCertification && !supplier.riskReason
                ? '最近認證'
                : '認證到期提醒'}
            </div>
            <div>
              {supplier.actionNeeded ? (
                <>
                  {supplier.actionNeeded.name || ''}
                  <span className="text-danger small">
                    逾期 {supplier.actionNeeded.overdueDays || 0} 天
                  </span>
                </>
              ) : supplier.ongoingCertification && !supplier.riskReason ? (
                <>
                  {(supplier.latestCertification && supplier.latestCertification.name) || ''}
                  <span className="text-muted small">
                    ({(supplier.latestCertification && supplier.latestCertification.date) || ''})
                  </span>
                </>
              ) : supplier.expirationReminder && supplier.expirationReminder.name ? (
                <>
                  {supplier.expirationReminder.name}
                  <span className="text-warning small">
                    剩餘{supplier.expirationReminder.daysLeft || 0}天
                  </span>
                </>
              ) : (
                supplier.expirationReminder && supplier.expirationReminder.text
              )}
            </div>
          </div>
        </div>
      </div>
    ))
}

            
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