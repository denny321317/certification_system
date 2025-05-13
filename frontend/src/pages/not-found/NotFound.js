/**
 * 404頁面
 * 
 * 此組件顯示當用戶訪問不存在的路徑時的錯誤頁面。
 * 
 * 特點:
 * - 清晰的錯誤信息展示
 * - 返回首頁的快捷按鈕
 * - 簡潔的視覺風格
 * 
 * 使用方式:
 * ```jsx
 * <Route path="*" element={<NotFound />} />
 * ```
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faHome } from '@fortawesome/free-solid-svg-icons';
import './NotFound.css';

/**
 * 404頁面組件
 * @returns {JSX.Element} 404頁面
 */
const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="error-code">404</div>
        <div className="error-icon">
          <FontAwesomeIcon icon={faExclamationTriangle} />
        </div>
        <h1 className="error-title">頁面未找到</h1>
        <p className="error-message">
          抱歉，您嘗試訪問的頁面不存在或已被移除。
        </p>
        <Link to="/" className="back-home-button">
          <FontAwesomeIcon icon={faHome} className="me-2" />
          返回首頁
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 