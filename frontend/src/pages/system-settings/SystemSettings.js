/**
 * 系統設置組件
 * 
 * 此組件提供企業認證系統的系統設置功能，包含：
 * 1. 基本設定（系統名稱、語言、時區等）
 * 2. 安全設定（密碼政策、登入安全等）
 * 3. 通知設定（郵件通知、系統通知等）
 * 4. 備份與還原（自動備份、系統還原等）
 * 5. API設定（API金鑰、請求限制等）
 * 6. 稽核日誌（系統操作記錄）
 * 
 * 特點：
 * - 分頁式設置界面
 * - 即時設置保存
 * - 完整的安全配置
 * - 自動備份機制
 * - API訪問控制
 * - 操作日誌追蹤
 * 
 * 使用方式：
 * ```jsx
 * <SystemSettings />
 * ```
 */

import React, { useContext, useState, useRef } from 'react';
import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { 
  faGear, faShieldHalved, faBell, faCloudArrowUp, 
  faCode, faBook, faCheckCircle, faClipboard, faKey, faTrash
} from '@fortawesome/free-solid-svg-icons';
import './SystemSettings.css';

/**
 * 來自其他 .js 檔
 */
import { AuthContext } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext'
import { Link } from 'react-router-dom';

/**
 * 系統設置組件
 * @returns {JSX.Element} 系統設置界面
 */
