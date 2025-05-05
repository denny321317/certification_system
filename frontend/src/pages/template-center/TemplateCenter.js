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

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faFilter, faPlus, faThLarge, faCheckCircle, 
  faAward, faBuilding, faIdBadge, faBolt, faPlusCircle,
  faFileAlt, faFileExcel, faFileWord, faFilePdf, faClock,
  faTimes
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

  return (
    <div className="template-center-container">
      {!isEditorOpen ? (
        <>
          <div className="header-actions">
            <h4>模板中心</h4>
            <div className="action-buttons">
              <button className="btn btn-outline">
                <FontAwesomeIcon icon={faFilter} className="me-2" />
                篩選
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => setIsEditorOpen(true)}
              >
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                建立新模板
              </button>
            </div>
          </div>
          
          <div className="row">
            {/* 左側分類列表 */}
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
                {categories.map(category => (
                  <div 
                    className={`template-category ${activeCategory === category.id ? 'active' : ''}`}
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    <div className="template-category-icon">
                      <FontAwesomeIcon icon={category.icon} />
                    </div>
                    <div className="template-category-info">
                      <div>{category.name}</div>
                      <div className="template-category-count">{category.count} 個模板</div>
                    </div>
                  </div>
                ))}
                
                <div className="mt-4">
                  <button className="btn btn-outline btn-full">
                    <FontAwesomeIcon icon={faPlusCircle} className="me-2" />
                    新增分類
                  </button>
                </div>
              </div>
            </div>
            
            {/* 右側模板列表 */}
            <div className="col-md-9">
              <div className="templates-header">
                <h5>
                  {activeCategory === 'all' 
                    ? '所有模板' 
                    : categories.find(c => c.id === activeCategory)?.name} 
                  ({filteredTemplates.length})
                </h5>
                <div className="sort-options">
                  <select 
                    className="sort-select" 
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="recent">最近更新</option>
                    <option value="frequency">使用頻率</option>
                    <option value="nameAsc">名稱 (A-Z)</option>
                    <option value="nameDesc">名稱 (Z-A)</option>
                  </select>
                </div>
              </div>
              
              <div className="template-grid">
                {sortedTemplates.map(template => (
                  <div className="template-card" key={template.id}>
                    <div className="template-preview">
                      {getTemplateIcon(template.type)}
                    </div>
                    <div className="template-info">
                      <h6 className="template-title">{template.name}</h6>
                      <div className="template-tags">
                        {template.tags.map((tag, index) => (
                          <span className="template-tag" key={index}>{tag}</span>
                        ))}
                      </div>
                      <div className="template-meta">
                        <span className="template-date">
                          <FontAwesomeIcon icon={faClock} className="me-1" />
                          {template.updatedAt}
                        </span>
                        <div>
                          <button className="btn btn-sm btn-outline-primary">使用</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pagination-container">
                <nav aria-label="模板分頁">
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
    </div>
  );
};

export default TemplateCenter; 