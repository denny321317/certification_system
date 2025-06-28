/**
 * 創建認證項目頁面
 * 
 * 此組件提供創建新認證項目的表單，用戶可填寫基本信息並提交。
 * 
 * 特點:
 * - 完整表單驗證
 * - 支持多種認證類型選擇
 * - 項目時程設置
 * - 團隊成員和責任人分配
 * - 認證機構選擇
 * 
 * 使用方式:
 * ```jsx
 * <CreateCertificationProject />
 * ```
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, faSave, faTimes, faExclamationCircle,
  faCalendarAlt, faUser, faBuilding, faClipboardCheck, faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import './CreateCertificationProject.css';

/**
 * 創建認證項目頁面組件
 * @returns {JSX.Element} 創建認證項目表單界面
 */
const CreateCertificationProject = () => {
  const navigate = useNavigate();
  
  /**
   * 表單數據狀態
   * @type {[Object, Function]} [表單數據, 設置表單數據的函數]
   */
  const [formData, setFormData] = useState({
    name: '',
    certType: '',
    status: 'preparing',
    startDate: '',
    endDate: '',
    internalReviewDate: '',
    externalReviewDate: '',
    manager: '',
    agency: '',
    description: ''
  });
  
  /**
   * 表單驗證錯誤狀態
   * @type {[Object, Function]} [表單錯誤, 設置表單錯誤的函數]
   */
  const [formErrors, setFormErrors] = useState({});
  
  /**
   * 提交狀態
   * @type {[boolean, Function]} [是否提交中, 設置提交狀態的函數]
   */
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 認證類型選項
   * @type {Array<{id: string, name: string}>}
   */
  const certificationTypes = [
    { id: 'smeta', name: 'SMETA 4支柱認證' },
    { id: 'iso9001', name: 'ISO 9001 品質管理系統' },
    { id: 'iso14001', name: 'ISO 14001 環境管理系統' },
    { id: 'iso45001', name: 'ISO 45001 職業安全衛生' },
    { id: 'sa8000', name: 'SA8000 社會責任認證' },
    { id: 'bsci', name: 'BSCI 商業社會責任認證' },
    { id: 'fsc', name: 'FSC 森林管理委員會認證' },
    { id: 'other', name: '其他認證' }
  ];

  /**
   * 認證機構選項
   * @type {Array<{id: string, name: string}>}
   */
  const certificationAgencies = [
    { id: 'sgs', name: 'SGS Taiwan' },
    { id: 'bsi', name: 'BSI Taiwan' },
    { id: 'tuv', name: 'TÜV Rheinland' },
    { id: 'bureau', name: 'Bureau Veritas' },
    { id: 'intertek', name: 'Intertek' },
    { id: 'dekra', name: 'DEKRA' },
    { id: 'other', name: '其他機構' }
  ];

  /**
   * 負責人選項
   * @type {Array<{id: number, name: string, position: string}>}
   */
  const [users, setUsers] = useState([]);

    // 取得 user list
    useEffect(() => {
      fetch('http://localhost:8000/api/users/all')
        .then(res => res.json())
        .then(data => setUsers(data))
        .catch(err => {
          // 可以加個錯誤提示
          console.error('取得用戶列表失敗', err);
        });
    }, []);  


  /**
   * 處理表單輸入變更
   * @param {Event} e - 事件對象
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // 清除對應欄位的錯誤信息
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  /**
   * 驗證表單數據
   * @returns {boolean} 驗證結果
   */
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = '請輸入專案名稱';
    }
    
    if (!formData.certType) {
      errors.certType = '請選擇認證類型';
    }
    
    if (!formData.startDate) {
      errors.startDate = '請設定開始日期';
    }
    
    if (!formData.endDate) {
      errors.endDate = '請設定預計完成日期';
    } else if (formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      errors.endDate = '完成日期不能早於開始日期';
    }
    
    if (formData.internalReviewDate && formData.startDate && 
        new Date(formData.internalReviewDate) < new Date(formData.startDate)) {
      errors.internalReviewDate = '內部審核日期不能早於開始日期';
    }
    
    if (formData.externalReviewDate && formData.startDate && 
        new Date(formData.externalReviewDate) < new Date(formData.startDate)) {
      errors.externalReviewDate = '外部審核日期不能早於開始日期';
    }
    /*
    if (!formData.manager) {
      errors.manager = '請選擇專案負責人';
    }
    */
    
    if (!formData.agency) {
      errors.agency = '請選擇認證機構';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * 處理表單提交
   * @param {Event} e - 事件對象
   */
    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:8000/api/projects/CreateProject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      console.log(formData)

      if (!response.ok) {
        throw new Error('伺服器回傳錯誤');
      }

      const result = await response.json();
      console.log('提交的表單數據:', result);

      // 可選：清空表單
      // setFormData({ projectName: '', description: '', status: '' });

      // 提交成功後導航
      navigate('/certification-projects');
    } catch (error) {
      console.error('提交表單時發生錯誤:', error);
      setFormErrors({
        ...formErrors,
        submit: '提交失敗，請稍後再試'
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  /**
   * 處理取消操作
   */
  const handleCancel = () => {
    navigate('/certification-projects');
  };

  return (
    <div className="create-certification-project">
      <div className="page-header">
        <button className="btn btn-link back-button" onClick={handleCancel}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          返回項目列表
        </button>
        <h4>創建新認證專案</h4>
      </div>
      
      <div className="project-form-container">
        <form className="project-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h5 className="section-title">基本信息</h5>
            
            <div className="form-group">
              <label htmlFor="name">
                專案名稱 <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                placeholder="輸入認證專案名稱"
              />
              {formErrors.name && (
                <div className="invalid-feedback">
                  <FontAwesomeIcon icon={faExclamationCircle} className="me-1" />
                  {formErrors.name}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="certType">
                認證類型 <span className="required">*</span>
              </label>
              <select
                id="certType"
                name="certType"
                value={formData.certType}
                onChange={handleInputChange}
                className={`form-control ${formErrors.certType ? 'is-invalid' : ''}`}
              >
                <option value="">選擇認證類型</option>
                {certificationTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {formErrors.certType && (
                <div className="invalid-feedback">
                  <FontAwesomeIcon icon={faExclamationCircle} className="me-1" />
                  {formErrors.certType}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="description">專案描述</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-control"
                rows="4"
                placeholder="輸入專案描述與目標..."
              ></textarea>
            </div>
          </div>
          
          <div className="form-section">
            <h5 className="section-title">時程信息</h5>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">
                  開始日期 <span className="required">*</span>
                </label>
                <div className="input-with-icon">
                  <FontAwesomeIcon icon={faCalendarAlt} className="input-icon" />
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`form-control ${formErrors.startDate ? 'is-invalid' : ''}`}
                  />
                </div>
                {formErrors.startDate && (
                  <div className="invalid-feedback">
                    <FontAwesomeIcon icon={faExclamationCircle} className="me-1" />
                    {formErrors.startDate}
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="endDate">
                  預計完成日期 <span className="required">*</span>
                </label>
                <div className="input-with-icon">
                  <FontAwesomeIcon icon={faCalendarAlt} className="input-icon" />
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`form-control ${formErrors.endDate ? 'is-invalid' : ''}`}
                  />
                </div>
                {formErrors.endDate && (
                  <div className="invalid-feedback">
                    <FontAwesomeIcon icon={faExclamationCircle} className="me-1" />
                    {formErrors.endDate}
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="internalReviewDate">內部審核日期</label>
                <div className="input-with-icon">
                  <FontAwesomeIcon icon={faClipboardCheck} className="input-icon" />
                  <input
                    type="date"
                    id="internalReviewDate"
                    name="internalReviewDate"
                    value={formData.internalReviewDate}
                    onChange={handleInputChange}
                    className={`form-control ${formErrors.internalReviewDate ? 'is-invalid' : ''}`}
                  />
                </div>
                {formErrors.internalReviewDate && (
                  <div className="invalid-feedback">
                    <FontAwesomeIcon icon={faExclamationCircle} className="me-1" />
                    {formErrors.internalReviewDate}
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="externalReviewDate">外部審核日期</label>
                <div className="input-with-icon">
                  <FontAwesomeIcon icon={faFileAlt} className="input-icon" />
                  <input
                    type="date"
                    id="externalReviewDate"
                    name="externalReviewDate"
                    value={formData.externalReviewDate}
                    onChange={handleInputChange}
                    className={`form-control ${formErrors.externalReviewDate ? 'is-invalid' : ''}`}
                  />
                </div>
                {formErrors.externalReviewDate && (
                  <div className="invalid-feedback">
                    <FontAwesomeIcon icon={faExclamationCircle} className="me-1" />
                    {formErrors.externalReviewDate}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h5 className="section-title">責任與機構</h5>
            
            <div className="form-group">
              <label htmlFor="manager">
                專案負責人
              </label>
              <div className="input-with-icon">
                <FontAwesomeIcon icon={faUser} className="input-icon" />
                <select
                  id="manager"
                  name="manager"
                  value={formData.manager}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="">選擇專案負責人</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.position || '無職稱'})
                    </option>
                  ))}
                </select>
              </div>
              {formErrors.manager && (
                <div className="invalid-feedback">
                  <FontAwesomeIcon icon={faExclamationCircle} className="me-1" />
                  {formErrors.manager}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="agency">
                認證機構 <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <FontAwesomeIcon icon={faBuilding} className="input-icon" />
                <select
                  id="agency"
                  name="agency"
                  value={formData.agency}
                  onChange={handleInputChange}
                  className={`form-control ${formErrors.agency ? 'is-invalid' : ''}`}
                >
                  <option value="">選擇認證機構</option>
                  {certificationAgencies.map(agency => (
                    <option key={agency.id} value={agency.name}>
                      {agency.name}
                    </option>
                  ))}
                </select>
              </div>
              {formErrors.agency && (
                <div className="invalid-feedback">
                  <FontAwesomeIcon icon={faExclamationCircle} className="me-1" />
                  {formErrors.agency}
                </div>
              )}
            </div>
          </div>
          
          {formErrors.submit && (
            <div className="alert alert-danger">{formErrors.submit}</div>
          )}
          
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <FontAwesomeIcon icon={faTimes} className="me-2" />
              取消
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              <FontAwesomeIcon icon={faSave} className="me-2" />
              {isSubmitting ? '儲存中...' : '儲存專案'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCertificationProject; 