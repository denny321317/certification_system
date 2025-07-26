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
  faSearch, faPlus, faEdit, faTrash, faSpinner, faExclamationCircle 
} from '@fortawesome/free-solid-svg-icons';
import './TemplateCenter.css';

/**
 * 模板中心組件
 * @returns {JSX.Element} 模板中心介面
 */
const TemplateCenter = ({ canWrite }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCert, setActiveCert] = useState('');
  
  // Data states
  const [certificationTemplates, setCertificationTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState('');
  
  // Form states
  const [newTemplateForm, setNewTemplateForm] = useState({
    certId: '',
    description: '',
    requirements: [ { text: '', documents: [] } ]
  });
  const [editTemplateForm, setEditTemplateForm] = useState({
    id: '',
    displayName: '',
    description: '',
    requirements: [ { text: '', documents: [] } ]
  });

  // Fetch templates from the backend
  const fetchTemplates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/templates');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCertificationTemplates(data);
      if (data.length > 0) {
        setActiveCert(activeCert || data[0].id);
      }
    } catch (e) {
      setError(e.message);
      console.error("Failed to fetch templates:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter and find active template
  const filteredCertTemplates = certificationTemplates.filter(t =>
    t.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const activeTemplate = filteredCertTemplates.find(t => t.id === activeCert) || filteredCertTemplates[0];

  const filteredRequirements = activeTemplate?.requirements?.filter(req => 
    req.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
    req.documents.some(doc => 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  ) || [];

  // Form handling for create modal
  const handleNewTemplateChange = (e) => {
    const { name, value } = e.target;
    setNewTemplateForm(prev => ({ ...prev, [name]: value }));
  };
  const handleNewRequirementChange = (idx, value) => {
    setNewTemplateForm(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === idx ? { ...req, text: value } : req)
    }));
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
    setNewTemplateForm(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => {
        if (i !== reqIdx) return req;
        return {
          ...req,
          documents: req.documents.map((doc, j) => j === docIdx ? { ...doc, [field]: value } : doc)
        };
      })
    }));
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
    setNewTemplateForm(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => {
        if (i !== reqIdx) return req;
        return { ...req, documents: req.documents.filter((_, j) => j !== docIdx) };
      })
    }));
  };

  // Form handling for edit modal
  const handleEditTemplateChange = (e) => {
    const { name, value } = e.target;
    setEditTemplateForm(prev => ({ ...prev, [name]: value }));
  };
  const handleEditRequirementChange = (idx, value) => {
    setEditTemplateForm(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === idx ? { ...req, text: value } : req)
    }));
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
    setEditTemplateForm(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => {
        if (i !== reqIdx) return req;
        return {
          ...req,
          documents: req.documents.map((doc, j) => j === docIdx ? { ...doc, [field]: value } : doc)
        };
      })
    }));
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
    setEditTemplateForm(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => {
        if (i !== reqIdx) return req;
        return { ...req, documents: req.documents.filter((_, j) => j !== docIdx) };
      })
    }));
  };

  // CRUD Operations
  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    const certId = newTemplateForm.certId.trim();
    if (!certId) return;
    
    const payload = {
      id: certId,
      displayName: certId,
      description: newTemplateForm.description,
      requirements: newTemplateForm.requirements
        .filter(r => r.text.trim())
        .map(r => ({
          ...r,
          documents: r.documents.filter(d => d.name.trim())
        }))
    };

    try {
      const response = await fetch('http://localhost:8000/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to create template');
      const newTemplate = await response.json();
      setCertificationTemplates(prev => [...prev, newTemplate]);
      setActiveCert(newTemplate.id);
      setShowCreateModal(false);
      setNewTemplateForm({ certId: '', description: '', requirements: [{ text: '', documents: [] }] });
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleShowEditModal = (cert) => {
    setEditTemplateForm({
      id: cert.id,
      displayName: cert.displayName,
      description: cert.description || '',
      requirements: cert.requirements.length ? cert.requirements.map(r => ({
        ...r,
        documents: r.documents ? r.documents.map(d => ({ ...d })) : []
      })) : [{ text: '', documents: [] }]
    });
    setShowEditModal(true);
  };
  
  const handleSaveEditTemplate = async (e) => {
    e.preventDefault();
    const { id, displayName, description, requirements } = editTemplateForm;
    const payload = {
      id,
      displayName,
      description,
      requirements: requirements
        .filter(r => r.text.trim())
        .map(r => ({
          ...r,
          documents: r.documents.filter(d => d.name.trim())
        }))
    };
    
    try {
      const response = await fetch(`http://localhost:8000/api/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to update template');
      const updatedTemplate = await response.json();
      setCertificationTemplates(prev => prev.map(t => t.id === id ? updatedTemplate : t));
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleShowDeleteModal = (id) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteTemplate = async () => {
    if (!deleteTargetId) return;
    try {
      const response = await fetch(`http://localhost:8000/api/templates/${deleteTargetId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete template');
      
      const newTemplates = certificationTemplates.filter(t => t.id !== deleteTargetId);
      setCertificationTemplates(newTemplates);

      if (activeCert === deleteTargetId) {
        setActiveCert(newTemplates[0]?.id || '');
      }
      
      setShowDeleteModal(false);
      setDeleteTargetId('');
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // Reset create form when modal opens
  useEffect(() => {
    if (showCreateModal) {
      setNewTemplateForm({ certId: '', description: '', requirements: [{ text: '', documents: [] }] });
    }
  }, [showCreateModal]);

  return (
    <div className="template-center-container">
      <div className="header-actions">
        <h4>模板中心</h4>
        <div className="action-buttons">
          <div className="search-container">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input 
              type="text" 
              className="search-input" 
              placeholder="搜尋模板"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
            disabled={!canWrite}
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            建立新模板
          </button>
        </div>
      </div>
      
      <div className="row">
        {/* Left panel */}
        <div className="col-md-3">
          <div className="category-list">
            {isLoading ? (
              <div className="text-center p-3">
                <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                <p>載入中...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger">
                <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
                {error}
              </div>
            ) : (
              filteredCertTemplates.length > 0 ? (
                filteredCertTemplates.map(cert => (
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
                      <button className="btn btn-sm btn-link p-0 me-1" title="編輯" onClick={e => { e.stopPropagation(); handleShowEditModal(cert); }} disabled={!canWrite}><FontAwesomeIcon icon={faEdit} /></button>
                      <button className="btn btn-sm btn-link text-danger p-0" title="刪除" onClick={e => { e.stopPropagation(); handleShowDeleteModal(cert.id); }} disabled={!canWrite}><FontAwesomeIcon icon={faTrash} /></button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted p-3">
                  沒有可用的模板。
                </div>
              )
            )}
          </div>
        </div>
        
        {/* Right panel */}
        <div className="col-md-9">
          {activeTemplate ? (
            <div className="template-detail-card">
              <h4>{activeTemplate.displayName} 認證需求指標與文件指引</h4>
              <p className="text-muted">{activeTemplate.description}</p>
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
          ) : !isLoading && (
             <div className="text-center p-5">請先建立或選擇一個模板</div>
          )}
        </div>
      </div>

      {/* Create Modal */}
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

      {/* Edit Modal */}
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

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">確認刪除</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>確定要刪除此認證類型及其所有需求指標與文件嗎？</p>
                <div className="alert alert-danger">此操作無法復原。</div>
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

/*
// =================================================================
// PREVIOUS STATIC DATA (FOR REFERENCE)
// =================================================================

// This was the main data structure used for templates before API integration.
const staticCertificationTemplates = [
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

// Original client-side CRUD handlers
const handleCreateTemplate_Static = (e, newTemplateForm, certificationTemplates, setNewTemplateForm, setShowCreateModal) => {
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

const handleSaveEditTemplate_Static = (e, editTemplateForm, certificationTemplates, setShowEditModal) => {
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

const handleDeleteTemplate_Static = (deleteTargetId, certificationTemplates, activeCert, setActiveCert, setShowDeleteModal, setDeleteTargetId) => {
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
*/ 