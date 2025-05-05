/**
 * 認證項目詳情頁面
 * 
 * 此組件顯示特定認證項目的詳細資訊，包含項目基本信息、進度追蹤、文件管理、審核與回饋等功能。
 * 
 * 特點:
 * - 項目基本信息和時間線展示
 * - 團隊成員與職責管理
 * - 進度與里程碑追蹤
 * - 文件管理與上傳
 * - 審核與回饋系統
 * - 操作歷史記錄
 * 
 * 使用方式:
 * ```jsx
 * <CertificationProjectDetail projectId={1} />
 * ```
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, faClock, faFileAlt, faUsers, faCheckCircle, 
  faExclamationTriangle, faEdit, faHistory, faComments, faUpload, faClipboardCheck,
  faSearch, faFilter, faDownload, faTimes, faFolder, faFilePdf, 
  faFileWord, faFileExcel, faFileImage, faFile, faSortAmountDown, faSortAmountUp, faPlus,
  faChevronLeft, faChevronRight, faEllipsisH, faFileDownload, faCog, faTrashAlt,
  faProjectDiagram, faFileExport, faInfoCircle, faSave, faTrash
} from '@fortawesome/free-solid-svg-icons';
import './CertificationProjectDetail.css';

// 引入審核與回饋組件
import ReviewFeedback from '../../components/certification-projects/ReviewFeedback';

/**
 * 認證項目詳情頁面
 * @returns {JSX.Element} 認證項目詳情頁面
 */
