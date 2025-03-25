import React, { createContext, useState, useEffect } from 'react';

// 創建認證上下文
export const AuthContext = createContext();

// 認證提供者組件
export const AuthProvider = ({ children }) => {
  // 用戶狀態
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 從本地存儲中加載用戶數據
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('currentUser');
    
    if (token && storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // 登錄功能
  const login = async (email, password) => {
    try {
      // 這裡應該連接到您的API進行身份驗證
      // 現在使用模擬數據進行示範
      if (email === 'admin@example.com' && password === 'password') {
        const userData = {
          id: '1',
          name: '管理員',
          email: 'admin@example.com',
          role: '系統管理員',
          avatar: null
        };
        
        const token = 'mock_token_' + Date.now();
        
        // 保存認證信息
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

  // 登出功能
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  // 註冊功能
  const register = async (userData) => {
    try {
      // 這裡應該連接到您的API進行註冊
      // 現在使用模擬數據進行示範
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        name: userData.name,
        email: userData.email,
        role: '一般用戶',
        avatar: null
      };
      
      // 保存用戶數據到本地存儲
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

  // 重設密碼功能
  const resetPassword = async (email) => {
    try {
      // 這裡應該連接到您的API進行密碼重設
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

  // 更新用戶資料
  const updateProfile = async (userData) => {
    try {
      // 這裡應該連接到您的API進行資料更新
      // 現在使用本地存儲進行示範
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

  // 提供的上下文值
  const value = {
    currentUser,
    loading,
    login,
    logout,
    register,
    resetPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 