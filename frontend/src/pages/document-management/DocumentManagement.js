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
import './DocumentManagement.css';

const DocumentManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [folderSearchQuery, setFolderSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [sortOption, setSortOption] = useState('recent');

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

  // 處理下載文件
  const handleDownload = (file) => {
    // TODO: 實現文件下載邏輯
    console.log('下載文件:', file);
  };

  // 處理編輯文件
  const handleEdit = (file) => {
    // TODO: 實現文件編輯邏輯
    console.log('編輯文件:', file);
  };

  // 處理分享文件
  const handleShare = (file) => {
    // TODO: 實現文件分享邏輯
    console.log('分享文件:', file);
  };

  // 處理刪除文件
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
          <button className="btn btn-primary">
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
                          更新於 {file.updatedAt}
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
                        <button className="dropdown-item" onClick={() => handleEdit(file)}>
                          <FontAwesomeIcon icon={faPencilAlt} className="me-2" />
                          編輯
                        </button>
                        <button className="dropdown-item" onClick={() => handleShare(file)}>
                          <FontAwesomeIcon icon={faShare} className="me-2" />
                          分享
                        </button>
                        <div className="dropdown-divider"></div>
                        <button className="dropdown-item text-danger" onClick={() => handleDelete(file)}>
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