const CertificationProjectDetail = () => {
  // 從URL獲取項目ID
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  /**
   * 當前選中的頁籤狀態
   * @type {[string, Function]} [當前頁籤, 設置當前頁籤的函數]
   */
  const [activeTab, setActiveTab] = useState('overview');
  
  /**
   * 項目詳細信息狀態
   * @type {[Object, Function]} [項目詳情, 設置項目詳情的函數]
   */
  const [projectDetail, setProjectDetail] = useState(null);
  
  /**
   * 加載狀態
   * @type {[boolean, Function]} [是否加載中, 設置加載狀態的函數]
   */
  const [loading, setLoading] = useState(true);

  /**
   * 文件分類狀態
   * @type {[string, Function]} [當前選中的文件分類, 設置當前文件分類的函數]
   */
  const [activeDocCategory, setActiveDocCategory] = useState('all');

  /**
   * 搜索關鍵字狀態
   * @type {[string, Function]} [搜索關鍵字, 設置搜索關鍵字的函數]
   */
  const [docSearchQuery, setDocSearchQuery] = useState('');

  /**
   * 排序方式狀態
   * @type {[string, Function]} [排序方式, 設置排序方式的函數]
   */
  const [docSortBy, setDocSortBy] = useState('uploadDate');

  /**
   * 排序順序狀態
   * @type {[boolean, Function]} [是否降序排列, 設置排序順序的函數]
   */
  const [docSortDesc, setDocSortDesc] = useState(true);

  /**
   * 顯示上傳對話框狀態
   * @type {[boolean, Function]} [是否顯示上傳對話框, 設置上傳對話框顯示狀態的函數]
   */
  const [showUploadModal, setShowUploadModal] = useState(false);

  /**
   * 顯示新增類別對話框狀態
   * @type {[boolean, Function]} [是否顯示新增類別對話框, 設置新增類別對話框顯示狀態的函數]
   */
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  /**
   * 新增類別的表單數據
   * @type {[Object, Function]} [新增類別的表單數據, 設置新增類別表單數據的函數]
   */
  const [newCategoryForm, setNewCategoryForm] = useState({
    id: '',
    name: ''
  });

  /**
   * 文件類別列表狀態
   * @type {[Array<{id: string, name: string, icon: any}>, Function]} [文件類別列表, 設置文件類別列表的函數]
   */
  const [documentCategories, setDocumentCategories] = useState([
    { id: 'all', name: '全部文件', icon: faFolder },
    { id: 'plan', name: '計劃文件', icon: faFileAlt },
    { id: 'audit', name: '審核文件', icon: faClipboardCheck },
    { id: 'policy', name: '政策文件', icon: faFilePdf },
    { id: 'procedure', name: '程序文件', icon: faFileWord },
    { id: 'record', name: '記錄文件', icon: faFileExcel },
    { id: 'certificate', name: '證書文件', icon: faFileImage },
    { id: 'other', name: '其他文件', icon: faFile }
  ]);

  /**
   * 上傳文件表單數據
   * @type {[Object, Function]} [上傳文件表單數據, 設置上傳文件表單數據的函數]
   */
  const [uploadForm, setUploadForm] = useState({
    fileName: '',
    category: '',
    description: ''
  });

  /**
   * 項目狀態選項
   * @type {Array<{value: string, label: string}>}
   */
  const statusOptions = [
    { value: 'preparing', label: '準備中' },
    { value: 'internal-review', label: '內部審核中' },
    { value: 'external-review', label: '外部審核中' },
    { value: 'completed', label: '已完成' }
  ];

  /**
   * 文件分頁狀態
   * @type {[number, Function]} [當前頁碼, 設置頁碼的函數]
   */
  const [currentDocPage, setCurrentDocPage] = useState(1);

  /**
   * 每頁顯示文件數量
   * @type {number}
   */
  const DOCS_PER_PAGE = 12;

  /**
   * 顯示編輯項目信息對話框狀態
   * @type {[boolean, Function]} [是否顯示編輯項目信息對話框, 設置編輯項目信息對話框顯示狀態的函數]
   */
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  
  /**
   * 顯示刪除項目確認對話框狀態
   * @type {[boolean, Function]} [是否顯示刪除項目確認對話框, 設置刪除項目確認對話框顯示狀態的函數]
   */
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  
  /**
   * 顯示匯出報告對話框狀態
   * @type {[boolean, Function]} [是否顯示匯出報告對話框, 設置匯出報告對話框顯示狀態的函數]
   */
  const [showExportReportModal, setShowExportReportModal] = useState(false);
  
  /**
   * 編輯項目信息表單數據
   * @type {[Object, Function]} [編輯項目信息表單數據, 設置編輯項目信息表單數據的函數]
   */
  const [editProjectForm, setEditProjectForm] = useState({
    name: '',
    status: '',
    startDate: '',
    endDate: '',
    manager: '',
    agency: '',
    description: ''
  });

  /**
   * 匯出報告設置
   * @type {[Object, Function]} [匯出報告設置, 設置匯出報告設置的函數]
   */
  const [exportSettings, setExportSettings] = useState({
    format: 'pdf',
    includeBasicInfo: true,
    includeTeamInfo: true,
    includeDocuments: true,
    includeReviews: true,
    includeHistory: true
  });

  // 當文件篩選條件變更時，重置頁碼為1
  useEffect(() => {
    setCurrentDocPage(1);
  }, [activeDocCategory, docSearchQuery, docSortBy, docSortDesc]);

  /**
   * 處理文件頁碼變更
   * @param {number} pageNumber - 新的頁碼
   */
  const handleDocPageChange = (pageNumber) => {
    setCurrentDocPage(pageNumber);
    // 如果有捲動容器，捲動回頂部
    const contentContainer = document.querySelector('.documents-content');
    if (contentContainer) {
      contentContainer.scrollTop = 0;
    }
  };

  // 模擬從API獲取項目詳情
  useEffect(() => {
    // 模擬API調用延遲
    const timer = setTimeout(() => {
      // 項目詳情模擬數據
      const mockProjectDetail = {
        id: parseInt(projectId),
        name: 'SMETA 4支柱認證',
        status: 'internal-review',
        startDate: '2023-07-15',
        endDate: '2023-10-30',
        manager: '王經理',
        agency: 'SGS Taiwan',
        progress: 75,
        progressColor: 'primary',
        description: '遵循Sedex會員道德貿易審核(SMETA)標準進行社會責任審核，包含勞工標準、健康與安全、環境與商業道德四大支柱。',
        team: [
          { name: '王經理', role: '項目負責人', email: 'wang@example.com' },
          { name: '陳專員', role: '文件管理', email: 'chen@example.com' },
          { name: '林工程師', role: '環保負責人', email: 'lin@example.com' },
          { name: '張協理', role: '人資負責人', email: 'zhang@example.com' }
        ],
        timeline: [
          {
            stage: '準備階段',
            status: 'completed',
            date: '2023-08-15',
            description: '完成團隊組建、資源分配和初步資料收集'
          },
          {
            stage: '自我評估',
            status: 'completed',
            date: '2023-09-10',
            description: '根據SMETA標準完成內部評估和差距分析'
          },
          {
            stage: '文件準備',
            status: 'current',
            date: '進行中',
            description: '收集和整理所有必要的證明文件',
            tasks: [
              { id: 1, name: '更新勞工權益政策文件', completed: true },
              { id: 2, name: '完成健康安全管理程序書', completed: true },
              { id: 3, name: '準備最近6個月的工時記錄', completed: false },
              { id: 4, name: '更新環境管理計劃', completed: false }
            ]
          },
          {
            stage: '預備審核',
            status: 'pending',
            date: '預計 2023-10-15',
            description: '內部團隊進行最終審核準備'
          },
          {
            stage: '正式審核',
            status: 'pending',
            date: '預計 2023-10-25',
            description: '外部審核機構現場審核'
          }
        ],
        documents: [
          { id: 1, name: '項目計劃書.pdf', category: 'plan', type: 'pdf', uploadedBy: '王經理', uploadDate: '2023-07-16', description: '包含專案時程、目標、團隊組成和主要里程碑' },
          { id: 2, name: 'SMETA自我評估問卷.xlsx', category: 'audit', type: 'excel', uploadedBy: '陳專員', uploadDate: '2023-08-20', description: '依照SMETA審核範圍進行的內部自我評估結果' },
          { id: 3, name: '勞工權益政策聲明.pdf', category: 'policy', type: 'pdf', uploadedBy: '張協理', uploadDate: '2023-09-05', description: '公司勞工權益保障政策與遵循承諾' },
          { id: 4, name: '環境管理程序.docx', category: 'procedure', type: 'word', uploadedBy: '林工程師', uploadDate: '2023-09-12', description: '廢棄物管理與處理程序文件' },
          { id: 5, name: '員工工時記錄範本.xlsx', category: 'record', type: 'excel', uploadedBy: '張協理', uploadDate: '2023-08-25', description: '員工工時記錄檔案格式' },
          { id: 6, name: '健康安全風險評估.pdf', category: 'audit', type: 'pdf', uploadedBy: '林工程師', uploadDate: '2023-09-08', description: '現場作業安全風險評估報告' },
          { id: 7, name: '供應商行為準則.pdf', category: 'policy', type: 'pdf', uploadedBy: '王經理', uploadDate: '2023-07-18', description: '對供應商的社會責任要求與規範' },
          { id: 8, name: '上次審核發現改善項目追蹤.xlsx', category: 'record', type: 'excel', uploadedBy: '陳專員', uploadDate: '2023-08-14', description: '針對先前審核中發現問題的改善狀況追蹤表' },
          { id: 9, name: 'ISO 14001認證證書.jpg', category: 'certificate', type: 'image', uploadedBy: '王經理', uploadDate: '2023-07-20', description: '企業取得的環境管理系統認證證書' },
          { id: 10, name: '商業道德政策.pdf', category: 'policy', type: 'pdf', uploadedBy: '張協理', uploadDate: '2023-09-01', description: '企業商業道德與反貪腐相關政策' },
          { id: 11, name: '審核預備會議紀錄.docx', category: 'record', type: 'word', uploadedBy: '陳專員', uploadDate: '2023-09-15', description: '審核前會議討論事項與分工內容' },
          { id: 12, name: '教育訓練記錄.xlsx', category: 'record', type: 'excel', uploadedBy: '林工程師', uploadDate: '2023-08-30', description: '員工教育訓練參與記錄與評估結果' },
          { id: 13, name: '2023年Q1員工出勤記錄.xlsx', category: 'record', type: 'excel', uploadedBy: '張協理', uploadDate: '2023-04-10', description: '第一季度員工出勤統計資料' },
          { id: 14, name: '2023年Q2員工出勤記錄.xlsx', category: 'record', type: 'excel', uploadedBy: '張協理', uploadDate: '2023-07-10', description: '第二季度員工出勤統計資料' },
          { id: 15, name: '工廠水電使用記錄2023Q1.xlsx', category: 'record', type: 'excel', uploadedBy: '林工程師', uploadDate: '2023-04-05', description: '第一季度工廠能源使用統計' },
          { id: 16, name: '工廠水電使用記錄2023Q2.xlsx', category: 'record', type: 'excel', uploadedBy: '林工程師', uploadDate: '2023-07-05', description: '第二季度工廠能源使用統計' },
          { id: 17, name: '年度安全演習紀錄.docx', category: 'record', type: 'word', uploadedBy: '林工程師', uploadDate: '2023-06-20', description: '年度消防與安全疏散演習報告' },
          { id: 18, name: '員工滿意度調查結果.xlsx', category: 'record', type: 'excel', uploadedBy: '張協理', uploadDate: '2023-05-15', description: '年度員工工作環境與福利滿意度調查' },
          { id: 19, name: '供應商評估記錄2023上半年.xlsx', category: 'record', type: 'excel', uploadedBy: '王經理', uploadDate: '2023-07-25', description: '主要供應商社會責任表現評估' },
          { id: 20, name: '環境監測報告2023Q1.pdf', category: 'record', type: 'pdf', uploadedBy: '林工程師', uploadDate: '2023-04-20', description: '第一季度廠區環境監測數據報告' },
          { id: 21, name: '環境監測報告2023Q2.pdf', category: 'record', type: 'pdf', uploadedBy: '林工程師', uploadDate: '2023-07-20', description: '第二季度廠區環境監測數據報告' },
          { id: 22, name: '職業健康檢查記錄.xlsx', category: 'record', type: 'excel', uploadedBy: '張協理', uploadDate: '2023-03-30', description: '年度員工健康檢查統計資料' },
          { id: 23, name: '內部稽核紀錄-勞工標準.docx', category: 'record', type: 'word', uploadedBy: '陳專員', uploadDate: '2023-08-05', description: '勞工標準項目內部稽核發現與建議' },
          { id: 24, name: '內部稽核紀錄-健康安全.docx', category: 'record', type: 'word', uploadedBy: '陳專員', uploadDate: '2023-08-06', description: '健康安全項目內部稽核發現與建議' },
          { id: 25, name: '內部稽核紀錄-環境.docx', category: 'record', type: 'word', uploadedBy: '陳專員', uploadDate: '2023-08-07', description: '環境管理項目內部稽核發現與建議' },
          { id: 26, name: '內部稽核紀錄-商業道德.docx', category: 'record', type: 'word', uploadedBy: '陳專員', uploadDate: '2023-08-08', description: '商業道德項目內部稽核發現與建議' },
          { id: 27, name: '員工申訴處理記錄.xlsx', category: 'record', type: 'excel', uploadedBy: '張協理', uploadDate: '2023-08-12', description: '員工申訴案件處理與改善追蹤' },
          { id: 28, name: '工作環境改善計劃執行記錄.xlsx', category: 'record', type: 'excel', uploadedBy: '林工程師', uploadDate: '2023-08-28', description: '工作場所安全與舒適度改善專案執行狀況' }
        ]
      };
      
      setProjectDetail(mockProjectDetail);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [projectId]);

  /**
   * 根據項目狀態返回對應的狀態標籤元素
   * @param {string} status - 項目狀態
   * @returns {JSX.Element|null} 狀態標籤元素
   */
  const getStatusBadge = (status) => {
    switch (status) {
      case 'preparing':
        return (
          <div className="status-badge preparing">
            <FontAwesomeIcon icon={faUpload} className="me-1" />
            準備中
          </div>
        );
      case 'internal-review':
        return (
          <div className="status-badge internal-review">
            <FontAwesomeIcon icon={faClipboardCheck} className="me-1" />
            內部審核中
          </div>
        );
      case 'external-review':
        return (
          <div className="status-badge external-review">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" />
            外部審核中
          </div>
        );
      case 'completed':
        return (
          <div className="status-badge completed">
            <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
            已完成
          </div>
        );
      default:
        return null;
    }
  };

  /**
   * 根據時間線階段狀態返回對應的圖標
   * @param {string} status - 階段狀態（completed/current/pending）
   * @returns {JSX.Element} FontAwesome圖標元素
   */
  const getTimelineIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FontAwesomeIcon icon={faCheckCircle} className="text-success" />;
      case 'current':
        return <FontAwesomeIcon icon={faClock} className="text-primary" />;
      case 'pending':
      default:
        return <FontAwesomeIcon icon={faExclamationTriangle} className="text-muted" />;
    }
  };

  /**
   * 處理返回至項目列表頁面
   */
  const handleBack = () => {
    navigate('/certification-projects');
  };

  /**
   * 處理文件分類切換
   * @param {string} category - 文件分類ID
   */
  const handleCategoryChange = (category) => {
    setActiveDocCategory(category);
  };

  /**
   * 處理文件搜索
   * @param {Event} e - 事件對象
   */
  const handleDocSearch = (e) => {
    setDocSearchQuery(e.target.value);
  };

  /**
   * 處理文件排序方式變更
   * @param {string} sortKey - 排序字段
   */
  const handleSortChange = (sortKey) => {
    if (docSortBy === sortKey) {
      setDocSortDesc(!docSortDesc);
    } else {
      setDocSortBy(sortKey);
      setDocSortDesc(true);
    }
  };

  /**
   * 處理顯示上傳文件對話框
   */
  const handleShowUploadModal = () => {
    setUploadForm({
      fileName: '',
      category: 'plan',
      description: ''
    });
    setShowUploadModal(true);
  };

  /**
   * 處理關閉上傳文件對話框
   */
  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
  };

  /**
   * 處理上傳文件表單變更
   * @param {Event} e - 事件對象
   */
  const handleUploadFormChange = (e) => {
    const { name, value } = e.target;
    setUploadForm({
      ...uploadForm,
      [name]: value
    });
  };

  /**
   * 處理上傳文件
   * @param {Event} e - 事件對象
   */
  const handleUploadFile = (e) => {
    e.preventDefault();
    // 在實際應用中，這裡應該有文件上傳API調用
    console.log('上傳文件:', uploadForm);
    
    // 模擬上傳成功後添加到文件列表
    const newDoc = {
      id: projectDetail.documents.length + 1,
      name: uploadForm.fileName,
      category: uploadForm.category,
      type: uploadForm.fileName.split('.').pop().toLowerCase(),
      uploadedBy: '當前用戶',
      uploadDate: new Date().toISOString().split('T')[0],
      description: uploadForm.description
    };
    
    setProjectDetail({
      ...projectDetail,
      documents: [...projectDetail.documents, newDoc]
    });
    
    setShowUploadModal(false);
    alert('文件上傳成功');
  };

  /**
   * 獲取文件圖標
   * @param {string} type - 文件類型
   * @returns {JSX.Element} FontAwesome圖標元素
   */
  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FontAwesomeIcon icon={faFilePdf} className="file-icon file-icon-pdf" />;
      case 'word':
      case 'docx':
      case 'doc':
        return <FontAwesomeIcon icon={faFileWord} className="file-icon file-icon-word" />;
      case 'excel':
      case 'xlsx':
      case 'xls':
        return <FontAwesomeIcon icon={faFileExcel} className="file-icon file-icon-excel" />;
      case 'image':
      case 'jpg':
      case 'png':
      case 'jpeg':
        return <FontAwesomeIcon icon={faFileImage} className="file-icon file-icon-image" />;
      default:
        return <FontAwesomeIcon icon={faFile} className="file-icon" />;
    }
  };
  
  /**
   * 過濾並排序文件
   * @returns {Array} 過濾和排序後的文件列表
   */
  const getFilteredDocuments = () => {
    if (!projectDetail || !projectDetail.documents) return [];
    
    let filtered = [...projectDetail.documents];
    
    // 分類過濾
    if (activeDocCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === activeDocCategory);
    }
    
    // 關鍵字搜索
    if (docSearchQuery) {
      const lowerCaseQuery = docSearchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(lowerCaseQuery) || 
        doc.description.toLowerCase().includes(lowerCaseQuery) ||
        doc.uploadedBy.toLowerCase().includes(lowerCaseQuery)
      );
    }
    
    // 排序
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (docSortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'uploadedBy':
          comparison = a.uploadedBy.localeCompare(b.uploadedBy);
          break;
        case 'uploadDate':
        default:
          comparison = new Date(a.uploadDate) - new Date(b.uploadDate);
          break;
      }
      return docSortDesc ? -comparison : comparison;
    });
    
    return filtered;
  };

  /**
   * 按分類分組文件
   * @param {Array} documents - 文件列表
   * @returns {Object} 分類分組後的文件
   */
  const getDocumentsByCategory = (documents) => {
    const grouped = {};
    
    documentCategories.forEach(category => {
      if (category.id !== 'all') {
        grouped[category.id] = documents.filter(doc => doc.category === category.id);
      }
    });
    
    return grouped;
  };

  /**
   * 處理顯示新增類別對話框
   */
  const handleShowAddCategoryModal = () => {
    setNewCategoryForm({
      id: '',
      name: ''
    });
    setShowAddCategoryModal(true);
  };

  /**
   * 處理關閉新增類別對話框
   */
  const handleCloseAddCategoryModal = () => {
    setShowAddCategoryModal(false);
  };

  /**
   * 處理新增類別表單變更
   * @param {Event} e - 事件對象
   */
  const handleNewCategoryFormChange = (e) => {
    const { name, value } = e.target;
    setNewCategoryForm({
      ...newCategoryForm,
      [name]: value,
      // 如果修改名稱，自動生成ID（轉換為小寫，移除空格）
      ...(name === 'name' ? { id: value.toLowerCase().replace(/\s+/g, '-') } : {})
    });
  };

  /**
   * 處理新增類別
   * @param {Event} e - 事件對象
   */
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategoryForm.id && newCategoryForm.name) {
      const newCategory = {
        id: newCategoryForm.id,
        name: newCategoryForm.name,
        icon: faFile // 默認使用一般文件圖標
      };
      
      // 更新類別列表
      setDocumentCategories([...documentCategories, newCategory]);
      
      // 關閉對話框
      setShowAddCategoryModal(false);
      
      // 通知用戶成功新增
      alert(`已成功新增『${newCategoryForm.name}』類別`);
    }
  };

  /**
   * 獲取當前頁面的文件
   * @param {Array} documents - 文件列表
   * @returns {Array} 當前頁的文件
   */
  const getPaginatedDocuments = (documents) => {
    const startIndex = (currentDocPage - 1) * DOCS_PER_PAGE;
    return documents.slice(startIndex, startIndex + DOCS_PER_PAGE);
  };

  /**
   * 生成分頁控制元件
   * @param {number} totalItems - 總文件數
   * @returns {JSX.Element} 分頁控制元件
   */
  const renderPagination = (totalItems) => {
    const totalPages = Math.ceil(totalItems / DOCS_PER_PAGE);
    
    if (totalPages <= 1) return null;
    
    // 根據當前頁計算要顯示的頁碼範圍
    let startPage = Math.max(1, currentDocPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // 確保總是顯示5個頁碼（如果總頁數足夠）
    if (endPage - startPage < 4 && totalPages > 5) {
      if (startPage === 1) {
        endPage = startPage + 4;
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - 4);
      }
    }
    
    const pages = [];
    
    // 前一頁按鈕
    pages.push(
      <button
        key="prev"
        className={`pagination-btn ${currentDocPage === 1 ? 'disabled' : ''}`}
        onClick={() => currentDocPage > 1 && handleDocPageChange(currentDocPage - 1)}
        disabled={currentDocPage === 1}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
    );
    
    // 第一頁按鈕（如果當前不是從第一頁開始顯示）
    if (startPage > 1) {
      pages.push(
        <button
          key="1"
          className={`pagination-btn ${currentDocPage === 1 ? 'active' : ''}`}
          onClick={() => handleDocPageChange(1)}
        >
          1
        </button>
      );
      
      // 省略號（如果第一頁和起始頁不相鄰）
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="pagination-ellipsis">
            <FontAwesomeIcon icon={faEllipsisH} />
          </span>
        );
      }
    }
    
    // 頁碼按鈕
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${currentDocPage === i ? 'active' : ''}`}
          onClick={() => handleDocPageChange(i)}
        >
          {i}
        </button>
      );
    }
    
    // 省略號和最後一頁（如果最後一頁不在結束頁範圍內）
    if (endPage < totalPages) {
      // 省略號（如果結束頁和最後一頁不相鄰）
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="pagination-ellipsis">
            <FontAwesomeIcon icon={faEllipsisH} />
          </span>
        );
      }
      
      // 最後一頁按鈕
      pages.push(
        <button
          key={totalPages}
          className={`pagination-btn ${currentDocPage === totalPages ? 'active' : ''}`}
          onClick={() => handleDocPageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }
    
    // 下一頁按鈕
    pages.push(
      <button
        key="next"
        className={`pagination-btn ${currentDocPage === totalPages ? 'disabled' : ''}`}
        onClick={() => currentDocPage < totalPages && handleDocPageChange(currentDocPage + 1)}
        disabled={currentDocPage === totalPages}
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    );
    
    return (
      <div className="pagination-container">
        <div className="pagination-info">
          顯示 {Math.min((currentDocPage - 1) * DOCS_PER_PAGE + 1, totalItems)} - {Math.min(currentDocPage * DOCS_PER_PAGE, totalItems)} 個項目，共 {totalItems} 個項目
        </div>
        <div className="pagination-controls">
          {pages}
        </div>
      </div>
    );
  };

  /**
   * 處理批量下載當前分類的全部文件
   * @param {string} category - 文件分類ID
   */
  const handleBatchDownload = (category) => {
    // 在實際應用中，這裡應該調用後端API進行批量下載
    // 模擬下載過程
    const categoryName = documentCategories.find(c => c.id === category)?.name || '所選文件';
    const categoryFiles = projectDetail.documents.filter(doc => 
      category === 'all' || doc.category === category
    );
    
    if (categoryFiles.length === 0) {
      alert('沒有可下載的文件');
      return;
    }
    
    alert(`正在準備下載${categoryFiles.length}個${categoryName}，請稍候...`);
    console.log('下載文件列表:', categoryFiles.map(doc => doc.name).join(', '));
    
    // 如果是實際應用，可以使用以下程式碼創建一個下載任務
    // const downloadUrl = `/api/projects/${projectId}/documents/download?category=${category}`;
    // window.location.href = downloadUrl;
  };

  /**
   * 顯示編輯項目信息對話框
   */
  const handleShowEditProjectModal = () => {
    if (projectDetail) {
      setEditProjectForm({
        name: projectDetail.name,
        status: projectDetail.status,
        startDate: projectDetail.startDate,
        endDate: projectDetail.endDate,
        manager: projectDetail.manager,
        agency: projectDetail.agency,
        description: projectDetail.description
      });
      setShowEditProjectModal(true);
    }
  };

  /**
   * 關閉編輯項目信息對話框
   */
  const handleCloseEditProjectModal = () => {
    setShowEditProjectModal(false);
  };

  /**
   * 處理編輯項目表單變更
   * @param {Event} e - 事件對象
   */
  const handleEditProjectFormChange = (e) => {
    const { name, value } = e.target;
    setEditProjectForm({
      ...editProjectForm,
      [name]: value
    });
  };

  /**
   * 處理編輯項目表單提交
   * @param {Event} e - 事件對象
   */
  const handleUpdateProject = (e) => {
    e.preventDefault();
    // 在實際應用中，這裡應該有API調用來更新項目資料
    
    // 模擬更新項目資料
    setProjectDetail({
      ...projectDetail,
      ...editProjectForm
    });
    
    setShowEditProjectModal(false);
    alert('項目資料已更新');
  };

  /**
   * 顯示刪除項目確認對話框
   */
  const handleShowDeleteConfirmModal = () => {
    setShowDeleteConfirmModal(true);
  };

  /**
   * 關閉刪除項目確認對話框
   */
  const handleCloseDeleteConfirmModal = () => {
    setShowDeleteConfirmModal(false);
  };

  /**
   * 處理刪除項目
   */
  const handleDeleteProject = () => {
    // 在實際應用中，這裡應該有API調用來刪除項目
    
    // 模擬刪除成功後返回項目列表頁面
    navigate('/certification-projects');
    alert('項目已刪除');
  };

  /**
   * 顯示匯出報告對話框
   */
  const handleShowExportReportModal = () => {
    setShowExportReportModal(true);
  };

  /**
   * 關閉匯出報告對話框
   */
  const handleCloseExportReportModal = () => {
    setShowExportReportModal(false);
  };

  /**
   * 處理匯出設置變更
   * @param {Event} e - 事件對象
   */
  const handleExportSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExportSettings({
      ...exportSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  /**
   * 處理匯出報告
   */
  const handleExportReport = () => {
    // 在實際應用中，這裡應該有API調用來匯出報告
    console.log('匯出報告設置:', exportSettings);
    
    // 模擬匯出報告
    alert(`報告已匯出為${exportSettings.format.toUpperCase()}格式`);
    setShowExportReportModal(false);
  };

  /**
   * 渲染頁面主要內容
   * @returns {JSX.Element} 頁面主要內容
   */
  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">載入中...</span>
          </div>
        </div>
      );
    }

    if (!projectDetail) {
      return <div className="alert alert-danger">找不到指定的項目</div>;
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div className="project-overview">
            <div className="project-description">
              <h5>項目描述</h5>
              <p>{projectDetail.description}</p>
            </div>
            
            <div className="project-status-section">
              <div className="status-header">
                <h5>項目狀態</h5>
              </div>
              
              <div className="status-content">
                <div className="current-status">
                  {getStatusBadge(projectDetail.status)}
                  <div className="status-description">
                    {projectDetail.status === 'preparing' && '團隊正在準備認證所需的文件和流程。'}
                    {projectDetail.status === 'internal-review' && '內部團隊正在進行審核，找出需要改善的地方。'}
                    {projectDetail.status === 'external-review' && '外部認證機構正在進行正式審核。'}
                    {projectDetail.status === 'completed' && '認證已完成，已取得認證證書。'}
                  </div>
                </div>
              </div>
              
              <div className="status-impact">
                <h6>狀態說明</h6>
                <div className="status-details">
                  <div className="status-detail-item">
                    <div className="status-detail-label">準備中</div>
                    <div className="status-detail-value">團隊正在收集資料、準備文件及安排內部訓練</div>
                  </div>
                  <div className="status-detail-item">
                    <div className="status-detail-label">內部審核中</div>
                    <div className="status-detail-value">企業內部稽核團隊進行自我評估和前置審核</div>
                  </div>
                  <div className="status-detail-item">
                    <div className="status-detail-label">外部審核中</div>
                    <div className="status-detail-value">認證機構派員進行現場審核和文件審查</div>
                  </div>
                  <div className="status-detail-item">
                    <div className="status-detail-label">已完成</div>
                    <div className="status-detail-value">認證程序已全部完成，取得認證證書</div>
                  </div>
                </div>
              </div>
              
              <div className="status-timeline">
                <h6>狀態進程</h6>
                <div className="status-progress-track">
                  <div className={`status-step ${projectDetail.status === 'preparing' || projectDetail.status === 'internal-review' || projectDetail.status === 'external-review' || projectDetail.status === 'completed' ? 'active' : ''}`}>
                    <div className="status-step-icon">
                      <FontAwesomeIcon icon={faUpload} />
                    </div>
                    <div className="status-step-label">準備中</div>
                  </div>
                  <div className="status-line"></div>
                  <div className={`status-step ${projectDetail.status === 'internal-review' || projectDetail.status === 'external-review' || projectDetail.status === 'completed' ? 'active' : ''}`}>
                    <div className="status-step-icon">
                      <FontAwesomeIcon icon={faClipboardCheck} />
                    </div>
                    <div className="status-step-label">內部審核中</div>
                  </div>
                  <div className="status-line"></div>
                  <div className={`status-step ${projectDetail.status === 'external-review' || projectDetail.status === 'completed' ? 'active' : ''}`}>
                    <div className="status-step-icon">
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                    </div>
                    <div className="status-step-label">外部審核中</div>
                  </div>
                  <div className="status-line"></div>
                  <div className={`status-step ${projectDetail.status === 'completed' ? 'active' : ''}`}>
                    <div className="status-step-icon">
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </div>
                    <div className="status-step-label">已完成</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="project-meta-section">
              <div className="project-progress-section">
                <h5>項目進度</h5>
                <div className="progress-percentage">{projectDetail.progress}% 完成</div>
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${projectDetail.progressColor}`} 
                    style={{ width: `${projectDetail.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="project-team-section">
                <h5>項目團隊</h5>
                <div className="team-members">
                  {projectDetail.team.map((member, index) => (
                    <div className="team-member" key={index}>
                      <div className="member-avatar">
                        {member.name.charAt(0)}
                      </div>
                      <div className="member-info">
                        <div className="member-name">{member.name}</div>
                        <div className="member-role">{member.role}</div>
                        <div className="member-email">{member.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'documents':
        const filteredDocuments = getFilteredDocuments();
        const documentsByCategory = getDocumentsByCategory(filteredDocuments);
        
        // 當前頁的文件
        let currentPageDocuments = [];
        if (activeDocCategory === 'all') {
          // 全部文件視圖不分頁，依類別顯示
          currentPageDocuments = filteredDocuments;
        } else {
          currentPageDocuments = getPaginatedDocuments(filteredDocuments);
        }
        
        return (
          <div className="project-documents">
            <div className="documents-header">
              <h5>項目文件管理</h5>
              <div className="documents-actions">
                <button 
                  className="btn btn-outline-primary btn-sm me-2" 
                  onClick={() => handleBatchDownload(activeDocCategory)}
                  title={`下載所有${activeDocCategory === 'all' ? '' : documentCategories.find(c => c.id === activeDocCategory)?.name || ''}文件`}
                >
                  <FontAwesomeIcon icon={faFileDownload} className="me-1" />
                  批量下載
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleShowUploadModal}>
                  <FontAwesomeIcon icon={faUpload} className="me-1" />
                  上傳文件
                </button>
              </div>
            </div>
            
            <div className="documents-tools">
              <div className="documents-search">
                <div className="search-input-container">
                  <FontAwesomeIcon icon={faSearch} className="search-icon" />
                  <input 
                    type="text" 
                    className="search-input" 
                    placeholder="搜尋文件名稱、描述或上傳者..." 
                    value={docSearchQuery}
                    onChange={handleDocSearch}
                  />
                </div>
              </div>
              
              <div className="documents-sort">
                <span className="sort-label">排序：</span>
                <div className="sort-options">
                  <button 
                    className={`sort-option ${docSortBy === 'uploadDate' ? 'active' : ''}`}
                    onClick={() => handleSortChange('uploadDate')}
                  >
                    上傳日期
                    {docSortBy === 'uploadDate' && (
                      <FontAwesomeIcon icon={docSortDesc ? faSortAmountDown : faSortAmountUp} className="ms-1" />
                    )}
                  </button>
                  <button 
                    className={`sort-option ${docSortBy === 'name' ? 'active' : ''}`}
                    onClick={() => handleSortChange('name')}
                  >
                    檔案名稱
                    {docSortBy === 'name' && (
                      <FontAwesomeIcon icon={docSortDesc ? faSortAmountDown : faSortAmountUp} className="ms-1" />
                    )}
                  </button>
                  <button 
                    className={`sort-option ${docSortBy === 'category' ? 'active' : ''}`}
                    onClick={() => handleSortChange('category')}
                  >
                    文件類別
                    {docSortBy === 'category' && (
                      <FontAwesomeIcon icon={docSortDesc ? faSortAmountDown : faSortAmountUp} className="ms-1" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="documents-container">
              <div className="document-categories">
                {documentCategories.map(category => (
                  <div 
                    key={category.id}
                    className={`document-category ${activeDocCategory === category.id ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(category.id)}
                  >
                    <FontAwesomeIcon icon={category.icon} className="category-icon" />
                    <span className="category-name">{category.name}</span>
                    {category.id === 'all' ? (
                      <span className="category-count">{projectDetail.documents.length}</span>
                    ) : (
                      <span className="category-count">
                        {projectDetail.documents.filter(doc => doc.category === category.id).length}
                      </span>
                    )}
                  </div>
                ))}
                
                <div className="document-category add-category" onClick={handleShowAddCategoryModal}>
                  <FontAwesomeIcon icon={faPlus} className="category-icon" />
                  <span className="category-name">新增文件類別</span>
                </div>
              </div>
              
              <div className="documents-content">
                {filteredDocuments.length === 0 ? (
                  <div className="no-documents">
                    <p>沒有符合條件的文件</p>
                  </div>
                ) : activeDocCategory === 'all' ? (
                  Object.keys(documentsByCategory).map(categoryId => {
                    if (documentsByCategory[categoryId].length === 0) return null;
                    
                    const categoryInfo = documentCategories.find(c => c.id === categoryId);
                    
                    return (
                      <div className="document-section" key={categoryId}>
                        <div className="document-section-header">
                          <FontAwesomeIcon icon={categoryInfo.icon} className="me-2" />
                          {categoryInfo.name} ({documentsByCategory[categoryId].length})
                        </div>
                        <div className="document-cards">
                          {documentsByCategory[categoryId].map(doc => (
                            <div 
                              className="document-card" 
                              key={doc.id} 
                              onClick={() => handleViewDocument(doc)}
                            >
                              <div className="document-card-icon">
                                {getFileIcon(doc.type)}
                              </div>
                              <div className="document-card-content">
                                <div className="document-card-title">{doc.name}</div>
                                <div className="document-card-description">{doc.description}</div>
                                <div className="document-card-meta">
                                  <span>{doc.uploadedBy}</span>
                                  <span>{doc.uploadDate}</span>
                                </div>
                              </div>
                              <div className="document-card-actions" onClick={(e) => e.stopPropagation()}>
                                <button className="btn btn-sm btn-icon" title="下載" onClick={() => handleDownloadDocument(doc)}>
                                  <FontAwesomeIcon icon={faDownload} />
                                </button>
                                <button className="btn btn-sm btn-icon btn-icon-danger" title="刪除" onClick={() => handleDeleteDocument(doc)}>
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div className="document-cards document-cards-grid">
                      {currentPageDocuments.map(doc => (
                        <div 
                          className="document-card" 
                          key={doc.id}
                          onClick={() => handleViewDocument(doc)}
                        >
                          <div className="document-card-icon">
                            {getFileIcon(doc.type)}
                          </div>
                          <div className="document-card-content">
                            <div className="document-card-title">{doc.name}</div>
                            <div className="document-card-description">{doc.description}</div>
                            <div className="document-card-meta">
                              <span>{doc.uploadedBy}</span>
                              <span>{doc.uploadDate}</span>
                            </div>
                          </div>
                          <div className="document-card-actions" onClick={(e) => e.stopPropagation()}>
                            <button className="btn btn-sm btn-icon" title="下載" onClick={() => handleDownloadDocument(doc)}>
                              <FontAwesomeIcon icon={faDownload} />
                            </button>
                            <button className="btn btn-sm btn-icon btn-icon-danger" title="刪除" onClick={() => handleDeleteDocument(doc)}>
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* 分頁控制 */}
                    {renderPagination(filteredDocuments.length)}
                  </>
                )}
              </div>
            </div>
            
            {/* 上傳文件對話框 */}
            {showUploadModal && (
              <div className="modal-overlay">
                <div className="upload-modal">
                  <div className="upload-modal-header">
                    <h5>上傳文件</h5>
                    <button className="btn-close" onClick={handleCloseUploadModal}>
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                  <form className="upload-form" onSubmit={handleUploadFile}>
                    <div className="form-group">
                      <label htmlFor="fileName">文件名稱</label>
                      <input
                        type="text"
                        id="fileName"
                        name="fileName"
                        className="form-control"
                        value={uploadForm.fileName}
                        onChange={handleUploadFormChange}
                        required
                        placeholder="輸入文件名稱（包含副檔名）"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="category">文件類別</label>
                      <select
                        id="category"
                        name="category"
                        className="form-control"
                        value={uploadForm.category}
                        onChange={handleUploadFormChange}
                        required
                      >
                        {documentCategories.filter(cat => cat.id !== 'all').map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="fileUpload">選擇文件</label>
                      <div className="file-upload-container">
                        <input
                          type="file"
                          id="fileUpload"
                          className="form-control file-upload"
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="description">文件描述</label>
                      <textarea
                        id="description"
                        name="description"
                        className="form-control"
                        value={uploadForm.description}
                        onChange={handleUploadFormChange}
                        rows="3"
                        placeholder="簡短描述此文件的內容或用途"
                      ></textarea>
                    </div>
                    
                    <div className="form-actions">
                      <button type="button" className="btn btn-outline" onClick={handleCloseUploadModal}>
                        取消
                      </button>
                      <button type="submit" className="btn btn-primary">
                        <FontAwesomeIcon icon={faUpload} className="me-2" />
                        上傳
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* 新增類別對話框 */}
            {showAddCategoryModal && (
              <div className="modal-overlay">
                <div className="upload-modal">
                  <div className="upload-modal-header">
                    <h5>新增文件類別</h5>
                    <button className="btn-close" onClick={handleCloseAddCategoryModal}>
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                  <form className="upload-form" onSubmit={handleAddCategory}>
                    <div className="form-group">
                      <label htmlFor="categoryName">類別名稱</label>
                      <input
                        type="text"
                        id="categoryName"
                        name="name"
                        className="form-control"
                        value={newCategoryForm.name}
                        onChange={handleNewCategoryFormChange}
                        required
                        placeholder="請輸入文件類別名稱"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="categoryId">類別識別碼</label>
                      <input
                        type="text"
                        id="categoryId"
                        name="id"
                        className="form-control"
                        value={newCategoryForm.id}
                        onChange={handleNewCategoryFormChange}
                        required
                        placeholder="自動根據名稱生成，可手動修改"
                      />
                      <small className="form-text text-muted">
                        識別碼僅能使用小寫字母、數字和連字符
                      </small>
                    </div>
                    
                    <div className="form-actions">
                      <button type="button" className="btn btn-outline" onClick={handleCloseAddCategoryModal}>
                        取消
                      </button>
                      <button type="submit" className="btn btn-primary">
                        新增類別
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'team':
        return (
          <div className="project-team">
            <div className="team-header">
              <h5>團隊成員</h5>
              <button className="btn btn-primary btn-sm">
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                添加成員
              </button>
            </div>
            
            <div className="team-members-extended">
              {projectDetail.team.map((member, index) => (
                <div className="team-member-card" key={index}>
                  <div className="member-card-header">
                    <div className="member-avatar-large">
                      {member.name.charAt(0)}
                    </div>
                    <div className="member-main-info">
                      <div className="member-name-large">{member.name}</div>
                      <div className="member-role-badge">{member.role}</div>
                      <div className="member-email-large">{member.email}</div>
                    </div>
                    <div className="member-actions">
                      <button className="btn btn-sm btn-outline-secondary">
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                    </div>
                  </div>
                  <div className="member-responsibilities">
                    <h6>職責與任務</h6>
                    <ul className="responsibilities-list">
                      <li>項目計劃制定和審核</li>
                      <li>團隊協調和資源分配</li>
                      <li>與認證機構溝通</li>
                      <li>進度監控和風險管理</li>
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'reviews':
        return (
          <div className="project-reviews">
            <ReviewFeedback projectId={projectDetail.id} projectName={projectDetail.name} />
          </div>
        );
      
      case 'history':
        return (
          <div className="project-history">
            <h5>操作歷史</h5>
            <div className="history-timeline">
              <div className="history-item">
                <div className="history-date">2023-09-15 14:30</div>
                <div className="history-content">
                  <div className="history-title">陳專員 上傳了文件</div>
                  <div className="history-details">上傳了「SMETA自我評估更新版.xlsx」文件</div>
                </div>
              </div>
              <div className="history-item">
                <div className="history-date">2023-09-14 10:15</div>
                <div className="history-content">
                  <div className="history-title">王經理 更新了項目進度</div>
                  <div className="history-details">進度從 65% 更新至 75%</div>
                </div>
              </div>
              <div className="history-item">
                <div className="history-date">2023-09-12 09:40</div>
                <div className="history-content">
                  <div className="history-title">林工程師 上傳了文件</div>
                  <div className="history-details">上傳了「環境管理程序.docx」文件</div>
                </div>
              </div>
              <div className="history-item">
                <div className="history-date">2023-09-10 16:20</div>
                <div className="history-content">
                  <div className="history-title">系統 更新了項目階段</div>
                  <div className="history-details">項目階段從「自我評估」更新為「文件準備」</div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="project-settings">
            <h5 className="settings-title">專案設定</h5>
            
            <div className="settings-section">
              <div className="settings-card">
                <div className="settings-card-header">
                  <FontAwesomeIcon icon={faInfoCircle} className="settings-icon" />
                  <h6>基本資訊</h6>
                </div>
                <div className="settings-card-body">
                  <p>管理專案的基本資訊，包括名稱、時間範圍、負責人等。</p>
                  <button 
                    className="btn btn-primary"
                    onClick={handleShowEditProjectModal}
                  >
                    <FontAwesomeIcon icon={faEdit} className="me-2" />
                    修改專案資訊
                  </button>
                </div>
              </div>
              
              <div className="settings-card">
                <div className="settings-card-header">
                  <FontAwesomeIcon icon={faFileExport} className="settings-icon" />
                  <h6>匯出報告</h6>
                </div>
                <div className="settings-card-body">
                  <p>匯出專案報告，包括進度、文件、審核結果等資訊，可選擇不同格式。</p>
                  <button 
                    className="btn btn-primary"
                    onClick={handleShowExportReportModal}
                  >
                    <FontAwesomeIcon icon={faFileExport} className="me-2" />
                    匯出專案報告
                  </button>
                </div>
              </div>
              
              <div className="settings-card danger-zone">
                <div className="settings-card-header">
                  <FontAwesomeIcon icon={faTrashAlt} className="settings-icon text-danger" />
                  <h6>危險操作</h6>
                </div>
                <div className="settings-card-body">
                  <p>刪除此專案將永久移除所有相關資料，包括文件、審核記錄等，此操作無法復原。</p>
                  <button 
                    className="btn btn-danger"
                    onClick={handleShowDeleteConfirmModal}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} className="me-2" />
                    刪除專案
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>無效的頁籤</div>;
    }
  };

  /**
   * 處理查看文件
   * @param {Object} doc - 要查看的文件對象
   */
  const handleViewDocument = (doc) => {
    // 在實際應用中，這裡可能是導航到文件詳情頁面或打開預覽對話框
    console.log('查看文件:', doc.name);
    
    // 模擬顯示文件預覽對話框
    alert(`正在預覽文件: ${doc.name}`);
    
    // 或者使用更複雜的模態對話框顯示預覽
    // setPreviewDocument(doc);
    // setShowPreviewModal(true);
  };

  /**
   * 處理下載文件
   * @param {Object} doc - 要下載的文件對象
   */
  const handleDownloadDocument = (doc) => {
    // 在實際應用中，這裡應該調用API下載文件
    console.log('下載文件:', doc.name);
    
    // 模擬下載過程
    alert(`正在下載文件: ${doc.name}`);
  };

  /**
   * 處理刪除文件
   * @param {Object} doc - 要刪除的文件對象
   */
  const handleDeleteDocument = (doc) => {
    // 在實際應用中，這裡應該調用API刪除文件
    if (window.confirm(`確定要刪除文件：${doc.name}？此操作無法恢復。`)) {
      console.log('刪除文件:', doc.name);
      
      // 從文件列表中移除
      const updatedDocuments = projectDetail.documents.filter(d => d.id !== doc.id);
      setProjectDetail({
        ...projectDetail,
        documents: updatedDocuments
      });
      
      alert(`文件 ${doc.name} 已刪除`);
    }
  };

  return (
    <div className="certification-project-detail">
      {/* 項目頂部信息 */}
      <div className="project-header">
        <button className="btn btn-link back-button" onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          返回項目列表
        </button>
        
        {!loading && projectDetail && (
          <div className="project-title-container">
            <h4 className="project-title">{projectDetail.name}</h4>
            <div className="project-date-range">
              <FontAwesomeIcon icon={faClock} className="me-2" />
              {projectDetail.startDate} 至 {projectDetail.endDate}
            </div>
          </div>
        )}
      </div>
      
      {/* 項目頁籤 */}
      <div className="project-tabs">
        <div 
          className={`project-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FontAwesomeIcon icon={faFileAlt} className="me-2" />
          項目概覽
        </div>
        <div 
          className={`project-tab ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <FontAwesomeIcon icon={faFileAlt} className="me-2" />
          文件管理
        </div>
        <div 
          className={`project-tab ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => setActiveTab('team')}
        >
          <FontAwesomeIcon icon={faUsers} className="me-2" />
          團隊成員
        </div>
        <div 
          className={`project-tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          <FontAwesomeIcon icon={faComments} className="me-2" />
          審核與回饋
        </div>
        <div 
          className={`project-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <FontAwesomeIcon icon={faHistory} className="me-2" />
          操作歷史
        </div>
        <div 
          className={`project-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <FontAwesomeIcon icon={faCog} className="me-2" />
          專案設定
        </div>
      </div>
      
      {/* 項目內容 */}
      <div className="project-content">
        {renderContent()}
      </div>
      
      {/* 編輯項目資訊對話框 */}
      {showEditProjectModal && (
        <div className="modal-overlay">
          <div className="upload-modal">
            <div className="upload-modal-header">
              <h5>編輯專案資訊</h5>
              <button className="btn-close" onClick={handleCloseEditProjectModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <form className="upload-form" onSubmit={handleUpdateProject}>
              <div className="form-group">
                <label htmlFor="projectName">專案名稱</label>
                <input
                  type="text"
                  id="projectName"
                  name="name"
                  className="form-control"
                  value={editProjectForm.name}
                  onChange={handleEditProjectFormChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-col">
                  <div className="form-group">
                    <label htmlFor="projectStatus">專案狀態</label>
                    <select
                      id="projectStatus"
                      name="status"
                      className="form-control"
                      value={editProjectForm.status}
                      onChange={handleEditProjectFormChange}
                      required
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-col">
                  <div className="form-group">
                    <label htmlFor="certificationAgency">認證機構</label>
                    <input
                      type="text"
                      id="certificationAgency"
                      name="agency"
                      className="form-control"
                      value={editProjectForm.agency}
                      onChange={handleEditProjectFormChange}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-col">
                  <div className="form-group">
                    <label htmlFor="startDate">開始日期</label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      className="form-control"
                      value={editProjectForm.startDate}
                      onChange={handleEditProjectFormChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-col">
                  <div className="form-group">
                    <label htmlFor="endDate">結束日期</label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      className="form-control"
                      value={editProjectForm.endDate}
                      onChange={handleEditProjectFormChange}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="projectManager">專案負責人</label>
                <input
                  type="text"
                  id="projectManager"
                  name="manager"
                  className="form-control"
                  value={editProjectForm.manager}
                  onChange={handleEditProjectFormChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="projectDescription">專案描述</label>
                <textarea
                  id="projectDescription"
                  name="description"
                  className="form-control"
                  rows="4"
                  value={editProjectForm.description}
                  onChange={handleEditProjectFormChange}
                  required
                ></textarea>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={handleCloseEditProjectModal}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  <FontAwesomeIcon icon={faSave} /> 儲存變更
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* 刪除項目確認對話框 */}
      {showDeleteConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-dialog modal-confirm">
            <div className="modal-content">
              <div className="modal-header bg-danger">
                <h5 className="modal-title">確認刪除</h5>
                <button className="btn-close" onClick={handleCloseDeleteConfirmModal}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="modal-body">
                <div className="alert-warning">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <div>警告：此操作將永久刪除專案「{projectDetail.name}」及其所有相關資料。此操作無法復原。</div>
                </div>
                
                <div className="form-group">
                  <label>請輸入專案名稱確認刪除：</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={projectDetail.name}
                  />
                </div>
                
                <div className="form-check">
                  <input type="checkbox" id="confirmDelete" className="form-check-input" />
                  <label htmlFor="confirmDelete" className="form-check-label">
                    我已閱讀並理解此操作的風險
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={handleCloseDeleteConfirmModal}>
                  取消
                </button>
                <button type="button" className="btn btn-danger" onClick={handleDeleteProject}>
                  <FontAwesomeIcon icon={faTrash} /> 確認刪除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 匯出報告對話框 */}
      {showExportReportModal && (
        <div className="modal-overlay">
          <div className="upload-modal">
            <div className="upload-modal-header">
              <h5>匯出專案報告</h5>
              <button className="btn-close" onClick={handleCloseExportReportModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="upload-form">
              <div className="form-row">
                <div className="form-col">
                  <div className="form-group">
                    <label htmlFor="exportFormat">報告格式</label>
                    <select
                      id="exportFormat"
                      name="format"
                      className="form-control"
                      value={exportSettings.format}
                      onChange={handleExportSettingChange}
                    >
                      <option value="pdf">PDF文件</option>
                      <option value="excel">Excel試算表</option>
                      <option value="word">Word文件</option>
                    </select>
                  </div>
                </div>
                <div className="form-col">
                  <div className="form-group">
                    <label htmlFor="exportLanguage">報告語言</label>
                    <select
                      id="exportLanguage"
                      name="language"
                      className="form-control"
                    >
                      <option value="zh-TW">繁體中文</option>
                      <option value="en">英文</option>
                      <option value="zh-CN">簡體中文</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label>選擇包含的內容</label>
                <div className="checkbox-group">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="includeBasicInfo"
                      name="includeBasicInfo"
                      className="form-check-input"
                      checked={exportSettings.includeBasicInfo}
                      onChange={handleExportSettingChange}
                    />
                    <label className="form-check-label" htmlFor="includeBasicInfo">
                      專案基本資訊
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="includeTeamInfo"
                      name="includeTeamInfo"
                      className="form-check-input"
                      checked={exportSettings.includeTeamInfo}
                      onChange={handleExportSettingChange}
                    />
                    <label className="form-check-label" htmlFor="includeTeamInfo">
                      團隊成員資訊
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="includeDocuments"
                      name="includeDocuments"
                      className="form-check-input"
                      checked={exportSettings.includeDocuments}
                      onChange={handleExportSettingChange}
                    />
                    <label className="form-check-label" htmlFor="includeDocuments">
                      文件清單
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="includeReviews"
                      name="includeReviews"
                      className="form-check-input"
                      checked={exportSettings.includeReviews}
                      onChange={handleExportSettingChange}
                    />
                    <label className="form-check-label" htmlFor="includeReviews">
                      審核記錄
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="includeHistory"
                      name="includeHistory"
                      className="form-check-input"
                      checked={exportSettings.includeHistory}
                      onChange={handleExportSettingChange}
                    />
                    <label className="form-check-label" htmlFor="includeHistory">
                      操作歷史
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="includeCharts"
                      name="includeCharts"
                      className="form-check-input"
                      defaultChecked
                    />
                    <label className="form-check-label" htmlFor="includeCharts">
                      圖表與分析
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="reportNotes">附加說明</label>
                <textarea
                  id="reportNotes"
                  name="notes"
                  className="form-control"
                  rows="3"
                  placeholder="在報告中添加的備註或說明..."
                ></textarea>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={handleCloseExportReportModal}>
                  取消
                </button>
                <button type="button" className="btn btn-primary" onClick={handleExportReport}>
                  <FontAwesomeIcon icon={faFileExport} /> 匯出報告
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificationProjectDetail; 