const SystemSettings = () => {

  const { currentUser } = useContext(AuthContext);

  /**
   * 當前選中的設置標籤
   * @type {[string, Function]} [當前標籤, 設置當前標籤的函數]
   */
  const [activeTab, setActiveTab] = useState('general');

  const {settings, loading: settingsLoading, refreshSettings } = useSettings();

  /**
   * 處理基本設定
   */
  const [generalSettings, setGeneralSettings] = useState(settings);
  const [generalLoading, setGeneralLoading] = useState(false);

  /**
   * 處理通知設定
   */
  const [notificationSettings, setNotificationSettings] = useState({
    certificationExpireNotice: true,
    daysBeforeExpirarySendNotice: 90,
    newProjectNotice: true,
    documentUpdateNotice: true,
    missionAssignmentNotice: true,
    commentAndReplyNotice: true
  });
  const [notificationLoading, setNotificationLoading] = useState(false);

  /**
   * 當前頁碼（用於稽核日誌分頁）
   * @type {[number, Function]} [當前頁碼, 設置頁碼的函數]
   */
  const [currentPage, setCurrentPage] = useState(1);

  /**
   * 處理分頁變更
   * @param {number} newPage - 新的頁碼
   */
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

    /**
   * 處理安全設定
   */
  const [securitySettings, setSecuritySettings] = useState({
    requireMinLength: true,
    minLength: 8,
    requireUpperLowerCase: true,
    requireNumber: true,
    requireSpecialChar: true,
    enableTwoFactor: false,
    maxLoginAttempts: 5,
    sessionTimeoutMinuites: 30
  });
  const [securityLoading, setSecurityLoading] = useState(false);

  /** 處理備份設定 */
  const [backupSettings, setBackupSettings] = useState({
    autoBackupInterval: 1,
    daysBeforeDelete: 30,
    lastBackupTime: null
  });
  const [backupSettingsLoading, setBackupSettingsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'security') {
      setSecurityLoading(true);
      fetch(`http://localhost:8000/api/security-settings/getSettings`)
        .then(res => res.json())
        .then(data => {
          setSecuritySettings(data);
          setSecurityLoading(false);
        })
        .catch(() => setSecurityLoading(false));
    } else if (activeTab === 'general') {
      setGeneralLoading(true);
      fetch(`http://localhost:8000/api/general-settings`)
        .then(res => res.json())
        .then(data => {
          setGeneralSettings(data);
          setGeneralLoading(false);
        })
        .catch(() => setGeneralLoading(false));
    } else if (activeTab === 'notification') {
      setNotificationLoading(true);
      fetch(`http://localhost:8000/api/notification-settings/getSettings`)
        .then(res => res.json())
        .then(data => {
          setNotificationSettings(data);
          setNotificationLoading(false);
        })
        .catch(() => setNotificationLoading(false));
    } else if (activeTab === 'backup') {
      setBackupSettingsLoading(true);
      fetch(`http://localhost:8000/api/settings/backup`)
        .then(res => res.json())
        .then(data => {
          setBackupSettings(data);
          setBackupSettingsLoading(false);
        })
        .catch(() => setBackupSettingsLoading(false));
    }
  }, [activeTab])

  const handleSecuritySave = (e) => {
    e.preventDefault();
    setSecurityLoading(true);
    fetch(`http://localhost:8000/api/security-settings/putSettings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(securitySettings)
    })
      .then(res => res.json())
      .then(data => {
        setSecuritySettings(data);
        setSecurityLoading(false);
        alert('安全設定已儲存');
      })
      .catch(() => {
        setSecurityLoading(false);
        alert('儲存失敗')
      });
  };

  const handleGeneralSave = (e) => {
    e.preventDefault();
    setGeneralLoading(true);
    fetch(`http://localhost:8000/api/general-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify(generalSettings)
    })
      .then(res => res.json())
      .then(data => {
        refreshSettings();
        setGeneralLoading(false);
        alert('基本設定已儲存');
      })
      .catch(() => {
        setGeneralLoading(false);
        alert('儲存失敗');
      });
  };

  const handleNotificationSave = (e) => {
    e.preventDefault();
    setNotificationLoading(true);
    fetch(`http://localhost:8000/api/notification-settings/putSettings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificationSettings)
    })
      .then(res => res.json())
      .then(data => {
        setNotificationSettings(data);
        setNotificationLoading(false);
        alert('通知設定已儲存');
      })
      .catch(() => {
        setNotificationLoading(false);
        alert('儲存失敗')
      });
  }

  const handleBackupSettingsSave = (e) => {
    e.preventDefault();
    setBackupSettingsLoading(true);
    fetch(`http://localhost:8000/api/settings/backup`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        autoBackupInterval: backupSettings.autoBackupInterval,
        daysBeforeDelete: backupSettings.daysBeforeDelete
      })
    })
    .then(res => {
      if (!res.ok) {
        throw new Error('儲存失敗，請檢查網路連線或稍後再試。');
      }
      return res.json();
    })
    .then(data => {
      setBackupSettings(data);
      setBackupSettingsLoading(false);
      // Set success message
      setBackupMessage('備份設定已成功儲存！');
      setBackupMessageType('success');
      // Clear message after 5 seconds
      setTimeout(() => setBackupMessage(''), 5000);
    })
    .catch((error) => {
      setBackupSettingsLoading(false);
      // Set error message
      setBackupMessage(error.message);
      setBackupMessageType('danger');
      // Clear message after 5 seconds
      setTimeout(() => setBackupMessage(''), 5000);
    });
  };

  /**
   * 處理備份相關事宜
   */
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupMessage, setBackupMessage] = useState('');
  const [backupMessageType, setBackupMessageType] = useState('info');
  const fileInputRef = useRef(null);

  const handleCreateBackup = async () => {
    setBackupLoading(true);
    setBackupMessage('正在建立備份...');
    try {
      const response = await fetch('http://localhost:8000/api/backup/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '建立備份失敗');
      }
     // On success, display the path returned from the backend.
      setBackupMessage(`備份成功！檔案已儲存於伺服器路徑： ${data.message.split(': ')[1]}`);
      setBackupMessageType('success');
    } catch (error) {
      setBackupMessage(`備份失敗: ${error.message}`);
      setBackupMessageType('danger');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreClick = () => {
    // Trigger the hidden file input
    fileInputRef.current.click();
  };

  const handleFileSelected = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    setBackupLoading(true);
    setBackupMessage('正在上傳並還原備份檔案...');
    setBackupMessageType('info');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/backup/restore', {
        method: 'POST',
        body: formData,
        // Note: Do not set 'Content-Type' header for multipart/form-data
        // The browser will set it automatically with the correct boundary.
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '還原失敗');
      }
      setBackupMessage(data.message);
      setBackupMessageType('success');
    } catch (error) {
      setBackupMessage(`還原失敗: ${error.message}`);
      setBackupMessageType('danger');
    } finally {
      setBackupLoading(false);
      // Reset the file input so the same file can be selected again
      event.target.value = null;
    }
  };

  /**
 * 處理用戶登出
 * 清除認證信息並導航到登入頁面
 */
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate()

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="system-settings-container">
      <div className="row">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="settings-tabs">
                <div 
                  className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('general')}
                >
                  <FontAwesomeIcon icon={faGear} className="me-2" />
                  基本設定
                </div>
                <div 
                  className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('security')}
                >
                  <FontAwesomeIcon icon={faShieldHalved} className="me-2" />
                  安全設定
                </div>
                <div 
                  className={`settings-tab ${activeTab === 'notification' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('notification')}
                >
                  <FontAwesomeIcon icon={faBell} className="me-2" />
                  通知設定
                </div>
                <div 
                  className={`settings-tab ${activeTab === 'backup' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('backup')}
                >
                  <FontAwesomeIcon icon={faCloudArrowUp} className="me-2" />
                  備份與還原
                </div>
                
                {/* TODO: 還沒做好的功能 */}
                {/*
                
                <div 
                  className={`settings-tab ${activeTab === 'api' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('api')}
                >
                  <FontAwesomeIcon icon={faCode} className="me-2" />
                  API設定
                </div>
                <div 
                  className={`settings-tab ${activeTab === 'audit' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('audit')}
                >
                  <FontAwesomeIcon icon={faBook} className="me-2" />
                  稽核日誌
                </div>
                */}
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-9">
          {/* 基本設定 */}
          {activeTab === 'general' && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title mb-4">基本設定</h5>
                <form onSubmit={handleGeneralSave}>
                  <div className="mb-4">
                    <label className="form-label">系統名稱</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      defaultValue="企業認證資料整合系統"
                      value={generalSettings.systemName}
                      onChange={e => setGeneralSettings(s => ({ ...s, systemName: e.target.value}))}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">系統語言 (目前僅繁體中文可用)</label>
                    <select 
                      className="form-select"
                      value={generalSettings.systemLanguage}
                      onChange={e => setGeneralSettings(s => ({ ...s, systemLanguage: e.target.value}))}
                    >  
                      <option value="zh-tw">繁體中文</option>  {/* 本系統預設使用繁體中文 */}
                      <option value="en-us">English</option>
                      <option value="jp">日本語</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="form-label">時區設定</label> 
                    <select 
                      className="form-select"
                      value={generalSettings.timezone}
                      onChange={e => setGeneralSettings(s => ({ ...s, timezone: e.target.value}))}
                    >
                      <option value="Asia/Taipei">(GMT+08:00) 台北</option>
                      <option value="Asia/Tokyo">(GMT+09:00) 東京</option>
                      <option value="Europe/London">(GMT+00:00) 倫敦</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="form-label">日期格式</label>
                    <select 
                      className="form-select"
                      value={generalSettings.dateFormat}
                      onChange={e => setGeneralSettings(s => ({ ...s, dateFormat: e.target.value}))}
                    >
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    </select>
                  </div>
                  <div className="d-flex justify-content-between">
                  <button type="submit" className="btn btn-primary" disabled={setGeneralLoading}>
                    {generalLoading ? '儲存中...' : '儲存設定'}
                  </button>
                    <button type="button" className="btn btn-danger" onClick={handleLogout}>
                      <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                      系統登出
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 安全設定 */}
          {activeTab === 'security' && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title mb-4">安全設定</h5>
                <form onSubmit={handleSecuritySave}>
                  <div className="mb-4">
                    <label className="form-label">密碼政策</label>
                    <div className="form-check mb-2">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={securitySettings.requireMinLength}
                        onChange={e => setSecuritySettings(s => ({ ...s, requireMinLength: e.target.checked}))} 
                      />
                      <label className="form-check-label">要求至少n個字元</label>
                      <input
                        type="number"
                        className="form-control mt-2"
                        value={securitySettings.minLength}
                        min={1}
                        onChange={e => setSecuritySettings(s => ({ ...s, minLength: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="form-check mb-2">
                      <input className="form-check-input" type="checkbox" defaultChecked />
                      <label className="form-check-label">必須包含大小寫字母</label>
                    </div>
                    <div className="form-check mb-2">
                      <input className="form-check-input" type="checkbox" defaultChecked />
                      <label className="form-check-label">必須包含數字</label>
                    </div>
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" defaultChecked />
                      <label className="form-check-label">必須包含特殊字元</label>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label">登入安全</label>
                    <div className="form-check mb-2">
                      
                      <label className="form-check-label">登入失敗鎖定前可嘗試次數: </label>
                      <input
                        type="number"
                        className="form-control mt-2"
                        value={securitySettings.maxLoginAttempts}
                        min={1}
                        onChange={e => setSecuritySettings(s => ({ ...s, maxLoginAttempts: Number(e.target.value) }))}
                      />
                      <label className="form-check-label">達到失敗次數後的鎖定時間: </label>
                      <input
                        type='number'
                        className='form-control mt-2'
                        min={1}
                        value={securitySettings.maxLoginLockMinutes}
                        onChange={e => setSecuritySettings(s => ({ ...s, maxLoginLockMinutes: Number(e.target.value) }))}
                      />

                    </div>
                  </div>
                  {/* TODO: 還沒做好的功能 */}
                  {/*<div className="mb-4">
                    <label className="form-label">Session 設定 (尚未實作)</label>
                    <select
                      className="form-select mb-3"
                      value={securitySettings.sessionTimeoutMinutes}
                      onChange={e => setSecuritySettings(s => ({ ...s, sessionTimeoutMinutes: Number(e.target.value) }))}
                    >
                      <option selected>30 分鐘後自動登出</option>
                      <option>1 小時後自動登出</option>
                      <option>2 小時後自動登出</option>
                    </select>
                  </div>*/}
                  <button type="submit" className="btn btn-primary">儲存設定</button>
                </form>
              </div>
            </div>
          )}

          {/* 通知設定 */}
          {activeTab === 'notification' && (
            <div className="card">
              <div className="card-body">
                <div className='d-flex justify-content-between align-items-center mb-4'>
                  <h5 className="card-title mb-4">通知設定</h5>
                  {currentUser && currentUser.roleDTO && currentUser.roleDTO.id === 1 && (
                    <Link to="/send-notification" className="btn btn-primary">
                      傳送通知
                    </Link>
                  )}
                </div>
                <form onSubmit={handleNotificationSave}>
                  <div className="mb-4">
                    <div className="form-check mb-2">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={notificationSettings.certificationExpireNotice}
                        onChange={e => setNotificationSettings(s => ({ ...s, certificationExpireNotice: e.target.checked }))} 
                      />
                      <label className="form-check-label">認證到期提醒</label>
                    </div>
                    <div className="mb-2">
                      <label className="form-label">提前提醒天數</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        value={notificationSettings.daysBeforeExpirarySendNotice}
                        min="1"
                        onChange={e => setNotificationSettings(s => ({ ...s, daysBeforeExpirarySendNotice: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="form-check mb-2">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={notificationSettings.newProjectNotice}
                        onChange={e => setNotificationSettings(s => ({ ...s, newProjectNotice: e.target.checked }))}
                      />
                      <label className="form-check-label">新專案通知</label>
                    </div>
                    <div className="form-check mb-2">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={notificationSettings.documentUpdateNotice}
                        onChange={e => setNotificationSettings(s => ({ ...s, documentUpdateNotice: e.target.checked }))}
                      />
                      <label className="form-check-label">文件更新通知</label>
                    </div>
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" defaultChecked />
                      <label className="form-check-label">系統維護通知 (預計不實做)</label>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="form-check mb-2">
                     <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={notificationSettings.missionAssignmentNotice}
                        onChange={e => setNotificationSettings(s => ({ ...s, missionAssignmentNotice: e.target.checked }))}
                      />
                      <label className="form-check-label">任務指派通知</label>
                    </div>
                    <div className="form-check mb-2">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={notificationSettings.commentAndReplyNotice}
                        onChange={e => setNotificationSettings(s => ({ ...s, commentAndReplyNotice: e.target.checked }))}
                      />
                      <label className="form-check-label">評論與回覆通知</label>
                    </div>
                  </div>
              
                  <button type="submit" className="btn btn-primary" disabled={notificationLoading}>
                    {notificationLoading ? '儲存中...' : '儲存設定'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 備份與還原 */}
          {activeTab === 'backup' && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title mb-4">備份與還原</h5>
                <form onSubmit={handleBackupSettingsSave}>
                <div className="backup-status">
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  最後備份時間：{
                    (() => {
                      if (!backupSettings.lastBackupTime || !Array.isArray(backupSettings.lastBackupTime)) {
                        return '尚未備份';
                      }
                      const dt = backupSettings.lastBackupTime;
                      // new Date(year, monthIndex (0-11), day, hours, minutes, seconds)
                      const date = new Date(dt[0], dt[1] - 1, dt[2], dt[3], dt[4], dt[5]);
                      return date.toLocaleString();
                    })()
                  }
                </div>
                <div className="mb-4">
                    <label className="form-label">自動備份設定</label>
                    <select 
                      className="form-select mb-3"
                      value={backupSettings.autoBackupInterval}
                      onChange={e => setBackupSettings(s => ({ ...s, autoBackupInterval: Number(e.target.value) }))}
                    >
                      <option value="1">每日備份</option>
                      <option value="7">每週備份</option>
                      <option value="30">每月備份</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="form-label">備份保留時間</label>
                    <select 
                      className="form-select mb-3"
                      value={backupSettings.daysBeforeDelete}
                      onChange={e => setBackupSettings(s => ({ ...s, daysBeforeDelete: Number(e.target.value) }))}
                    >
                      <option value="30">保留 30 天</option>
                      <option value="60">保留 60 天</option>
                      <option value="90">保留 90 天</option>
                    </select>
                  </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={backupSettingsLoading}>
                    <FontAwesomeIcon icon={faSave} className="me-2" />
                    {backupSettingsLoading ? '儲存中...' : '儲存設定'}
                  </button>
                  <button className="btn btn-primary" onClick={handleCreateBackup} disabled={backupLoading}>
                    <FontAwesomeIcon icon={faCloudArrowUp} className="me-2" />
                    {backupLoading ? '備份中...' : '立即備份'}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelected}
                    style={{ display: 'none' }}
                    accept=".sql"
                  />
                  <button className="btn btn-outline-primary" onClick={handleRestoreClick} disabled={backupLoading}>
                    <FontAwesomeIcon icon={faCloudArrowUp} className="me-2" rotation={180} />
                    {backupLoading ? '處理中...' : '還原系統'}
                  </button>
                </div>
              </form>
                 {backupMessage && <div className={`mt-3 alert alert-${backupMessageType}`}>{backupMessage}</div>}
              </div>
            </div>
          )}

          {/* API設定 */}
          {activeTab === 'api' && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title mb-4">API設定</h5>
                <div className="mb-4">
                  <label className="form-label">API金鑰</label>
                  <div className="input-group">
                    <input type="text" className="form-control" defaultValue="sk_test_51HbVrcK..." readOnly />
                    <button className="btn btn-outline-secondary">
                      <FontAwesomeIcon icon={faClipboard} />
                    </button>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label">API請求限制</label>
                  <select className="form-select mb-3">
                    <option selected>1000 請求/分鐘</option>
                    <option>5000 請求/分鐘</option>
                    <option>10000 請求/分鐘</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="form-label">允許的IP位址</label>
                  <textarea className="form-control" rows="3" placeholder="每行輸入一個IP位址"></textarea>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-primary">
                    <FontAwesomeIcon icon={faKey} className="me-2" />產生新金鑰
                  </button>
                  <button className="btn btn-outline-danger">
                    <FontAwesomeIcon icon={faTrash} className="me-2" />撤銷金鑰
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 稽核日誌 */}
          {activeTab === 'audit' && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title mb-4">稽核日誌</h5>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>時間</th>
                        <th>使用者</th>
                        <th>操作</th>
                        <th>IP位址</th>
                        <th>狀態</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>2024-01-20 15:30</td>
                        <td>王經理</td>
                        <td>更新系統設定</td>
                        <td>192.168.1.100</td>
                        <td><span className="badge bg-success">成功</span></td>
                      </tr>
                      <tr>
                        <td>2024-01-20 14:25</td>
                        <td>李小華</td>
                        <td>登入系統</td>
                        <td>192.168.1.101</td>
                        <td><span className="badge bg-success">成功</span></td>
                      </tr>
                      <tr>
                        <td>2024-01-20 13:15</td>
                        <td>unknown</td>
                        <td>嘗試登入</td>
                        <td>192.168.1.102</td>
                        <td><span className="badge bg-danger">失敗</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <nav aria-label="稽核日誌分頁">
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
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings; 