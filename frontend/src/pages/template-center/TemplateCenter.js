/**
 * 模板中心組件
 * 
 * 此組件提供企業認證系統的模板管理功能，包含：
 * 1. 模板分類管理
 * 2. 模板搜索和篩選
 * 3. 模板列表展示
 * 4. 模板編輯器整合
 * 
 * 特點：
 * - 支持多種認證模板（SMETA、ISO等）
 * - 提供模板分類和標籤管理
 * - 支持模板的創建、編輯和使用
 * - 響應式設計，適配不同屏幕尺寸
 * 
 * 使用方式：
 * ```jsx
 * <TemplateCenter />
 * ```
 */

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faFilter, faPlus, faThLarge, faCheckCircle, 
  faAward, faBuilding, faIdBadge, faBolt, faPlusCircle,
  faFileAlt, faFileExcel, faFileWord, faFilePdf, faClock,
  faTimes, faEdit, faTrash
} from '@fortawesome/free-solid-svg-icons';
import TemplateEditor from './components/TemplateEditor';
import './TemplateCenter.css';

/**
 * 模板中心組件
 * @returns {JSX.Element} 模板中心介面
 */
const TemplateCenter = () => {
  /**
   * 搜索關鍵字狀態
   * @type {[string, Function]} [搜索關鍵字, 設置搜索關鍵字的函數]
   */
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * 排序選項狀態
   * @type {[string, Function]} [當前排序選項, 設置排序選項的函數]
   */
  const [sortOption, setSortOption] = useState('recent');

  /**
   * 當前選中的分類狀態
   * @type {[string, Function]} [當前分類ID, 設置當前分類的函數]
   */
  const [activeCategory, setActiveCategory] = useState('all');

  /**
   * 模板編輯器顯示狀態
   * @type {[boolean, Function]} [是否顯示編輯器, 設置編輯器顯示狀態的函數]
   */
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  /**
   * 當前頁碼狀態
   * @type {[number, Function]} [當前頁碼, 設置頁碼的函數]
   */
  const [currentPage, setCurrentPage] = useState(1);

  /**
   * 模板分類數據
   * @type {Array<{
   *   id: string,       // 分類ID
   *   name: string,     // 分類名稱
   *   icon: IconDefinition, // 分類圖標
   *   count: number     // 模板數量
   * }>}
   */
  const categories = [
    { id: 'all', name: '所有模板', icon: faThLarge, count: 25 },
    { id: 'smeta', name: 'SMETA 認證模板', icon: faCheckCircle, count: 8 },
    { id: 'iso', name: 'ISO 認證模板', icon: faAward, count: 10 },
    { id: 'supplier', name: '供應商管理模板', icon: faBuilding, count: 5 },
    { id: 'employee', name: '員工與培訓模板', icon: faIdBadge, count: 7 },
    { id: 'custom', name: '自訂模板', icon: faBolt, count: 3 }
  ];

  /**
   * 根據文件類型返回對應的圖標
   * @param {string} fileType - 文件類型（excel/word/pdf）
   * @returns {JSX.Element} FontAwesome圖標元素
   */
  const getTemplateIcon = (fileType) => {
    switch (fileType) {
      case 'excel':
        return <FontAwesomeIcon icon={faFileExcel} className="template-icon excel" />;
      case 'word':
        return <FontAwesomeIcon icon={faFileWord} className="template-icon word" />;
      case 'pdf':
        return <FontAwesomeIcon icon={faFilePdf} className="template-icon pdf" />;
      default:
        return <FontAwesomeIcon icon={faFileAlt} className="template-icon" />;
    }
  };

  /**
   * 模板數據列表
   * @type {Array<{
   *   id: number,       // 模板ID
   *   name: string,     // 模板名稱
   *   type: string,     // 模板類型
   *   tags: string[],   // 標籤列表
   *   updatedAt: string, // 更新時間
   *   category: string   // 所屬分類
   * }>}
   */
  const templates = [
    {
      id: 1,
      name: 'SMETA 勞工權益審核清單',
      type: 'text',
      tags: ['SMETA', '勞工權益'],
      updatedAt: '2023-08-15',
      category: 'smeta'
    },
    {
      id: 2,
      name: '員工工時記錄表',
      type: 'excel',
      tags: ['SMETA', '員工管理'],
      updatedAt: '2023-09-01',
      category: 'smeta'
    },
    {
      id: 3,
      name: '環境管理政策聲明',
      type: 'word',
      tags: ['ISO 14001', '政策文件'],
      updatedAt: '2023-07-20',
      category: 'iso'
    },
    {
      id: 4,
      name: '安全風險評估表',
      type: 'pdf',
      tags: ['SMETA', '健康安全'],
      updatedAt: '2023-06-12',
      category: 'smeta'
    },
    {
      id: 5,
      name: '供應商評估問卷',
      type: 'excel',
      tags: ['供應商管理'],
      updatedAt: '2023-08-25',
      category: 'supplier'
    },
    {
      id: 6,
      name: 'ISO 9001 文件控制程序',
      type: 'word',
      tags: ['ISO 9001', '程序文件'],
      updatedAt: '2023-07-10',
      category: 'iso'
    },
    {
      id: 7,
      name: '商業道德合規聲明',
      type: 'pdf',
      tags: ['SMETA', '商業道德'],
      updatedAt: '2023-05-30',
      category: 'smeta'
    },
    {
      id: 8,
      name: '員工培訓記錄表',
      type: 'excel',
      tags: ['培訓管理', '員工發展'],
      updatedAt: '2023-09-05',
      category: 'employee'
    },
    {
      id: 9,
      name: 'ISO 14001 環境目標計劃',
      type: 'pdf',
      tags: ['ISO 14001', '環境管理'],
      updatedAt: '2023-08-08',
      category: 'iso'
    }
  ];

  /**
   * 過濾模板列表
   * 根據當前選中的分類和搜索關鍵字過濾模板
   * @returns {Array} 過濾後的模板列表
   */
  const filteredTemplates = templates.filter(template => {
    // 按分類過濾
    if (activeCategory !== 'all' && template.category !== activeCategory) {
      return false;
    }
    
    // 按搜尋關鍵詞過濾
    if (searchQuery && !template.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  /**
   * 排序模板列表
   * 根據當前排序選項對模板進行排序
   * @returns {Array} 排序後的模板列表
   */
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortOption) {
      case 'nameAsc':
        return a.name.localeCompare(b.name);
      case 'nameDesc':
        return b.name.localeCompare(a.name);
      case 'frequency':
        // 假設有使用頻率的資料，這裡簡單實現
        return 0;
      case 'recent':
      default:
        return new Date(b.updatedAt) - new Date(a.updatedAt);
    }
  });

  /**
   * 處理頁碼變更
   * @param {number} newPage - 新的頁碼
   */
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // 1. 靜態認證模板資料（重構為一對多巢狀需求-文件結構）
  const certificationTemplates = [
    {
      id: 'smeta',
      displayName: 'SMETA',
      description: 'SMETA（Sedex會員道德貿易審核）是一套國際公認的社會責任審核標準，涵蓋勞工、健康安全、環境與商業道德四大支柱。',
      requirements: [
        {
          text: '完成自我評估問卷',
          documents: [
            { name: '自我評估問卷', description: '依SMETA標準填寫的自我評估表格' }
          ]
        },
        {
          text: '準備勞工權益、健康安全、環境管理、商業道德等相關文件',
          documents: [
            { name: '勞工權益政策', description: '公司對勞工權益的承諾與政策文件' },
            { name: '健康安全管理程序', description: '現場作業安全與健康管理相關文件' },
            { name: '環境管理計劃', description: '企業環境保護與管理措施說明' },
            { name: '商業道德聲明', description: '反貪腐、誠信經營等政策文件' }
          ]
        },
        {
          text: '接受現場審核與文件審查',
          documents: []
        }
      ]
    },
    {
      id: 'ctpat',
      displayName: 'C-TPAT',
      description: 'C-TPAT（海關-商貿反恐夥伴計畫）是美國海關推動的供應鏈安全認證，強調貨物運輸安全與反恐措施。',
      requirements: [
        {
          text: '建立供應鏈安全政策',
          documents: [
            { name: '供應鏈安全政策', description: '公司針對供應鏈安全的政策文件' }
          ]
        },
        {
          text: '落實人員背景查核與培訓',
          documents: [
            { name: '人員背景查核紀錄', description: '員工背景調查與查核紀錄' },
            { name: '安全培訓記錄', description: '針對反恐與安全的教育訓練紀錄' }
          ]
        },
        {
          text: '完善貨物運輸與倉儲安全措施',
          documents: [
            { name: '貨物運輸安全計劃', description: '貨物運輸過程的安全管理措施說明' }
          ]
        }
      ]
    },
    {
      id: 'iso9001',
      displayName: 'ISO9001',
      description: 'ISO 9001 是國際標準化組織制定的品質管理體系標準，強調持續改善與顧客滿意。',
      requirements: [
        {
          text: '建立品質管理手冊',
          documents: [
            { name: '品質管理手冊', description: '公司品質政策、組織架構與管理流程' }
          ]
        },
        {
          text: '明確組織職責與流程',
          documents: [
            { name: '程序文件', description: '各部門作業流程與標準作業程序(SOP)' }
          ]
        },
        {
          text: '持續監控與改善品質指標',
          documents: [
            { name: '內部稽核報告', description: '品質管理體系的自我檢查與改善報告' },
            { name: '顧客滿意度調查', description: '顧客意見回饋與滿意度調查紀錄' }
          ]
        }
      ]
    }
  ];

  // 2. 左側認證類型選單
  const [activeCert, setActiveCert] = useState(certificationTemplates[0]?.id || '');
  const filteredCertTemplates = certificationTemplates.filter(t =>
    t.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const activeTemplate = filteredCertTemplates.find(t => t.id === activeCert) || filteredCertTemplates[0];

  // 1. 新增建立新模板彈窗狀態與表單狀態
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplateForm, setNewTemplateForm] = useState({
    certId: '',
    description: '',
    requirements: [
      { text: '', documents: [] }
    ]
  });

  // 建立新模板表單互動
  const handleNewTemplateChange = (e) => {
    const { name, value } = e.target;
    setNewTemplateForm(prev => ({ ...prev, [name]: value }));
  };
  const handleNewRequirementChange = (idx, value) => {
    setNewTemplateForm(prev => {
      const reqs = [...prev.requirements];
      reqs[idx].text = value;
      return { ...prev, requirements: reqs };
    });
  };
  const handleAddRequirement = () => {
    setNewTemplateForm(prev => ({
      ...prev,
      requirements: [...prev.requirements, { text: '', documents: [] }]
    }));
  };
  const handleRemoveRequirement = (idx) => {
    setNewTemplateForm(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== idx)
    }));
  };
  const handleNewDocumentChange = (reqIdx, docIdx, field, value) => {
    setNewTemplateForm(prev => {
      const reqs = [...prev.requirements];
      reqs[reqIdx].documents[docIdx][field] = value;
      return { ...prev, requirements: reqs };
    });
  };
  const handleAddDocument = (reqIdx) => {
    setNewTemplateForm(prev => {
      const reqs = prev.requirements.map((req, idx) =>
        idx === reqIdx
          ? { ...req, documents: [...req.documents, { name: '', description: '' }] }
          : req
      );
      return { ...prev, requirements: reqs };
    });
  };
  const handleRemoveDocument = (reqIdx, docIdx) => {
    setNewTemplateForm(prev => {
      const reqs = [...prev.requirements];
      reqs[reqIdx].documents = reqs[reqIdx].documents.filter((_, i) => i !== docIdx);
      return { ...prev, requirements: reqs };
    });
  };
  const handleCreateTemplate = (e) => {
    e.preventDefault();
    const certId = newTemplateForm.certId.trim();
    if (!certId) return;
    // 只保留有內容的需求與文件
    const requirements = newTemplateForm.requirements
      .filter(r => r.text.trim())
      .map(r => ({
        text: r.text.trim(),
        documents: r.documents.filter(d => d.name.trim())
      }));
    certificationTemplates.push({
      id: certId,
      displayName: certId,
      description: newTemplateForm.description,
      requirements
    });
    setShowCreateModal(false);
    setNewTemplateForm({ certId: '', description: '', requirements: [ { text: '', documents: [] } ] });
  };

  // 3. 搜尋功能整合
  const filteredRequirements = activeTemplate?.requirements?.filter(req => 
    req.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
    req.documents.some(doc => 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      doc.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ) || [];

  // 編輯/刪除狀態
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTemplateForm, setEditTemplateForm] = useState({
    id: '',
    displayName: '',
    description: '',
    requirements: [ { text: '', documents: [] } ]
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState('');

  // 編輯
  const handleShowEditModal = (cert) => {
    setEditTemplateForm({
      id: cert.id,
      displayName: cert.displayName,
      description: cert.description || '',
      requirements: cert.requirements.length ? cert.requirements.map(r => ({
        text: r.text,
        documents: r.documents ? r.documents.map(d => ({ ...d })) : []
      })) : [ { text: '', documents: [] } ]
    });
    setShowEditModal(true);
  };
  const handleEditTemplateChange = (e) => {
    const { name, value } = e.target;
    setEditTemplateForm(prev => ({ ...prev, [name]: value }));
  };
  const handleEditRequirementChange = (idx, value) => {
    setEditTemplateForm(prev => {
      const reqs = [...prev.requirements];
      reqs[idx].text = value;
      return { ...prev, requirements: reqs };
    });
  };
  const handleAddEditRequirement = () => {
    setEditTemplateForm(prev => ({
      ...prev,
      requirements: [...prev.requirements, { text: '', documents: [] }]
    }));
  };
  const handleRemoveEditRequirement = (idx) => {
    setEditTemplateForm(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== idx)
    }));
  };
  const handleEditDocumentChange = (reqIdx, docIdx, field, value) => {
    setEditTemplateForm(prev => {
      const reqs = [...prev.requirements];
      reqs[reqIdx].documents[docIdx][field] = value;
      return { ...prev, requirements: reqs };
    });
  };
  const handleAddEditDocument = (reqIdx) => {
    setEditTemplateForm(prev => {
      const reqs = prev.requirements.map((req, idx) =>
        idx === reqIdx
          ? { ...req, documents: [...req.documents, { name: '', description: '' }] }
          : req
      );
      return { ...prev, requirements: reqs };
    });
  };
  const handleRemoveEditDocument = (reqIdx, docIdx) => {
    setEditTemplateForm(prev => {
      const reqs = [...prev.requirements];
      reqs[reqIdx].documents = reqs[reqIdx].documents.filter((_, i) => i !== docIdx);
      return { ...prev, requirements: reqs };
    });
  };
  const handleSaveEditTemplate = (e) => {
    e.preventDefault();
    const idx = certificationTemplates.findIndex(t => t.id === editTemplateForm.id);
    if (idx !== -1) {
      certificationTemplates[idx].displayName = editTemplateForm.displayName;
      certificationTemplates[idx].description = editTemplateForm.description;
      certificationTemplates[idx].requirements = editTemplateForm.requirements
        .filter(r => r.text.trim())
        .map(r => ({
          text: r.text.trim(),
          documents: r.documents.filter(d => d.name.trim())
        }));
    }
    setShowEditModal(false);
  };
  // 刪除
  const handleShowDeleteModal = (id) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };
  const handleDeleteTemplate = () => {
    const idx = certificationTemplates.findIndex(t => t.id === deleteTargetId);
    if (idx !== -1) {
      certificationTemplates.splice(idx, 1);
      if (activeCert === deleteTargetId) {
        setActiveCert(certificationTemplates[0]?.id || '');
      }
    }
    setShowDeleteModal(false);
    setDeleteTargetId('');
  };

  // 新增/編輯彈窗開啟時自動同步文字框內容
  useEffect(() => {
    if (showCreateModal) {
      setNewTemplateForm({ certId: '', description: '', requirements: [ { text: '', documents: [] } ] });
    }
  }, [showCreateModal]);

  // 篩選面板狀態
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterType, setFilterType] = useState('all'); // all | requirement | document

  // 篩選應用
  const handleApplyFilter = () => {
    setShowFilterPanel(false);
  };
  const handleResetFilter = () => {
    setFilterType('all');
    setShowFilterPanel(false);
  };

  return (
    <div className="template-center-container">
      {!isEditorOpen ? (
        <>
      <div className="header-actions">
        <h4>模板中心</h4>
        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            建立新模板
          </button>
        </div>
      </div>
      
      <div className="row">
        {/* 左側認證類型選單 */}
        <div className="col-md-3">
          <div className="search-container mb-4">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input 
              type="text" 
              className="search-input" 
              placeholder="搜尋模板"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="category-list">
            {filteredCertTemplates.map(cert => (
              <div
                key={cert.id}
                className={`template-category ${activeCert === cert.id ? 'active' : ''}`}
                onClick={() => setActiveCert(cert.id)}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div className="template-category-info">
                  <div>{cert.displayName}</div>
                </div>
                <div className="ms-2">
                  <button className="btn btn-sm btn-link p-0 me-1" title="編輯" onClick={e => { e.stopPropagation(); handleShowEditModal(cert); }}><FontAwesomeIcon icon={faEdit} /></button>
                  <button className="btn btn-sm btn-link text-danger p-0" title="刪除" onClick={e => { e.stopPropagation(); handleShowDeleteModal(cert.id); }}><FontAwesomeIcon icon={faTrash} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 右側內容區 */}
        <div className="col-md-9">
          <div className="template-detail-card">
            <h4>{activeTemplate?.displayName} 認證需求指標與文件指引</h4>
            <p className="text-muted">{activeTemplate?.description}</p>
            <h6 className="mt-4">需求指標與對應文件</h6>
            <div>
              {filteredRequirements.length > 0 ? (
                <ul className="list-group">
                  {filteredRequirements.map((req, idx) => (
                    <li key={idx} className="list-group-item">
                      <div><b>{idx + 1}. {req.text}</b></div>
                      {req.documents && req.documents.length > 0 ? (
                        <ul className="mt-2">
                          {req.documents.map((doc, didx) => (
                            <li key={didx}><b>{doc.name}</b>：{doc.description}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-muted ms-3">（無需文件）</div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-muted">無符合條件的需求指標或文件</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
      ) : (
        <div className="editor-view">
          <div className="editor-header">
            <button 
              className="btn btn-icon"
              onClick={() => setIsEditorOpen(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <TemplateEditor />
        </div>
      )}

      {/* 建立新模板彈窗 */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">建立新模板</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateTemplate}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">認證類型</label>
                    <input
                      type="text"
                      className="form-control"
                      name="certId"
                      value={newTemplateForm.certId}
                      onChange={handleNewTemplateChange}
                      placeholder="請輸入認證類型名稱，如 SMETA、C-TPAT..."
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">說明</label>
                    <textarea className="form-control" rows="2" name="description" value={newTemplateForm.description} onChange={handleNewTemplateChange} placeholder="請輸入此認證的簡介或說明" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">需求指標與對應文件</label>
                    {newTemplateForm.requirements.map((req, idx) => (
                      <div key={idx} className="border rounded p-3 mb-3 bg-light">
                        <div className="d-flex align-items-center mb-2">
                          <input
                            type="text"
                            className="form-control me-2"
                            placeholder="需求指標內容"
                            value={req.text}
                            onChange={e => handleNewRequirementChange(idx, e.target.value)}
                            required
                          />
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveRequirement(idx)} disabled={newTemplateForm.requirements.length === 1}>刪除需求指標</button>
                        </div>
                        <div className="ms-3">
                          <label className="form-label">對應文件</label>
                          {req.documents.map((doc, didx) => (
                            <div key={didx} className="d-flex align-items-center mb-2">
                              <input
                                type="text"
                                className="form-control me-2"
                                placeholder="文件名稱"
                                value={doc.name}
                                onChange={e => handleNewDocumentChange(idx, didx, 'name', e.target.value)}
                              />
                              <input
                                type="text"
                                className="form-control me-2"
                                placeholder="說明"
                                value={doc.description}
                                onChange={e => handleNewDocumentChange(idx, didx, 'description', e.target.value)}
                              />
                              <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleRemoveDocument(idx, didx)}>刪除</button>
                            </div>
                          ))}
                          <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => handleAddDocument(idx)}>新增文件</button>
                        </div>
                      </div>
                    ))}
                    <button type="button" className="btn btn-outline-success btn-sm" onClick={handleAddRequirement}>新增需求指標</button>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">即時預覽</label>
                    <ul>
                      {newTemplateForm.requirements.filter(r => r.text.trim()).map((req, idx) => (
                        <li key={idx}><b>{idx + 1}. {req.text}</b>
                          <ul>
                            {req.documents.filter(d => d.name.trim()).map((doc, didx) => <li key={didx}><b>{doc.name}</b>：{doc.description}</li>)}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>取消</button>
                  <button type="submit" className="btn btn-primary">建立</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 編輯彈窗 */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">編輯模板</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleSaveEditTemplate}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">認證類型名稱</label>
                    <input type="text" className="form-control" name="displayName" value={editTemplateForm.displayName} onChange={handleEditTemplateChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">說明</label>
                    <textarea className="form-control" name="description" value={editTemplateForm.description} onChange={handleEditTemplateChange} rows="2" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">需求指標與對應文件</label>
                    {editTemplateForm.requirements.map((req, idx) => (
                      <div key={idx} className="border rounded p-3 mb-3 bg-light">
                        <div className="d-flex align-items-center mb-2">
                          <input
                            type="text"
                            className="form-control me-2"
                            placeholder="需求指標內容"
                            value={req.text}
                            onChange={e => handleEditRequirementChange(idx, e.target.value)}
                            required
                          />
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveEditRequirement(idx)} disabled={editTemplateForm.requirements.length === 1}>刪除需求指標</button>
                        </div>
                        <div className="ms-3">
                          <label className="form-label">對應文件</label>
                          {req.documents.map((doc, didx) => (
                            <div key={didx} className="d-flex align-items-center mb-2">
                              <input
                                type="text"
                                className="form-control me-2"
                                placeholder="文件名稱"
                                value={doc.name}
                                onChange={e => handleEditDocumentChange(idx, didx, 'name', e.target.value)}
                              />
                              <input
                                type="text"
                                className="form-control me-2"
                                placeholder="說明"
                                value={doc.description}
                                onChange={e => handleEditDocumentChange(idx, didx, 'description', e.target.value)}
                              />
                              <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleRemoveEditDocument(idx, didx)}>刪除</button>
                            </div>
                          ))}
                          <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => handleAddEditDocument(idx)}>新增文件</button>
                        </div>
                      </div>
                    ))}
                    <button type="button" className="btn btn-outline-success btn-sm" onClick={handleAddEditRequirement}>新增需求指標</button>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">即時預覽</label>
                    <ul>
                      {editTemplateForm.requirements.filter(r => r.text.trim()).map((req, idx) => (
                        <li key={idx}><b>{idx + 1}. {req.text}</b>
                          <ul>
                            {req.documents.filter(d => d.name.trim()).map((doc, didx) => <li key={didx}><b>{doc.name}</b>：{doc.description}</li>)}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>取消</button>
                  <button type="submit" className="btn btn-primary">儲存</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 刪除確認彈窗 */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-danger">
                <h5 className="modal-title">確認刪除</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-danger">確定要刪除此認證類型及其所有需求指標與文件嗎？此操作無法復原。</div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>取消</button>
                <button type="button" className="btn btn-danger" onClick={handleDeleteTemplate}>確認刪除</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateCenter; 