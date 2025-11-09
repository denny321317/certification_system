/**
 * 審核與回饋組件
 * 
 * 此組件提供認證項目的審核與回饋功能，包括內部團隊審核和外部認證機構審核。
 * 用戶可以查看歷史審核記錄、提交新的審核意見、追蹤審核進度。
 * 還提供員工查看審核結果及問題清單，並可標記已完成的調整項目。
 * 
 * 特點:
 * - 支持內部團隊與外部認證機構的多重審核流程
 * - 時間軸形式展示審核歷史記錄
 * - 問題分類與標籤管理
 * - 詳細的審核意見與回饋提交
 * - 員工可查看待調整項目清單與截止日期並標記完成情況
 * 
 * 使用方式:
 * ```jsx
 * <ReviewFeedback projectId={1} projectName="SMETA 4支柱認證" />
 * ```
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, faTimes, faInfoCircle, faExclamationTriangle, 
  faCircle, faCheckCircle, faExclamationCircle, faClock, faUser,
  faListCheck, faCheckSquare, faFileAlt, faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import './ReviewFeedback.css';

/**
 * 審核與回饋組件
 * @param {Object} props - 組件屬性
 * @param {number|string} props.projectId - 項目ID
 * @param {string} props.projectName - 項目名稱
 * @param {Array} props.requirements - 模板要求
 * @returns {JSX.Element} 審核與回饋界面
 */
