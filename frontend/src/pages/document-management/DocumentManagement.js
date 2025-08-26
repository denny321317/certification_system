/**
 * 文件管理組件
 * 
 * 此組件提供企業認證系統的文件管理功能，包含：
 * 1. 文件夾樹狀結構導航
 * 2. 文件列表顯示（列表/網格視圖）
 * 3. 文件搜索和篩選
 * 4. 文件上傳和管理
 * 5. 文件狀態追蹤
 * 
 * 特點：
 * - 支持多種文件類型（PDF、Excel、Word、圖片等）
 * - 提供文件狀態標記（已審核、待審核、已過期）
 * - 支持文件的下載、編輯、分享和刪除操作
 * - 響應式設計，適配不同屏幕尺寸
 * 
 * 使用方式：
 * ```jsx
 * <DocumentManagement />
 * ```
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faFilter, faUpload, faFolderPlus, 
  faFolder, faFolderOpen, faFileAlt, faFilePdf, 
  faFileExcel, faFileWord, faImage, faClock, 
  faUser, faFile, faDownload, faPencilAlt, 
  faShare, faTrash, faEllipsisV
} from '@fortawesome/free-solid-svg-icons';
import { useSettings } from '../../contexts/SettingsContext';
import './DocumentManagement.css';

/**
 * 文件管理組件
 * @returns {JSX.Element} 文件管理介面
 */
