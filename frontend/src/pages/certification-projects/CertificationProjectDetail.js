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

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, faClock, faFileAlt, faUsers, faCheckCircle, 
  faExclamationTriangle, faEdit, faHistory, faComments, faUpload, faClipboardCheck,
  faSearch, faDownload, faTimes, faFolder, faFilePdf, 
  faFileWord, faFileExcel, faFileImage, faFile, faSortAmountDown, faSortAmountUp, faPlus,
  faChevronLeft, faChevronRight, faEllipsisH, faFileDownload, faCog, faTrashAlt,
  faFileExport, faInfoCircle, faSave, faTrash, faCalendarAlt, faChartLine, faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import './CertificationProjectDetail.css';

// 引入審核與回饋組件
import ReviewFeedback from '../../components/certification-projects/ReviewFeedback';

import axios from "axios";

/**
 * 認證項目詳情頁面
 * @returns {JSX.Element} 認證項目詳情頁面
 */
const CertificationProjectDetail = ({ canWrite }) => {
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
   * 編輯對話框當前標籤頁狀態
   * @type {[string, Function]} [當前活動標籤頁, 設置活動標籤頁的函數]
   */
  const [editTabActive, setEditTabActive] = useState('basic');
  
  /**
   * 編輯項目信息表單數據
   * @type {[Object, Function]} [編輯項目信息表單數據, 設置編輯項目信息表單數據的函數]
   */
  const [editProjectForm, setEditProjectForm] = useState({
    name: '',
    status: '',
    startDate: '',
    endDate: '',
    managerId: '',
    agency: '',
    description: '',
    progress: 0  // 新增進度欄位
  });

  /**
   * 匯出報告設置
   * @type {[Object, Function]} [匯出報告設置, 設置匯出報告設置的函數]
   */
  const [exportSettings, setExportSettings] = useState({
    format: 'excel',
    includeBasicInfo: true,
    includeTeamInfo: true,
    includeDocuments: true,
    includeReviews: true,
    notes: ''
  });

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [progressMode, setProgressMode] = useState('MANUAL'); // MANUAL or AUTOMATIC

  useEffect(() => {
    // Fetch all available templates
    const fetchTemplates = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/templates');
        setTemplates(response.data);
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      }
    };
    fetchTemplates();
  }, []);

  const handleRequirementChange = async (requirementStatusId, currentCompletedStatus) => {
    try {
      await axios.patch(`http://localhost:8000/api/projects/${projectId}/requirements/${requirementStatusId}`, {
        isCompleted: !currentCompletedStatus
      });
      // After successful update, refetch project details to get the latest progress and status
      fetchProjectDetail();
    } catch (error) {
      console.error("Failed to update requirement status:", error);
      alert("更新查檢項目狀態失敗");
    }
  };

  const handleTemplateApply = async (templateId) => {
    if (!templateId) return;
    try {
      await axios.put(`http://localhost:8000/api/projects/${projectId}/template`, { templateId });
      setSelectedTemplate(templateId);
      // Refetch project details to get the new requirement list
      fetchProjectDetail();
      alert("範本已成功套用");
    } catch (error) {
      console.error("Failed to apply template:", error);
      alert("套用範本失敗");
    }
  };


  const calculatedProgress = Math.round(
    (projectDetail?.requirementStatuses?.filter((r) => r.isCompleted).length / projectDetail?.requirementStatuses?.length) * 100
  ) || 0;

  /**
   * 操作歷史狀態
   * @type {[Array, Function]} [操作歷史列表, 設置操作歷史列表的函數]
   */
  const [history, setHistory] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [userList, setUserList] = useState([]);
  // 從API獲取項目詳情
  const fetchProjectDetail = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}`);
      if (!response.ok) throw new Error('載入專案細節失敗');
      const data = await response.json();
      setProjectDetail(data);
      // Set initial state based on fetched data
      setProgressMode(data.progressCalculationMode || 'MANUAL');
      if (data.certificationTemplate) {
        setSelectedTemplate(data.certificationTemplate.id);
      }
    } catch (err) {
      console.error('抓取專案細節錯誤:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const fetchTeamMembers = useCallback(async () => {
    try {
        const res = await fetch(`http://localhost:8000/api/projects/${projectId}/team`);
        if (!res.ok) throw new Error('Failed to fetch team members');
        const data = await res.json();
        setTeamMembers(Array.isArray(data) ? data : []);
    } catch (error) {
        console.error("Error fetching team members:", error);
        setTeamMembers([]);
    }
  }, [projectId]);
  
  useEffect(() => { 
      if (projectId) {
          fetchTeamMembers(); 
      }
  }, [projectId, fetchTeamMembers]);

  // 計算可選用戶（排除已在團隊中的 user）
  const availableUsers = userList.filter(u => !teamMembers.some(tm => String(tm.id) === String(u.id)));

  // 當文件篩選條件變更時，重置頁碼為1
  useEffect(() => {
    setCurrentDocPage(1);
  }, [activeDocCategory, docSearchQuery, docSortBy, docSortDesc]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (activeTab === 'history' && projectId) {
        try {
          const response = await fetch(`http://localhost:8000/api/history/project/${projectId}`);
          if (!response.ok) throw new Error('載入操作歷史失敗');
          const data = await response.json();
          setHistory(data);
        } catch (err) {
          console.error('抓取操作歷史錯誤:', err);
          setHistory([]); //發生錯誤時清空
        }
      }
    };

    fetchHistory();
  }, [activeTab, projectId]);

  useEffect(() => {
    if (projectId) {
      fetchProjectDetail();
    }
  }, [projectId, fetchProjectDetail]);

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


  const handleUploadFormChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setUploadForm({
        ...uploadForm,
        [name]: files[0] // 取得第一個檔案
      });
    } else {
      setUploadForm({
        ...uploadForm,
        [name]: value
      });
    }
  };


  /**
   * 處理上傳文件
   * @param {Event} e - 事件對象
   */
  const handleUploadFile = async (e) => {
    e.preventDefault();

    // 建立 FormData，放入檔案及其他欄位
    const formData = new FormData();
    formData.append('file', uploadForm.file); // 假設 uploadForm.file 是 File 物件
    formData.append('category', uploadForm.category);
    formData.append('description', uploadForm.description);
    console.log(uploadForm.file);

    try {
      const response = await fetch(`http://localhost:8000/api/documents/certification-projects/${projectId}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('上傳失敗');
      }

      const data = await response.json();

      // 將後端回傳的資料加入文件列表
      const newDoc = {
        id: data.id,
        name: data.name,
        filename: data.filename,
        category: data.category,
        type: data.type,
        uploadedBy: data.uploadedBy,
        uploadDate: data.uploadDate,
        description: data.description
      };

      setProjectDetail({
        ...projectDetail,
        documents: [...projectDetail.documents, newDoc]
      });

      setShowUploadModal(false);
      alert('文件上傳成功');

    } catch (error) {
      alert(error.message);
    }
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
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (newCategoryForm.id && newCategoryForm.name) {
      const newCategory = {
        id: newCategoryForm.id,
        name: newCategoryForm.name,
        icon: faFile // 默認使用一般文件圖標
      };
      
      try {
        // 呼叫後端 API 建立對應資料夾
        const res = await axios.post("http://localhost:8000/api/documents/create-category", null, {
          params: { category: newCategory.id } // 用 id 作為資料夾名稱（通常為英文）
        });

        if (res.data.success) {
          // 更新前端類別列表
          setDocumentCategories((prev) => [...prev, newCategory]);
          // 關閉對話框
          setShowAddCategoryModal(false);
          // 通知用戶成功
          alert(`已成功新增『${newCategoryForm.name}』類別，並建立資料夾`);
          // 清空表單（可選）
          setNewCategoryForm({ id: "", name: "" });
        } else {
         alert("建立資料夾失敗：" + res.data.error);
        }
      } catch (err) {
        alert("建立類別資料夾時發生錯誤：" + (err.response?.data?.error || err.message));
      }
    }
  };


  /**
   * 處理刪除類別
   */
  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (categoryId === 'all') {
      alert("預設類別無法刪除！");
      return;
    }

    const confirmDelete = window.confirm(`確定要刪除類別「${categoryName}」嗎？該資料夾與檔案將一併刪除。`);
    if (!confirmDelete) return;

    try {
      const response = await axios.delete("http://localhost:8000/api/documents/delete-category", {
        params: { category: categoryId }
      });

      if (response.data.success) {
        alert("類別刪除成功");

        // 更新前端類別列表
        setDocumentCategories(prev => prev.filter(cat => cat.id !== categoryId));

        // 更新文件清單，移除該類別下文件（如需要）
        setProjectDetail(prev => ({
          ...prev,
          documents: prev.documents.filter(doc => doc.category !== categoryId)
        }));

        // 若目前正選中該分類，重設為 all
        if (activeDocCategory === categoryId) {
          setActiveDocCategory('all');
        }

      } else {
        alert("刪除失敗：" + response.data.message);
      }
    } catch (error) {
      alert("刪除失敗：" + (error.response?.data?.error || error.message));
    }
  };

  // //取得後端現存的資料夾
  // useEffect(() => {
  //   // 取得後端存在的資料夾名稱
  //   const fetchCategoriesFromServer = async () => {
  //     try {
  //       const res = await axios.get('http://localhost:8000/api/documents/categories');
  //       const serverCategories = res.data;

  //       // 把回傳的類別整合到現有的 documentCategories（避免重複）
  //       const newCategories = serverCategories
  //         .filter(cat => !documentCategories.some(c => c.id === cat))
  //         .map(cat => ({
  //           id: cat,
  //           name: cat,
  //           icon: faFile // 或依照類別自訂 icon
  //         }));

  //       setDocumentCategories(prev => [...prev, ...newCategories]);
  //     } catch (err) {
  //       console.error("無法載入類別", err);
  //     }
  //   };

  //   fetchCategoriesFromServer();
  // }, []);
  
  useEffect(() => {
    fetch('http://localhost:8000/api/documents/categories')
      .then(res => res.json())
      .then(fetchedCategories => {
        setDocumentCategories(prevCategories => {
          // 取得現有的 id 陣列
          const existingIds = prevCategories.map(cat => cat.id);

          // 過濾掉重複的類別
          const newCategories = fetchedCategories
            .filter(id => !existingIds.includes(id))
            .map(id => ({
              id,
              name: id, // 這裡可根據你的 mapping 修改
              icon: faFile,
            }));

          return [...prevCategories, ...newCategories];
        });
      });
  }, []);




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
        managerId: Number(projectDetail.manager), // 假設 manager 是 userId
        agency: projectDetail.agency,
        description: projectDetail.description,
        progress: projectDetail.progress
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
      [name]: name === 'managerId' ? Number(value) : value
    });
  };

  /**
   * 處理編輯項目表單提交
   * @param {Event} e - 事件對象
   */
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`http://localhost:8000/api/projects/UpdateProject/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editProjectForm),
      });

      if (!response.ok) {
        throw new Error('更新專案失敗');
      }

      const updatedProject = await response.json();

      // 使用後端返回的最新資料更新前端狀態
      setProjectDetail(prev => ({
        ...prev,
        ...updatedProject,
        // 確保 team 和 documents 等不在這個 API 更新的資料被保留
        team: prev.team,
        documents: prev.documents,
      }));
      
      setShowEditProjectModal(false);
      alert('項目資料已更新');
      
      // 手動觸發一次 projectDetail 的重新獲取，確保資料同步
      // (可以選擇性地做，如果上面的更新不夠全面的話)
      // fetchProjectDetail();

    } catch (error) {
      console.error('更新專案錯誤:', error);
      alert(error.message);
    }
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
    const payload = {
      projectId: projectId, // 你要傳的專案ID，請自己定義或從狀態取得
      includeBasicInfo: exportSettings.includeBasicInfo,
      includeTeamInfo: exportSettings.includeTeamInfo,
      includeDocuments: exportSettings.includeDocuments,
      includeReviews: exportSettings.includeReviews,
      notes: exportSettings.notes
    };
    console.log('即將匯出，payload:', payload);


    fetch('http://localhost:8000/api/projects/' + payload.projectId + '/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('匯出失敗');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `project_${payload.projectId}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        alert(`報告已匯出為${exportSettings.format.toUpperCase()}格式`);
        setShowExportReportModal(false);
      })
      .catch((error) => {
        console.error(error);
        alert('匯出失敗，請稍後再試');
      });
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
                <div className="progress-percentage">
                  {projectDetail.progress}% 完成
                </div>
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${projectDetail.progressColor}`} 
                    style={{ 
                      width: `${projectDetail.progress}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="project-team-section">
                <h5>項目團隊</h5>
                <div className="team-members">
                  {projectDetail.team.map((member, index) => (
                    <div className="team-member" key={`${member.id}-${index}`}>
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
      
      case 'checklist':
        return (
          <div className="checklist-progress-grid">
            <div className="certification-checklist-section">
              <h5>
                <FontAwesomeIcon icon={faClipboardCheck} className="me-2" />
                認證項目檢查清單
              </h5>
              <div className="template-selector-container">
                <label htmlFor="template-select">套用範本:</label>
                <select
                  id="template-select"
                  className="template-select"
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateApply(e.target.value)}
                >
                  <option value="">請選擇要套用的範本</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="checklist-container">
                {projectDetail?.requirementStatuses?.map((req) => (
                  <div className="checklist-item" key={req.id}>
                    <input
                      type="checkbox"
                      id={`req-${req.id}`}
                      className="form-check-input"
                      checked={req.isCompleted}
                      onChange={() => handleRequirementChange(req.id, req.isCompleted)}
                      disabled={progressMode !== 'AUTOMATIC'}
                    />
                    <label htmlFor={`req-${req.id}`} className="checklist-label">
                      {req.text}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="project-progress-management-section">
              <h5>
                <FontAwesomeIcon icon={faChartLine} className="me-2" />
                進度管理
              </h5>

              <div className="progress-mode-toggle">
                <span>手動調整</span>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="progress-mode"
                    className="toggle-input"
                    checked={progressMode === 'AUTOMATIC'}
                    onChange={async () => {
                      const newMode = progressMode === 'AUTOMATIC' ? 'MANUAL' : 'AUTOMATIC';
                      try {
                        await axios.patch(`http://localhost:8000/api/projects/${projectId}/settings/progress-mode`, { mode: newMode });
                        setProgressMode(newMode);
                        fetchProjectDetail(); // Refetch to get updated progress if switched to AUTOMATIC
                      } catch (error) {
                        console.error("Failed to switch progress mode:", error);
                        alert("切換模式失敗");
                      }
                    }}
                  />
                  <label htmlFor="progress-mode" className="toggle-label"></label>
                </div>
                <span>自動計算</span>
              </div>

              <div className="progress-section-standalone">
                <div className="progress-display-large">
                  <div className="progress-circle">
                    <svg className="progress-ring" width="120" height="120">
                      <circle
                        className="progress-ring-bg"
                        stroke="#e9ecef"
                        strokeWidth="8"
                        fill="transparent"
                        r="52"
                        cx="60"
                        cy="60"
                      />
                      <circle
                        className="progress-ring-fill"
                        stroke="#4a6cf7"
                        strokeWidth="8"
                        fill="transparent"
                        r="52"
                        cx="60"
                        cy="60"
                        strokeDasharray={`${2 * Math.PI * 52}`}
                        strokeDashoffset={`${2 * Math.PI * 52 * (1 - (projectDetail.progress || 0) / 100)}`}
                      />
                    </svg>
                    <div className="progress-text">
                      <span className="progress-number">
                        {projectDetail.progress}%
                      </span>
                      <span className="progress-label">完成</span>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="projectProgress" className="form-label">
                    完成度調整
                  </label>
                  <div className="progress-slider-container">
                    <input
                      type="range"
                      id="projectProgress"
                      name="progress"
                      className="form-range modern"
                      min="0"
                      max="100"
                      step="5"
                      value={projectDetail.progress || 0}
                      onChange={(e) => {
                        if (progressMode === 'MANUAL') {
                          setProjectDetail({
                            ...projectDetail,
                            progress: parseInt(e.target.value, 10),
                          });
                        }
                      }}
                      disabled={progressMode === 'AUTOMATIC'}
                    />
                    <div className="progress-markers">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <div className="progress-help-text">
                    <FontAwesomeIcon icon={faInfoCircle} className="help-icon" />
                    {progressMode === 'AUTOMATIC' 
                      ? "自動模式下，進度由查檢表完成項自動計算。"
                      : "手動拖動滑桿以調整專案完成度。"
                    }
                  </div>
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

            {/* 文件類別區塊 */}
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
                      <>
                        <span className="category-count">
                          {projectDetail.documents.filter(doc => doc.category === category.id).length}
                        </span>
                        <FontAwesomeIcon
                          icon={faTrash}
                          className="delete-category-icon text-red-500 hover:text-red-700 ml-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(category.id, category.name);
                          }}
                        />
                      </>
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
                          name="file" 
                          onChange={handleUploadFormChange}
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
              <button className="btn btn-primary btn-sm" onClick={handleShowAddMemberModal} disabled={ !canWrite }>
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                添加成員
              </button>
            </div>
            <div className="team-members-extended">
              {teamMembers.length === 0 ? (
                <div>尚無團隊成員，請新增。</div>
              ) : teamMembers.map((member, index) => {
                // 取得該 user 的 position
                const user = userList.find(u => String(u.id) === String(member.id));
                const position = user && user.position ? user.position : '無職稱';
                return (
                  <div className="team-member-card" key={index}>
                    <div className="member-card-header">
                      <div className="member-avatar-large">{member.name.charAt(0)}</div>
                      <div className="member-main-info">
                        <div className="member-name-large">{member.name}</div>
                        <div className="member-role-badge">{position}</div>
                        <div className="member-email-large">{member.email}</div>
                        <div className="member-permission">
                          <span className="badge bg-secondary me-2">
                            {member.permission === 'edit' ? '可編輯' : '僅檢視'}
                          </span>
                        </div>
                      </div>
                      <div className="member-actions">
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => handleShowPermissionModal(member.id)} disabled={ !canWrite }>
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button className="btn btn-sm btn-outline-danger ms-2" title="移除成員" onClick={() => handleRemoveMember(member.id)} disabled={ !canWrite }>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                    <div className="member-responsibilities">
                      <h6>職責與任務</h6>
                      <ul className="responsibilities-list">
                        {member.duties && member.duties.length > 0 ? (
                          member.duties.map(duty => <li key={duty}>{duty}</li>)
                        ) : (
                          <li>無</li>
                        )}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* 新增成員彈窗（只能選現有用戶） */}
            {showAddMemberModal && (
              <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">添加團隊成員</h5>
                      <button type="button" className="btn-close" onClick={handleCloseAddMemberModal}></button>
                    </div>
                    <form onSubmit={handleAddMember}>
                      <div className="modal-body">
                        {addMemberError && <div className="alert alert-danger py-2">{addMemberError}</div>}
                        <div className="mb-3">
                          <label className="form-label">選擇用戶</label>
                          <select className="form-select" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} required>
                            <option value="">請選擇</option>
                            {availableUsers.map(u => (
                              <option key={u.id} value={u.id}>{u.name}（{u.position || '無職稱'}）</option>
                            ))}
                          </select>
                        </div>
                        {/* 移除職責欄位 */}
                        <div className="mb-3">
                          <label className="form-label">權限</label>
                          <select className="form-select" value={selectedPermission} onChange={e => setSelectedPermission(e.target.value)} required>
                            <option value="view">僅檢視</option>
                            <option value="edit">可編輯</option>
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">多重職責（可多選）</label>
                          <input
                            className="form-control"
                            value={selectedDuties.join(',')}
                            onChange={e => setSelectedDuties(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                            placeholder="以逗號分隔多個職責"
                          />
                          <small className="text-muted">例如：文件管理, 進度追蹤, 審核協助</small>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handleCloseAddMemberModal}>取消</button>
                        <button type="submit" className="btn btn-primary" disabled={!selectedUserId}>新增</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
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
              {history.length > 0 ? (
                history.map(item => (
                  <div className="history-item" key={item.id}>
                    <div className="history-date">
                      {new Date(item.operationTime).toLocaleString('zh-TW', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    <div className="history-content">
                      <div className="history-title">{item.operator} {item.operationType.replace(/_/g, ' ').toLowerCase()}</div>
                      <div className="history-details">{item.details}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-history">
                  <p>暫無操作歷史記錄</p>
                </div>
              )}
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
                    disabled={ !canWrite }
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
                    disabled={ !canWrite }
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
        return null;
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
  const handleDownloadDocument = async (doc) => {
    if (!doc || !doc.filename) {
      alert('無效的文件資訊');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/documents/download/${encodeURIComponent(doc.filename)}`);

      if (!response.ok) {
        alert('下載失敗：找不到文件或伺服器錯誤');
        return;
      }

      const blob = await response.blob();

      // 建立下載連結
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name || doc.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下載失敗:', error);
      alert('下載過程發生錯誤');
    }
  };


  /**
   * 處理刪除文件
   * @param {Object} doc - 要刪除的文件對象
   */
  const handleDeleteDocument = async (doc) => {
    if (!doc || !doc.id) {
      alert('找不到要刪除的文件ID');
      return;
    }

    if (!window.confirm(`確定要刪除文件：${doc.name}？此操作無法恢復。`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/documents/delete/${doc.id}`, { 
        method: 'DELETE' 
      });
      const result = await response.json();

      if (response.ok && result.success) {
        // 刪除成功才更新前端狀態
        const updatedDocuments = projectDetail.documents.filter(d => d.id !== doc.id);
        setProjectDetail({
          ...projectDetail,
          documents: updatedDocuments
        });

        alert(`文件 ${doc.name} 已刪除`);
      } else {
        alert(`刪除失敗：${result.error || '未知錯誤'}`);
      }
    } catch (error) {
      console.error('刪除失敗', error);
      alert('刪除過程發生錯誤，請稍後再試');
    }
  };

  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedMemberIndex, setSelectedMemberIndex] = useState(null);

  // 編輯成員職責輸入（編輯用）
  const [editDuties, setEditDuties] = useState([]);
  const [editDutiesInput, setEditDutiesInput] = useState('');

  // 新增成員彈窗狀態
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [addMemberError, setAddMemberError] = useState('');
  const [selectedPermission, setSelectedPermission] = useState('view');
  // 新增成員職責輸入（新增用）
  const [selectedDuties, setSelectedDuties] = useState([]);
  const [dutiesInput, setDutiesInput] = useState('');

  // 打開編輯彈窗，載入對應成員資料
  const handleShowPermissionModal = (userId) => {
    const team = teamMembers || [];
    const index = team.findIndex(m => m.id === userId);
    if (index === -1) {
      console.warn('找不到 team 成員 with userId:', userId);
      console.log('目前 team:', team);
      return;
    }

    const member = team[index];
    const duties = member.duties || [];

    setSelectedMemberIndex(index);
    setEditDuties(duties);
    setEditDutiesInput(duties.join(', '));
    setShowPermissionModal(true);
  };

  // 關閉編輯彈窗，清空狀態
  const handleClosePermissionModal = () => {
    setShowPermissionModal(false);
    setSelectedMemberIndex(null);
    setEditDuties([]);
    setEditDutiesInput('');
  };

  // 打開新增成員彈窗，清空新增狀態
  const handleShowAddMemberModal = () => {
    setSelectedUserId('');
    setSelectedRole('');
    setSelectedPermission('view');
    setSelectedDuties([]);
    setDutiesInput('');
    setAddMemberError('');
    setShowAddMemberModal(true);
  };

  // 關閉新增成員彈窗，清空新增狀態
  const handleCloseAddMemberModal = () => {
    setShowAddMemberModal(false);
    setSelectedUserId('');
    setSelectedRole('');
    setSelectedPermission('view');
    setSelectedDuties([]);
    setDutiesInput('');
    setAddMemberError('');
  };

  //處理新增成員
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      setAddMemberError('請選擇用戶並填寫職責');
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/api/projects/${projectId}/add-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId,
          role: selectedRole,
          permission: selectedPermission,
          duties: selectedDuties
        })
      });
      if (!res.ok) throw new Error('新增失敗');

      // 這裡用回傳的 team 更新狀態，避免需要refresh才能編輯member
      const updatedTeam = await res.json();
      setProjectDetail(prev => ({ ...prev, team: updatedTeam }));

      setShowAddMemberModal(false);
      setSelectedUserId('');
      setSelectedRole('');
      setSelectedPermission('view');
      setSelectedDuties([]);
      setAddMemberError('');
      fetchTeamMembers();
    } catch (err) {
      setAddMemberError('新增成員失敗，請稍後再試');
    }
  };

  // 取得所有用戶（供添加成員用）
  useEffect(() => {
    fetch('http://localhost:8000/api/users/all')
      .then(res => res.json())
      .then(data => {
        setUserList(Array.isArray(data) ? data : []);
      })
      .catch(() => setUserList([]));
  }, []);

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('確定要移除此成員？')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/projects/${projectId}/remove-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (!res.ok) throw new Error('移除失敗');
      fetchTeamMembers();
    } catch (err) {
      alert('移除成員失敗，請稍後再試');
    }
  };


  const handleUpdateMember = async () => {
    const member = projectDetail.team[selectedMemberIndex];
    try {
      const res = await fetch(`http://localhost:8000/api/projects/${projectId}/update-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: member.id,
          duties: editDuties
        })
      });
      if (!res.ok) throw new Error('更新失敗');

      await fetchTeamMembers();
      setShowPermissionModal(false);
      setSelectedMemberIndex(null);
      setEditDuties([]);
    } catch (err) {
      alert('更新成員失敗，請稍後再試');
    }
  };

  const calculateProjectDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays}天`;
  };

  const getProgressStatus = (progress) => {
    if (progress < 25) return 'low';
    if (progress < 50) return 'medium';
    if (progress < 75) return 'high';
    return 'completed';
  };

  const getProgressStatusText = (progress) => {
    if (progress < 25) return '進度低';
    if (progress < 50) return '進度中';
    if (progress < 75) return '進度高';
    return '已完成';
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
          className={`project-tab ${activeTab === 'checklist' ? 'active' : ''}`}
          onClick={() => setActiveTab('checklist')}
        >
          <FontAwesomeIcon icon={faClipboardCheck} className="me-2" />
          模板進度確認
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
          <div className="edit-project-modal">
            <div className="edit-modal-header">
              <div className="modal-title-section">
                <h5>編輯專案資訊</h5>
                <p className="modal-subtitle">修改專案的基本資訊和設定</p>
              </div>
              <button className="btn-close" onClick={handleCloseEditProjectModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* 標籤導航 */}
            <div className="edit-modal-tabs">
              <div 
                className={`edit-tab ${editTabActive === 'basic' ? 'active' : ''}`}
                onClick={() => setEditTabActive('basic')}
              >
                <FontAwesomeIcon icon={faInfoCircle} className="tab-icon" />
                <span>基本資訊</span>
              </div>
              <div 
                className={`edit-tab ${editTabActive === 'schedule' ? 'active' : ''}`}
                onClick={() => setEditTabActive('schedule')}
              >
                <FontAwesomeIcon icon={faCalendarAlt} className="tab-icon" />
                <span>時程設定</span>
              </div>
              <div 
                className={`edit-tab ${editTabActive === 'progress' ? 'active' : ''}`}
                onClick={() => setEditTabActive('progress')}
              >
                <FontAwesomeIcon icon={faChartLine} className="tab-icon" />
                <span>進度管理</span>
              </div>
            </div>

            <form className="edit-form" onSubmit={handleUpdateProject}>
              <div className="edit-form-content">
                {/* 基本資訊標籤 */}
                {editTabActive === 'basic' && (
                  <div className="tab-content">
                    <div className="form-section">
                      <h6 className="section-title">
                        <FontAwesomeIcon icon={faInfoCircle} className="section-icon" />
                        專案基本資訊
                      </h6>
                      
                      <div className="form-group">
                        <label htmlFor="projectName" className="form-label">
                          專案名稱 <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          id="projectName"
                          name="name"
                          className="form-control modern"
                          value={editProjectForm.name}
                          onChange={handleEditProjectFormChange}
                          placeholder="請輸入專案名稱"
                          required
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-col">
                          <div className="form-group">
                            <label htmlFor="projectStatus" className="form-label">
                              專案狀態 <span className="required">*</span>
                            </label>
                            <div className="select-wrapper">
                              <select
                                id="projectStatus"
                                name="status"
                                className="form-control modern"
                                value={editProjectForm.status}
                                onChange={handleEditProjectFormChange}
                                required
                              >
                                {statusOptions.map(option => (
                                  <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                              </select>
                              <FontAwesomeIcon icon={faChevronDown} className="select-arrow" />
                            </div>
                          </div>
                        </div>
                        <div className="form-col">
                          <div className="form-group">
                            <label htmlFor="certificationAgency" className="form-label">
                              認證機構 <span className="required">*</span>
                            </label>
                            <input
                              type="text"
                              id="certificationAgency"
                              name="agency"
                              className="form-control modern"
                              value={editProjectForm.agency}
                              onChange={handleEditProjectFormChange}
                              placeholder="請輸入認證機構名稱"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="projectManager" className="form-label">
                          專案負責人 <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          id="projectManager"
                          name="manager"
                          className="form-control modern"
                          value={editProjectForm.manager}
                          onChange={handleEditProjectFormChange}
                          placeholder="請輸入負責人姓名"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="projectDescription" className="form-label">
                          專案描述
                        </label>
                        <textarea
                          id="projectDescription"
                          name="description"
                          className="form-control modern"
                          rows="4"
                          value={editProjectForm.description}
                          onChange={handleEditProjectFormChange}
                          placeholder="請描述專案的目標、範圍或特殊要求..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                )}

                {/* 時程設定標籤 */}
                {editTabActive === 'schedule' && (
                  <div className="tab-content">
                    <div className="form-section">
                      <h6 className="section-title">
                        <FontAwesomeIcon icon={faCalendarAlt} className="section-icon" />
                        專案時程規劃
                      </h6>
                      
                      <div className="form-row">
                        <div className="form-col">
                          <div className="form-group">
                            <label htmlFor="startDate" className="form-label">
                              開始日期 <span className="required">*</span>
                            </label>
                            <div className="date-input-wrapper">
                              <input
                                type="date"
                                id="startDate"
                                name="startDate"
                                className="form-control modern"
                                value={editProjectForm.startDate}
                                onChange={handleEditProjectFormChange}
                                required
                              />
                              <FontAwesomeIcon icon={faCalendarAlt} className="date-icon" />
                            </div>
                          </div>
                        </div>
                        <div className="form-col">
                          <div className="form-group">
                            <label htmlFor="endDate" className="form-label">
                              預計結束日期 <span className="required">*</span>
                            </label>
                            <div className="date-input-wrapper">
                              <input
                                type="date"
                                id="endDate"
                                name="endDate"
                                className="form-control modern"
                                value={editProjectForm.endDate}
                                onChange={handleEditProjectFormChange}
                                required
                              />
                              <FontAwesomeIcon icon={faCalendarAlt} className="date-icon" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="schedule-summary">
                        <div className="summary-card">
                          <div className="summary-icon">
                            <FontAwesomeIcon icon={faClock} />
                          </div>
                          <div className="summary-content">
                            <h6>專案時長</h6>
                            <p>{calculateProjectDuration(editProjectForm.startDate, editProjectForm.endDate)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 進度管理標籤 */}
                {editTabActive === 'progress' && (
                  <div className="tab-content">
                    <div className="form-section">
                      <h6 className="section-title">
                        <FontAwesomeIcon icon={faChartLine} className="section-icon" />
                        專案進度設定
                      </h6>
                      
                      <div className="progress-section">
                        <div className="progress-display-large">
                          <div className="progress-circle">
                            <svg className="progress-ring" width="120" height="120">
                              <circle
                                className="progress-ring-bg"
                                stroke="#e9ecef"
                                strokeWidth="8"
                                fill="transparent"
                                r="52"
                                cx="60"
                                cy="60"
                              />
                              <circle
                                className="progress-ring-fill"
                                stroke="#4a6cf7"
                                strokeWidth="8"
                                fill="transparent"
                                r="52"
                                cx="60"
                                cy="60"
                                strokeDasharray={`${2 * Math.PI * 52}`}
                                strokeDashoffset={`${2 * Math.PI * 52 * (1 - editProjectForm.progress / 100)}`}
                              />
                            </svg>
                            <div className="progress-text">
                              <span className="progress-number">{editProjectForm.progress}%</span>
                              <span className="progress-label">完成</span>
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="projectProgress" className="form-label">
                            完成度調整
                          </label>
                          <div className="progress-slider-container">
                            <input
                              type="range"
                              id="projectProgress"
                              name="progress"
                              className="form-range modern"
                              min="0"
                              max="100"
                              step="5"
                              value={editProjectForm.progress}
                              onChange={handleEditProjectFormChange}
                            />
                            <div className="progress-markers">
                              <span>0%</span>
                              <span>25%</span>
                              <span>50%</span>
                              <span>75%</span>
                              <span>100%</span>
                            </div>
                          </div>
                          <div className="progress-help-text">
                            <FontAwesomeIcon icon={faInfoCircle} className="help-icon" />
                            拖動滑桿調整專案完成度，這將影響報表分析的統計結果
                          </div>
                        </div>

                        <div className="progress-status-info">
                          <div className="status-item">
                            <span className="status-label">進度狀態：</span>
                            <span className={`status-badge ${getProgressStatus(editProjectForm.progress)}`}>
                              {getProgressStatusText(editProjectForm.progress)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="edit-form-actions">
                <div className="action-buttons">
                  <button type="button" className="btn btn-outline" onClick={handleCloseEditProjectModal}>
                    <FontAwesomeIcon icon={faTimes} className="btn-icon" />
                    取消
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <FontAwesomeIcon icon={faSave} className="btn-icon" />
                    儲存變更
                  </button>
                </div>
                <div className="form-hint">
                  <FontAwesomeIcon icon={faInfoCircle} className="hint-icon" />
                  變更將立即生效並同步更新相關報表
                </div>
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
                      <option value="excel">Excel試算表</option>
                      <option value="pdf">待開發</option>
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
                      <option value="en">待開發</option>
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
                  value={exportSettings.notes}
                  onChange={handleExportSettingChange}
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
      {showPermissionModal && selectedMemberIndex !== null &&(
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">編輯職責</h5>
                <button type="button" className="btn-close" onClick={handleClosePermissionModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">多重職責（可多選）</label>
                  <input
                    className="form-control"
                    value={editDutiesInput}
                    onChange={e => {
                      const input = e.target.value;
                      setEditDutiesInput(input);
                      setEditDuties(
                        input.split(',').map(s => s.trim()).filter(Boolean)
                      );
                    }}
                    placeholder="以逗號分隔多個職責"
                  />
                  <small className="text-muted">例如：文件管理, 進度追蹤, 審核協助</small>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleClosePermissionModal}>關閉</button>
                <button type="button" className="btn btn-primary" onClick={handleUpdateMember}>儲存</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showAddMemberModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">添加團隊成員</h5>
                <button type="button" className="btn-close" onClick={handleCloseAddMemberModal}></button>
              </div>
              <form onSubmit={handleAddMember}>
                <div className="modal-body">
                  {addMemberError && <div className="alert alert-danger py-2">{addMemberError}</div>}
                  <div className="mb-3">
                    <label className="form-label">選擇用戶</label>
                    <select className="form-select" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} required>
                      <option value="">請選擇</option>
                      {availableUsers.map(u => (
                        <option key={u.id} value={u.id}>{u.name}（{u.position || '無職稱'}）</option>
                      ))}
                    </select>
                  </div>
                  {/* 移除職責欄位 */}
                  <div className="mb-3">
                    <label className="form-label">權限</label>
                    <select className="form-select" value={selectedPermission} onChange={e => setSelectedPermission(e.target.value)} required>
                      <option value="view">僅檢視</option>
                      <option value="edit">可編輯</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">多重職責（可多選）</label>
                    <input
                      className="form-control"
                      value={dutiesInput}
                      onChange={e => {
                        const input = e.target.value;
                        setDutiesInput(input);
                        setSelectedDuties(
                          input.split(',').map(s => s.trim()).filter(Boolean)
                        );
                      }}
                      placeholder="以逗號分隔多個職責"
                    />
                    <small className="text-muted">例如：文件管理, 進度追蹤, 審核協助</small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseAddMemberModal}>取消</button>
                  <button type="submit" className="btn btn-primary" disabled={!selectedUserId}>新增</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificationProjectDetail; 