const ReviewFeedback = ({ projectId, projectName, requirements }) => {
  /**
   * 當前選中的審核標籤
   * @type {[string, Function]} [當前審核標籤, 設置當前審核標籤的函數]
   */
  const [activeTab, setActiveTab] = useState('internal');
  
  /**
   * 審核詳情數據
   * @type {[Object, Function]} [審核詳情, 設置審核詳情的函數]
   */
  const [reviewData, setReviewData] = useState(null);
  
  /**
   * 加載狀態
   * @type {[boolean, Function]} [是否加載中, 設置加載狀態的函數]
   */
  const [loading, setLoading] = useState(true);
  
  /**
   * 新審核意見内容
   * @type {[string, Function]} [審核意見, 設置審核意見的函數]
   */
  const [newFeedback, setNewFeedback] = useState('');
  
  /**
   * 審核決定狀態
   * @type {[string, Function]} [審核決定, 設置審核決定的函數]
   */
  const [reviewDecision, setReviewDecision] = useState('');
  
  /**
   * 提交審核反饋的加載狀態
   * @type {[boolean, Function]} [是否提交中, 設置提交狀態的函數]
   */
  const [submitting, setSubmitting] = useState(false);

  /**
   * 問題重要性選項
   * @type {Array<{id: string, label: string, severity: string}>}
   */
  const severityOptions = [
    { id: 'high', label: '重要', severity: 'high' },
    { id: 'medium', label: '一般', severity: 'medium' },
    { id: 'low', label: '輕微', severity: 'low' }
  ];
  
  /**
   * 新問題狀態
   * @type {[Array, Function]} [問題列表, 設置問題列表的函數]
   */
  const [newIssues, setNewIssues] = useState([]);
  
  /**
   * 新問題標題
   * @type {[string, Function]} [問題標題, 設置問題標題的函數]
   */
  const [newIssueTitle, setNewIssueTitle] = useState('');
  
  /**
   * 新問題嚴重度
   * @type {[string, Function]} [問題嚴重度, 設置問題嚴重度的函數]
   */
  const [newIssueSeverity, setNewIssueSeverity] = useState('medium');
  
  /**
   * 新問題截止日期
   * @type {[string, Function]} [截止日期, 設置截止日期的函數] 
   */
  const [newIssueDeadline, setNewIssueDeadline] = useState('');
  
  /**
   * 新問題截止時間
   * @type {[string, Function]} [截止時間, 設置截止時間的函數] 
   */
  const [newIssueDeadlineTime, setNewIssueDeadlineTime] = useState('17:00');

  /**
   * 新問題關聯的指標 ID
   * @type {[string, Function]} [指標ID, 設置指標ID的函數]
   */
  const [selectedIndicatorId, setSelectedIndicatorId] = useState('');

  /**
   * 新問題關聯的文件 ID
   * @type {[string, Function]} [文件ID, 設置文件ID的函數]
   */
  const [selectedDocumentId, setSelectedDocumentId] = useState('');

  /**
   * 員工視角查看模式
   * @type {[boolean, Function]} [是否為員工視角, 設置視角的函數]
   */
  const [employeeView, setEmployeeView] = useState(false);
  
  /**
   * 待調整問題清單狀態
   * @type {[Array, Function]} [待調整問題清單, 設置待調整問題清單的函數]
   */
  const [adjustmentIssues, setAdjustmentIssues] = useState([]);

  // 從API獲取審核數據
  useEffect(() => {
    const fetchReviewData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/projects/${projectId}/reviews?type=${activeTab}`);
        if (!response.ok) {
          throw new Error('無法獲取審核數據');
        }
        const data = await response.json();
        setReviewData(data);
      } catch (error) {
        console.error("獲取審核數據失敗:", error);
        setReviewData({ reviews: [] });
      } finally {
        setLoading(false);
      }
    };

    // 當 employeeView 為 true 時，獲取所有待辦事項
    const fetchAllAdjustmentIssues = async () => {
      setLoading(true);
      try {
        const [internalResponse, externalResponse] = await Promise.all([
          fetch(`http://localhost:8000/api/projects/${projectId}/reviews?type=internal`),
          fetch(`http://localhost:8000/api/projects/${projectId}/reviews?type=external`)
        ]);

        if (!internalResponse.ok || !externalResponse.ok) {
          throw new Error('無法獲取待調整事項');
        }

        const internalData = await internalResponse.json();
        const externalData = await externalResponse.json();

        const processIssues = (data, type) => {
          let issues = [];
          if (data && data.reviews) {
            data.reviews.forEach(review => {
              if (review.issues && review.issues.length > 0) {
                review.issues.forEach(issue => {
                  issues.push({
                    ...issue,
                    reviewer: review.reviewer,
                    reviewerDepartment: review.reviewerDepartment,
                    reviewDate: review.date,
                    completed: issue.status === 'closed', // 根據後端狀態設定是否勾選
                    source: type // 添加來源標記
                  });
                });
              }
            });
          }
          return issues;
        };

        const internalIssues = processIssues(internalData, 'internal');
        const externalIssues = processIssues(externalData, 'external');
        
        setAdjustmentIssues([...internalIssues, ...externalIssues]);

      } catch (error) {
        console.error("獲取待調整事項失敗:", error);
        setAdjustmentIssues([]);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      if (employeeView) {
        fetchAllAdjustmentIssues();
      } else {
        fetchReviewData();
      }
    }
  }, [activeTab, projectId, employeeView]);

  /**
   * 處理審核標籤切換
   * @param {string} tab - 標籤名稱
   */
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setLoading(true);
    setEmployeeView(false);
  };

  /**
   * 添加問題到新問題列表
   */
  const handleAddIssue = () => {
    if (newIssueTitle.trim() === '') return;
    
    // 找出選擇的指標與文件文字
    const indicator = requirements?.find(i => String(i.id) === String(selectedIndicatorId));
    const document = indicator?.documents.find(d => String(d.id) === String(selectedDocumentId));

    const newIssue = {
      title: newIssueTitle,
      severity: newIssueSeverity,
      status: 'open',
      deadline: newIssueDeadline,
      deadlineTime: newIssueDeadlineTime,
      indicatorId: selectedIndicatorId || null,
      documentId: selectedDocumentId || null,
      indicatorText: indicator ? indicator.text : '',
      documentText: document ? document.text : ''
    };
    
    setNewIssues([...newIssues, newIssue]);
    setNewIssueTitle('');
    setNewIssueSeverity('medium');
    setNewIssueDeadline('');
    setNewIssueDeadlineTime('17:00');
    setSelectedIndicatorId('');
    setSelectedDocumentId('');
  };

  /**
   * 從新問題列表中刪除問題
   * @param {number} index - 問題索引
   */
  const handleRemoveIssue = (index) => {
    const updatedIssues = [...newIssues];
    updatedIssues.splice(index, 1);
    setNewIssues(updatedIssues);
  };

  /**
   * 提交審核反饋
   */
  const handleSubmitFeedback = async () => {
    if (!reviewDecision || newFeedback.trim() === '') {
      alert('請選擇審核決定並填寫審核意見。');
      return;
    }
    
    // 驗證邏輯：如果存在問題，則不允許審核通過
    if (reviewDecision === 'approved' && newIssues.length > 0) {
      alert('尚有未解決的問題，無法核准通過。');
      return;
    }

    setSubmitting(true);

    const feedbackData = {
      // 這邊先暫時寫死審核員資訊，未來應從用戶登入資訊獲取
      reviewerName: '王經理', 
      reviewerDepartment: '管理部',
      reviewType: activeTab,
      decision: reviewDecision,
      comment: newFeedback,
      issues: newIssues.map(issue => ({
        title: issue.title,
        severity: issue.severity,
        status: 'open',
        deadline: issue.deadline && issue.deadlineTime 
            ? `${issue.deadline}T${issue.deadlineTime}:00` 
            : null
      }))
    };

    try {
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '提交審核失敗');
      }

      const newReview = await response.json();

      // 提交成功後，直接使用後端返回的數據更新狀態，確保ID和Date的正確性
      setReviewData(prevData => ({
        ...prevData,
        reviews: [...(prevData?.reviews || []), newReview]
      }));

      // 清空表單
      setNewFeedback('');
      setNewIssues([]);
      setReviewDecision('');
      alert('審核意見提交成功！');

    } catch (error) {
      console.error('提交審核失敗:', error);
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 切換問題完成狀態
   * @param {number} issueId - 問題ID
   */
  const handleToggleIssueCompletion = (issueId) => {
    setAdjustmentIssues(prevIssues =>
      prevIssues.map(issue =>
        issue.id === issueId ? { ...issue, completed: !issue.completed } : issue
      )
    );
  };

  /**
   * 提交問題完成狀態
   */
  const handleSubmitCompletedIssues = async () => {
    const issuesToUpdate = adjustmentIssues.map(issue => ({
      id: issue.id,
      completed: issue.completed
    }));

    try {
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/issues/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(issuesToUpdate),
      });

      if (!response.ok) {
        throw new Error('儲存調整進度失敗');
      }

      alert("已儲存調整進度");
    } catch (error) {
      console.error("儲存調整進度失敗:", error);
      alert(error.message);
    }
  };

  /**
   * 計算截止日期狀態
   * @param {string} deadline - 截止日期
   * @returns {string} 狀態類別名稱
   */
  const getDeadlineStatus = (deadline) => {
    if (!deadline) return '';
    
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 3) return 'urgent';
    if (diffDays <= 7) return 'approaching';
    return 'normal';
  };

  /**
   * 格式化日期顯示
   * @param {string} dateString - 日期字串
   * @returns {string} 格式化後的日期
   */
  const formatDate = (dateString) => {
    if (!dateString) return '未設定';

    let date;
    if (Array.isArray(dateString)) {
      // 處理 [年, 月, 日, 時, 分] 格式
      const [year, month, day] = dateString;
      // JavaScript 的月份是 0-11，所以需要 month - 1
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(dateString);
    }

    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return '無效日期';
    }
    
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * 格式化日期與時間顯示
   * @param {string} dateString - 日期字串
   * @param {string} timeString - 時間字串
   * @returns {string} 格式化後的日期與時間
   */
  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return '未設定';
    
    const formattedDate = formatDate(dateString);
    return timeString ? `${formattedDate} ${timeString}` : formattedDate;
  };

  /**
   * 渲染問題標籤
   * @param {Array} issues - 問題列表
   * @returns {JSX.Element} 問題標籤列表
   */
  const renderIssues = (issues) => {
    if (!issues || issues.length === 0) return null;
    
    return (
      <div className="review-issues">
        <div className="issues-title">發現問題:</div>
        <div className="issues-list">
          {issues.map((issue, index) => (
            <div key={index} className={`issue-tag issue-${issue.severity}`}>
              {issue.severity === 'high' && <FontAwesomeIcon icon={faExclamationTriangle} />}
              {issue.severity === 'medium' && <FontAwesomeIcon icon={faExclamationCircle} />}
              {issue.severity === 'low' && <FontAwesomeIcon icon={faInfoCircle} />}
              <span className="issue-title">{issue.title}</span>
              {issue.indicatorText && (
                <span className="issue-template-link">
                   ({issue.indicatorText}{issue.documentText ? ` -> ${issue.documentText}` : ''})
                </span>
              )}
              {issue.deadline && (
                <span className="issue-deadline">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                  {formatDateTime(issue.deadline, issue.deadlineTime)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * 渲染員工視角的問題調整清單
   * @returns {JSX.Element} 問題調整清單
   */
  const renderAdjustmentChecklist = () => {
    if (adjustmentIssues.length === 0) {
      return (
        <div className="empty-issues-message">
          目前沒有需要調整的問題。
        </div>
      );
    }

    const internalIssues = adjustmentIssues.filter(issue => issue.source === 'internal');
    const externalIssues = adjustmentIssues.filter(issue => issue.source === 'external');

    const renderIssueList = (issues) => {
      return issues.map((issue, index) => (
        <div key={issue.id} className="adjustment-item">
          <div className="adjustment-header">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id={`issue-${issue.id}`}
                checked={issue.completed}
                onChange={() => handleToggleIssueCompletion(issue.id)}
              />
              <label className="form-check-label" htmlFor={`issue-${issue.id}`}>
                <span className={`issue-title ${issue.completed ? 'completed' : ''}`}>
                  {issue.title}
                  <span className={`issue-badge issue-${issue.severity}`}>
                    {issue.severity === 'high' && '重要'}
                    {issue.severity === 'medium' && '一般'}
                    {issue.severity === 'low' && '輕微'}
                  </span>
                </span>
              </label>
            </div>
          </div>
          <div className="adjustment-details">
            <div className="adjustment-meta">
              <span className="reviewer-info">審核人: {issue.reviewer} ({issue.reviewerDepartment})</span>
              <span className="review-date">審核日期: {formatDate(issue.reviewDate)}</span>
              {issue.deadline && (
                <span className={`deadline-info deadline-${getDeadlineStatus(issue.deadline)}`}>
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                  改善期限: {formatDateTime(issue.deadline, issue.deadlineTime)}
                </span>
              )}
            </div>
            {issue.completed && (
              <div className="completion-status">
                <FontAwesomeIcon icon={faCheckCircle} className="text-success me-1" />
                已完成調整
              </div>
            )}
          </div>
        </div>
      ));
    };
    
    return (
      <div className="adjustment-checklist">
        {internalIssues.length > 0 && (
          <div className="issue-group">
            <h6 className="issue-group-title">內部團隊審核問題</h6>
            {renderIssueList(internalIssues)}
          </div>
        )}

        {externalIssues.length > 0 && (
          <div className="issue-group">
            <h6 className="issue-group-title">外部認證機構審核問題</h6>
            {renderIssueList(externalIssues)}
          </div>
        )}
        
        <button 
          className="btn btn-primary mt-3"
          onClick={handleSubmitCompletedIssues}
        >
          <FontAwesomeIcon icon={faCheckSquare} className="me-2" />
          儲存調整進度
        </button>
      </div>
    );
  };

  return (
    <div className="review-feedback-container">
      <div className="review-tabs">
        <div 
          className={`review-tab ${activeTab === 'internal' && !employeeView ? 'active' : ''}`}
          onClick={() => {setActiveTab('internal'); setEmployeeView(false);}}
        >
          內部團隊審核
        </div>
        <div 
          className={`review-tab ${activeTab === 'external' && !employeeView ? 'active' : ''}`}
          onClick={() => {setActiveTab('external'); setEmployeeView(false);}}
        >
          外部認證機構審核
        </div>
        <div 
          className={`review-tab ${employeeView ? 'active' : ''}`}
          onClick={() => setEmployeeView(true)}
        >
          <FontAwesomeIcon icon={faListCheck} className="me-2" />
          待調整事項
        </div>
      </div>
      
      {loading ? (
        <div className="loading-spinner">載入中...</div>
      ) : employeeView ? (
        <div className="employee-view">
          <div className="card">
            <div className="card-body">
              <h5 className="section-title mb-4">
                <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                待調整事項清單
              </h5>
              {renderAdjustmentChecklist()}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="review-history">
            <h5 className="section-title">
              {activeTab === 'internal' ? '內部審核歷史記錄' : '外部審核歷史記錄'}
              <span className="ms-2">
                {reviewData.status === 'completed' && (
                  <span className="status-badge approved">已完成</span>
                )}
                {reviewData.status === 'in-progress' && (
                  <span className="status-badge in-progress">進行中</span>
                )}
                {reviewData.status === 'pending' && (
                  <span className="status-badge pending">未開始</span>
                )}
              </span>
            </h5>
            
            {reviewData.reviews.length === 0 ? (
              <div className="empty-review-message">
                {activeTab === 'internal' 
                  ? '尚未有內部審核記錄。開始審核流程以添加記錄。' 
                  : '尚未有外部認證機構審核記錄。外部審核將在內部審核完成後進行。'}
              </div>
            ) : (
              <div className="timeline">
                {reviewData.reviews.map((review, index) => (
                  <div className="timeline-item" key={review.id}>
                    <div className="timeline-point"></div>
                    <div className="timeline-content">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <div className="reviewer-name">
                            <FontAwesomeIcon icon={faUser} className="me-2" />
                            {review.reviewer}
                          </div>
                          <div className="reviewer-dept">{review.reviewerDepartment}</div>
                        </div>
                        <div className="review-meta">
                          <div className="review-date">{formatDate(review.date)}</div>
                          <div className={`review-status ${review.status}`}>
                            {review.status === 'approved' && '已核准'}
                            {review.status === 'rejected' && '未核准'}
                            {review.status === 'in-progress' && '審核中'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="review-comment">
                        {review.comment}
                      </div>
                      
                      {renderIssues(review.issues)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="new-feedback">
            <h5 className="section-title">提交審核意見</h5>
            
            <div className="form-group">
              <label htmlFor="reviewComment">審核意見</label>
              <textarea 
                id="reviewComment"
                className="form-control"
                rows="4"
                placeholder="請輸入您的審核意見..."
                value={newFeedback}
                onChange={(e) => setNewFeedback(e.target.value)}
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>添加發現的問題</label>
              <div className="issue-inputs">
                <div className="input-group mb-2">
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="問題描述"
                    value={newIssueTitle}
                    onChange={(e) => setNewIssueTitle(e.target.value)}
                  />
                  <select 
                    className="form-select"
                    value={newIssueSeverity}
                    onChange={(e) => setNewIssueSeverity(e.target.value)}
                    style={{ maxWidth: '120px' }}
                  >
                    {severityOptions.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="input-group mb-2">
                  <select 
                    className="form-select"
                    value={selectedIndicatorId}
                    onChange={(e) => {
                      setSelectedIndicatorId(e.target.value);
                      setSelectedDocumentId(''); // 當指標變更時，重置文件選項
                    }}
                  >
                    <option value="">選擇相關指標 (可選)</option>
                    {requirements && requirements.map(indicator => (
                      <option key={indicator.id} value={indicator.id}>
                        {indicator.text}
                      </option>
                    ))}
                  </select>

                  <select 
                    className="form-select"
                    value={selectedDocumentId}
                    onChange={(e) => setSelectedDocumentId(e.target.value)}
                    disabled={!selectedIndicatorId}
                  >
                    <option value="">選擇相關文件 (可選)</option>
                    {selectedIndicatorId && requirements && requirements
                      .find(indicator => String(indicator.id) === String(selectedIndicatorId))
                      ?.documents.map(doc => (
                        <option key={doc.id} value={doc.id}>
                          {doc.text}
                        </option>
                    ))}
                  </select>
                </div>

                <div className="deadline-inputs">
                  <div className="input-group mb-1">
                    <span className="input-group-text">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                    </span>
                    <input 
                      type="date"
                      className="form-control"
                      placeholder="調整截止日期"
                      value={newIssueDeadline}
                      onChange={(e) => setNewIssueDeadline(e.target.value)}
                    />
                    <input 
                      type="time"
                      className="form-control"
                      value={newIssueDeadlineTime}
                      onChange={(e) => setNewIssueDeadlineTime(e.target.value)}
                    />
                    <button 
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={handleAddIssue}
                    >
                      添加
                    </button>
                  </div>
                  <div className="deadline-help-text">
                    <small className="text-muted">*截止日期和時間表示問題必須完成改善的最終期限</small>
                  </div>
                </div>
              </div>
              
              {newIssues.length > 0 && (
                <div className="new-issues-list mb-3">
                  {newIssues.map((issue, index) => (
                    <div key={index} className="new-issue-item">
                      <div className={`issue-tag issue-${issue.severity}`}>
                        {issue.severity === 'high' && <FontAwesomeIcon icon={faExclamationTriangle} />}
                        {issue.severity === 'medium' && <FontAwesomeIcon icon={faExclamationCircle} />}
                        {issue.severity === 'low' && <FontAwesomeIcon icon={faInfoCircle} />}
                        <span className="issue-title">{issue.title}</span>
                        {issue.deadline && (
                          <span className="deadline-info">
                            <FontAwesomeIcon icon={faCalendarAlt} className="ms-2 me-1" />
                            {formatDateTime(issue.deadline, issue.deadlineTime)}
                          </span>
                        )}
                      </div>
                      <button 
                        className="btn btn-sm btn-link text-danger"
                        onClick={() => handleRemoveIssue(index)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label>審核決定</label>
              <div className="review-decisions">
                <button 
                  className={`btn ${reviewDecision === 'approved' ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => setReviewDecision('approved')}
                >
                  <FontAwesomeIcon icon={faCheck} className="me-2" />
                  核准通過
                </button>
                <button 
                  className={`btn ${reviewDecision === 'rejected' ? 'btn-danger' : 'btn-outline-danger'}`}
                  onClick={() => setReviewDecision('rejected')}
                >
                  <FontAwesomeIcon icon={faTimes} className="me-2" />
                  不核准
                </button>
              </div>
            </div>
            
            <div className="mt-3">
              <button 
                className="btn btn-primary"
                disabled={!newFeedback.trim() || !reviewDecision || submitting}
                onClick={handleSubmitFeedback}
              >
                {submitting ? '提交中...' : '提交審核意見'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReviewFeedback; 