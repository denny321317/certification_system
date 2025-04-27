/**
 * 身份驗證上下文模組
 * 
 * 此模組提供全局的身份驗證狀態管理，包括：
 * - 用戶登入/登出
 * - 用戶註冊
 * - 密碼重設
 * - 用戶資料更新
 * 
 * 使用方式：
 * 1. 在根組件中使用 AuthProvider 包裹應用
 * 2. 在子組件中使用 useContext(AuthContext) 獲取認證狀態和方法
 */

import React, { createContext, useState, useEffect } from 'react';

/**
 * 身份驗證上下文
 * @type {React.Context}
 */
export const AuthContext = createContext();

/**
 * 身份驗證提供者組件
 * @param {Object} props - 組件屬性
 * @param {ReactNode} props.children - 子組件
 */
export const AuthProvider = ({ children }) => {
  /**
   * 當前用戶狀態
   * @type {[Object|null, Function]} - [當前用戶數據, 設置用戶數據的函數]
   */
  const [currentUser, setCurrentUser] = useState(null);
  
  /**
   * 載入狀態
   * @type {[boolean, Function]} - [是否正在載入, 設置載入狀態的函數]
   */
  const [loading, setLoading] = useState(true);
  
  /**
   * 初始化時從本地存儲載入用戶數據
   */
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('currentUser');
    
    if (token && storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  /**
   * 用戶登入
   * @param {string} email - 用戶電子郵件
   * @param {string} password - 用戶密碼
   * @returns {Promise<Object>} 登入結果
   */
  const login = async (email, password) => {
    try {
      // TODO: 整合實際的 API
      // 目前使用模擬數據進行開發測試
      if (email === 'admin@example.com' && password === 'password') {
        const userData = {
          id: '1',
          name: '管理員',
          email: 'admin@example.com',
          role: '系統管理員',
          avatar: null
        };
        
        const token = 'mock_token_' + Date.now();
        
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        setCurrentUser(userData);
        return { success: true };
      } 
      
      if (email === 'user@example.com' && password === 'password') {
        const userData = {
          id: '2',
          name: '一般用戶',
          email: 'user@example.com',
          role: '一般用戶',
          avatar: null
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        setCurrentUser(userData);
        return { success: true };
      }
      
      return { 
        success: false, 
        error: '電子郵件或密碼錯誤'
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || '登錄時發生錯誤'
      };
    }
  };

  /**
   * 用戶登出
   * 清除本地存儲的認證信息和用戶數據
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  /**
   * 用戶註冊
   * @param {Object} userData - 用戶註冊數據
   * @param {string} userData.name - 用戶名稱
   * @param {string} userData.email - 用戶電子郵件
   * @returns {Promise<Object>} 註冊結果
   */
  const register = async (userData) => {
    try {
      // TODO: 整合實際的 API
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        name: userData.name,
        email: userData.email,
        role: '一般用戶',
        avatar: null
      };
      
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      setCurrentUser(newUser);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || '註冊時發生錯誤'
      };
    }
  };

  /**
   * 重設密碼
   * @param {string} email - 用戶電子郵件
   * @returns {Promise<Object>} 重設結果
   */
  const resetPassword = async (email) => {
    try {
      // TODO: 整合實際的 API
      return { 
        success: true, 
        message: '密碼重設連結已發送到您的電子郵件'
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || '重設密碼時發生錯誤'
      };
    }
  };

  /**
   * 更新用戶資料
   * @param {Object} userData - 要更新的用戶數據
   * @returns {Promise<Object>} 更新結果
   */
  const updateProfile = async (userData) => {
    try {
      // TODO: 整合實際的 API
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || '更新資料時發生錯誤'
      };
    }
  };

  /**
   * 提供給子組件的上下文值
   * @type {Object}
   */
  const value = {
    currentUser,  // 當前用戶數據
    loading,      // 載入狀態
    login,        // 登入方法
    logout,       // 登出方法
    register,     // 註冊方法
    resetPassword,// 重設密碼方法
    updateProfile // 更新資料方法
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 