const DocumentManagement = ({ canWrite }) => {
  const { settings } = useSettings();
  /**
   * 文件搜索關鍵字狀態
   * @type {[string, Function]} [搜索關鍵字, 設置搜索關鍵字的函數]
   */
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * 文件夾搜索關鍵字狀態
   * @type {[string, Function]} [文件夾搜索關鍵字, 設置文件夾搜索關鍵字的函數]
   */
  const [folderSearchQuery, setFolderSearchQuery] = useState('');

  /**
   * 視圖模式狀態（list/grid）
   * @type {[string, Function]} [當前視圖模式, 設置視圖模式的函數]
   */
  const [viewMode, setViewMode] = useState('list');

  /**
   * 排序選項狀態
   * @type {[string, Function]} [當前排序選項, 設置排序選項的函數]
   */
  const [sortOption, setSortOption] = useState('recent');

  /**
   * 處理日期格式顯示
   * @param {*} dateInput 
   * @returns 
   */
  const formatDate = (dateInput) => {
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
      };

      const formatter = new Intl.DateTimeFormat('en-US', options);
      const parts = formatter.formatToParts(date);
      
      const getPart = (partName) => parts.find(p => p.type === partName)?.value;

      const year = getPart('year');
      const month = getPart('month');
      const day = getPart('day');

      if (!year || !month || !day) {
        return date.toLocaleDateString('zh-TW', { timeZone: settings.timezone });
      }

      return settings.dateFormat
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day);

    } catch (error) {
      console.error("Error formatting date:", error);
      return new Date(dateInput).toLocaleDateString();
    }
  };

  /**
   * 根據文件類型返回對應的圖標
   * @param {string} fileType - 文件類型（pdf/excel/word/image）
   * @returns {JSX.Element} FontAwesome圖標元素
   */
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return <FontAwesomeIcon icon={faFilePdf} className="file-icon pdf" />;
      case 'excel':
        return <FontAwesomeIcon icon={faFileExcel} className="file-icon excel" />;
      case 'word':
        return <FontAwesomeIcon icon={faFileWord} className="file-icon word" />;
      case 'image':
        return <FontAwesomeIcon icon={faImage} className="file-icon image" />;
      default:
        return <FontAwesomeIcon icon={faFileAlt} className="file-icon" />;
    }
  };

  /**
   * 根據文件狀態返回對應的徽章樣式類名
   * @param {string} status - 文件狀態（approved/pending/expired）
   * @returns {string} CSS類名
   */
  const getBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'file-badge approved';
      case 'pending':
        return 'file-badge pending';
      case 'expired':
        return 'file-badge expired';
      default:
        return 'file-badge';
    }
  };

  /**
   * 根據文件狀態返回對應的狀態文字
   * @param {string} status - 文件狀態（approved/pending/expired）
   * @returns {string} 狀態文字
   */
  const getBadgeText = (status) => {
    switch (status) {
      case 'approved':
        return '已審核';
      case 'pending':
        return '待審核';
      case 'expired':
        return '已過期';
      default:
        return '未知狀態';
    }
  };

  /**
   * 文件數據列表
   * @type {Array<{
   *   id: number,        // 文件ID
   *   name: string,      // 文件名稱
   *   type: string,      // 文件類型
   *   updatedAt: string, // 更新時間
   *   updatedBy: string, // 更新人
   *   size: string,      // 文件大小
   *   status: string     // 文件狀態
   * }>}
   */
  const files = [
    {
      id: 1,
      name: 'SMETA審核報告_2023Q2',
      type: 'pdf',
      updatedAt: '2023-08-15',
      updatedBy: '王經理',
      size: '3.5 MB',
      status: 'approved'
    },
    {
      id: 2,
      name: '員工工時統計表_2023年',
      type: 'excel',
      updatedAt: '2023-09-01',
      updatedBy: '林副理',
      size: '1.2 MB',
      status: 'pending'
    },
    {
      id: 3,
      name: '環境合規政策聲明',
      type: 'word',
      updatedAt: '2023-07-20',
      updatedBy: '李總監',
      size: '0.8 MB',
      status: 'approved'
    },
    {
      id: 4,
      name: '工廠安全區域標示照片',
      type: 'image',
      updatedAt: '2023-08-25',
      updatedBy: '張工程師',
      size: '4.2 MB',
      status: 'expired'
    },
    {
      id: 5,
      name: '供應商行為準則合規聲明',
      type: 'pdf',
      updatedAt: '2023-09-05',
      updatedBy: '王經理',
      size: '1.5 MB',
      status: 'approved'
    }
  ];

  /**
   * 處理文件下載
   * @param {Object} file - 要下載的文件對象
   */
  const handleDownload = (file) => {
    // TODO: 實現文件下載邏輯
    console.log('下載文件:', file);
  };

  /**
   * 處理文件編輯
   * @param {Object} file - 要編輯的文件對象
   */
  const handleEdit = (file) => {
    // TODO: 實現文件編輯邏輯
    console.log('編輯文件:', file);
  };

  /**
   * 處理文件分享
   * @param {Object} file - 要分享的文件對象
   */
  const handleShare = (file) => {
    // TODO: 實現文件分享邏輯
    console.log('分享文件:', file);
  };

  /**
   * 處理文件刪除
   * @param {Object} file - 要刪除的文件對象
   */
  const handleDelete = (file) => {
    // TODO: 實現文件刪除邏輯
    console.log('刪除文件:', file);
  };

  return (
    <div className="document-management-container">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/document-management">文件管理</Link></li>
          <li className="breadcrumb-item"><Link to="/document-management/certification">認證文件</Link></li>
          <li className="breadcrumb-item active" aria-current="page">SMETA認證</li>
        </ol>
      </nav>
      
      <div className="header-actions">
        <h4>SMETA認證文件</h4>
        <div className="action-buttons">
          <button className="btn btn-outline">
            <FontAwesomeIcon icon={faFilter} className="me-2" />
            篩選
          </button>
          <button className="btn btn-primary" disabled={ !canWrite }>
            <FontAwesomeIcon icon={faUpload} className="me-2" />
            上傳文件
          </button>
        </div>
      </div>
      
      <div className="content-grid">
        {/* 文件夾結構 */}
        <div className="folder-tree">
          <div className="folder-actions">
            <div className="search-container">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input 
                type="text" 
                className="search-input" 
                placeholder="搜尋文件"
                value={folderSearchQuery}
                onChange={(e) => setFolderSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn btn-outline btn-sm btn-full">
              <FontAwesomeIcon icon={faFolderPlus} className="me-2" />
              新增資料夾
            </button>
          </div>
          
          <div className="folder-structure">
            <div className="folder-item">
              <FontAwesomeIcon icon={faFolder} className="folder-icon" />
              <span>所有文件</span>
            </div>
            
            <div className="folder-item">
              <FontAwesomeIcon icon={faFolderOpen} className="folder-icon" />
              <span>認證文件</span>
            </div>
            
            <div className="subfolder">
              <div className="folder-item active">
                <FontAwesomeIcon icon={faFolderOpen} className="folder-icon" />
                <span>SMETA認證</span>
              </div>
              
              <div className="subfolder">
                <div className="folder-item">
                  <FontAwesomeIcon icon={faFolder} className="folder-icon" />
                  <span>勞工權益</span>
                </div>
                
                <div className="folder-item">
                  <FontAwesomeIcon icon={faFolder} className="folder-icon" />
                  <span>環境保護</span>
                </div>
                
                <div className="folder-item">
                  <FontAwesomeIcon icon={faFolder} className="folder-icon" />
                  <span>商業道德</span>
                </div>
                
                <div className="folder-item">
                  <FontAwesomeIcon icon={faFolder} className="folder-icon" />
                  <span>健康與安全</span>
                </div>
              </div>
            </div>
            
            <div className="folder-item">
              <FontAwesomeIcon icon={faFolder} className="folder-icon" />
              <span>ISO 9001認證</span>
            </div>
            
            <div className="folder-item">
              <FontAwesomeIcon icon={faFolder} className="folder-icon" />
              <span>ISO 14001認證</span>
            </div>
            
            <div className="folder-item">
              <FontAwesomeIcon icon={faFolder} className="folder-icon" />
              <span>供應商文件</span>
            </div>
            
            <div className="folder-item">
              <FontAwesomeIcon icon={faFolder} className="folder-icon" />
              <span>內部審核報告</span>
            </div>
            
            <div className="folder-item">
              <FontAwesomeIcon icon={faFolder} className="folder-icon" />
              <span>政策文件</span>
            </div>
            
            <div className="folder-item">
              <FontAwesomeIcon icon={faFolder} className="folder-icon" />
              <span>培訓記錄</span>
            </div>
          </div>
        </div>
        
        {/* 文件列表 */}
        <div className="file-list">
          <div className="file-list-header">
            <div className="search-container file-search">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input 
                type="text" 
                className="search-input" 
                placeholder="搜尋此資料夾中的文件"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="view-options">
              <div className="view-toggle">
                <button 
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                >
                  <i className="bi bi-list"></i>
                </button>
                <button 
                  className={viewMode === 'grid' ? 'active' : ''}
                  onClick={() => setViewMode('grid')}
                >
                  <i className="bi bi-grid"></i>
                </button>
              </div>
              <select 
                className="sort-select" 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="recent">最近更新</option>
                <option value="nameAsc">名稱 (A-Z)</option>
                <option value="nameDesc">名稱 (Z-A)</option>
                <option value="size">檔案大小</option>
              </select>
            </div>
          </div>
          
          <div className={`files-container ${viewMode}`}>
            {files.map(file => (
              <div className="file-card" key={file.id}>
                <div className="file-card-content">
                  <div className="file-info">
                    {getFileIcon(file.type)}
                    <div className="file-details">
                      <div className="file-name">{file.name}</div>
                      <div className="file-meta">
                        <span>
                          <FontAwesomeIcon icon={faClock} className="me-1" />
                          更新於 {formatDate(file.updatedAt)}
                        </span>
                        <span>
                          <FontAwesomeIcon icon={faUser} className="me-1" />
                          {file.updatedBy}
                        </span>
                        <span>
                          <FontAwesomeIcon icon={faFile} className="me-1" />
                          {file.size}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="file-actions">
                    <span className={getBadgeClass(file.status)}>
                      {getBadgeText(file.status)}
                    </span>
                    <div className="dropdown">
                      <button className="btn-icon dropdown-toggle">
                        <FontAwesomeIcon icon={faEllipsisV} />
                      </button>
                      <div className="dropdown-menu">
                        <button className="dropdown-item" onClick={() => handleDownload(file)}>
                          <FontAwesomeIcon icon={faDownload} className="me-2" />
                          下載
                        </button>
                        <button className="dropdown-item" onClick={() => handleEdit(file)} disabled={ !canWrite }>
                          <FontAwesomeIcon icon={faPencilAlt} className="me-2" />
                          編輯
                        </button>
                        <button className="dropdown-item" onClick={() => handleShare(file)}>
                          <FontAwesomeIcon icon={faShare} className="me-2" />
                          分享
                        </button>
                        <div className="dropdown-divider"></div>
                        <button className="dropdown-item text-danger" onClick={() => handleDelete(file)} disabled={ !canWrite }>
                          <FontAwesomeIcon icon={faTrash} className="me-2" />
                          刪除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentManagement; 