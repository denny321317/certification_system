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
 * @returns {JSX.Element} 審核與回饋界面
 */
const ReviewFeedback = ({ projectId, projectName }) => {
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
   * 員工視角查看模式
   * @type {[boolean, Function]} [是否為員工視角, 設置視角的函數]
   */
  const [employeeView, setEmployeeView] = useState(false);
  
  /**
   * 待調整問題清單狀態
   * @type {[Array, Function]} [待調整問題清單, 設置待調整問題清單的函數]
   */
  const [adjustmentIssues, setAdjustmentIssues] = useState([]);

  // 模擬從API獲取審核數據
  useEffect(() => {
    // 模擬API延遲
    const timer = setTimeout(() => {
      // 模擬的內部審核數據
      const internalReviewData = {
        status: 'in-progress',
        progress: 65,
        reviewSteps: [
          { name: '初步審核', status: 'completed' },
          { name: '部門主管審核', status: 'completed' },
          { name: '法規符合性審核', status: 'in-progress' },
          { name: '高層決策審核', status: 'pending' }
        ],
        reviews: [
          {
            id: 1,
            reviewer: '林工程師',
            reviewerDepartment: '環境部門',
            date: '2023-09-08',
            status: 'approved',
            comment: '環境管理文件已符合ISO 14001要求，建議進行部分細節優化，如廢棄物管理流程可再詳細說明。',
            issues: [
              { title: '廢棄物分類標示不清', severity: 'medium', status: 'open', deadline: '2023-09-30', deadlineTime: '15:30' },
              { title: '節能措施文件更新', severity: 'low', status: 'closed', deadline: '2023-09-20', deadlineTime: '17:00' }
            ]
          },
          {
            id: 2,
            reviewer: '張協理',
            reviewerDepartment: '人資部門',
            date: '2023-09-12',
            status: 'approved',
            comment: '勞工權益政策符合SMETA標準，但工時記錄系統需要優化，確保可以準確追蹤加班時數。',
            issues: [
              { title: '加班時數追蹤系統不完善', severity: 'high', status: 'open', deadline: '2023-10-15', deadlineTime: '14:00' },
              { title: '員工申訴機制缺乏匿名選項', severity: 'medium', status: 'open', deadline: '2023-10-10', deadlineTime: '16:30' }
            ]
          }
        ]
      };
      
      // 模擬的外部審核數據
      const externalReviewData = {
        status: 'pending',
        progress: 0,
        reviewSteps: [
          { name: '文件預審', status: 'pending' },
          { name: '現場審核', status: 'pending' },
          { name: '不符合項改善', status: 'pending' },
          { name: '認證決定', status: 'pending' }
        ],
        reviews: []
      };
      
      // 根據當前標籤設置審核數據
      setReviewData(activeTab === 'internal' ? internalReviewData : externalReviewData);
      setLoading(false);
      
      // 設置待調整問題清單
      let allIssues = [];
      
      if (activeTab === 'internal') {
        internalReviewData.reviews.forEach(review => {
          if (review.issues && review.issues.length > 0) {
            review.issues.forEach(issue => {
              if (issue.status === 'open') {
                allIssues.push({
                  ...issue,
                  reviewer: review.reviewer,
                  reviewerDepartment: review.reviewerDepartment,
                  reviewDate: review.date,
                  completed: false
                });
              }
            });
          }
        });
      }
      
      setAdjustmentIssues(allIssues);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [activeTab, projectId]);

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
    
    const newIssue = {
      title: newIssueTitle,
      severity: newIssueSeverity,
      status: 'open',
      deadline: newIssueDeadline,
      deadlineTime: newIssueDeadlineTime
    };
    
    setNewIssues([...newIssues, newIssue]);
    setNewIssueTitle('');
    setNewIssueSeverity('medium');
    setNewIssueDeadline('');
    setNewIssueDeadlineTime('17:00');
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
   * 提交新的審核意見
   */
  const handleSubmitFeedback = () => {
    if (newFeedback.trim() === '' || !reviewDecision) return;
    
    setSubmitting(true);
    
    // 模擬API提交
    setTimeout(() => {
      // 創建新的審核記錄
      const newReview = {
        id: Math.floor(Math.random() * 1000),
        reviewer: '當前用戶', // 實際應用中應從用戶會話獲取
        reviewerDepartment: '品質部門', // 實際應用中應從用戶會話獲取
        date: new Date().toISOString().split('T')[0],
        status: reviewDecision,
        comment: newFeedback,
        issues: newIssues
      };
      
      // 更新審核數據
      const updatedReviewData = { ...reviewData };
      updatedReviewData.reviews = [newReview, ...updatedReviewData.reviews];
      
      if (reviewDecision === 'approved') {
        // 如果核准，更新下一步驟為進行中
        const pendingStepIndex = updatedReviewData.reviewSteps.findIndex(step => step.status === 'pending');
        if (pendingStepIndex > 0) {
          updatedReviewData.reviewSteps[pendingStepIndex].status = 'in-progress';
          
          // 將當前進行中的步驟設為已完成
          const inProgressStepIndex = updatedReviewData.reviewSteps.findIndex(step => step.status === 'in-progress');
          if (inProgressStepIndex >= 0) {
            updatedReviewData.reviewSteps[inProgressStepIndex].status = 'completed';
          }
        }
        
        // 更新整體進度
        const completedSteps = updatedReviewData.reviewSteps.filter(step => step.status === 'completed').length;
        const totalSteps = updatedReviewData.reviewSteps.length;
        updatedReviewData.progress = Math.round((completedSteps / totalSteps) * 100);
      }
      
      setReviewData(updatedReviewData);
      setNewFeedback('');
      setReviewDecision('');
      setNewIssues([]);
      setSubmitting(false);
      
      // 更新待調整問題清單
      const newAdjustmentIssues = [...adjustmentIssues];
      newIssues.forEach(issue => {
        if (issue.status === 'open') {
          newAdjustmentIssues.push({
            ...issue,
            reviewer: '當前用戶',
            reviewerDepartment: '品質部門',
            reviewDate: new Date().toISOString().split('T')[0],
            completed: false
          });
        }
      });
      setAdjustmentIssues(newAdjustmentIssues);
    }, 1000);
  };

  /**
   * 切換問題完成狀態
   * @param {number} index - 問題索引
   */
  const handleToggleIssueCompletion = (index) => {
    const updatedIssues = [...adjustmentIssues];
    updatedIssues[index].completed = !updatedIssues[index].completed;
    setAdjustmentIssues(updatedIssues);
  };

  /**
   * 提交問題完成狀態
   */
  const handleSubmitCompletedIssues = () => {
    // 這裡應該有API調用來保存完成狀態
    console.log("儲存完成狀態:", adjustmentIssues);
    alert("已儲存調整進度");
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
    
    const date = new Date(dateString);
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
    
    return (
      <div className="adjustment-checklist">
        {adjustmentIssues.map((issue, index) => (
          <div key={index} className="adjustment-item">
            <div className="adjustment-header">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`issue-${index}`}
                  checked={issue.completed}
                  onChange={() => handleToggleIssueCompletion(index)}
                />
                <label className="form-check-label" htmlFor={`issue-${index}`}>
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
                <span className="review-date">審核日期: {issue.reviewDate}</span>
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
        ))}
        
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
                          <div className="review-date">{review.date}</div>
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