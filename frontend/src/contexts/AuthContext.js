import React, { createContext, useState, useEffect } from 'react';

/**
 * 身份驗證上下文
 */
export const AuthContext = createContext();

/**
 * 身份驗證提供者組件
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // To ensure the login screen is always displayed on a fresh start,
    // we will no longer automatically log in from localStorage.
    // The user must log in to create a new session.
    setLoading(false);
  }, []);

  /**
   * 用戶登入
   */
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        setCurrentUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || '登入失敗' };
      }
    } catch (error) {
      return { success: false, error: error.message || '伺服器錯誤' };
    }
  };

  /**
   * 用戶登出
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  /**
   * 用戶註冊
   */
  const register = async (userData) => {
    try {
      const response = await fetch('http://localhost:8080/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        setCurrentUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || '註冊失敗' };
      }
    } catch (error) {
      return { success: false, error: error.message || '伺服器錯誤' };
    }
  };

  /**
   * 重設密碼
   */
  const forgotPassword = async (email) => {
    try {
      const response = await fetch(`http://localhost:8000/api/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
  
      const data = await response.json();
  
      if (response.ok && data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error || '重設失敗' };
      }
    } catch (error) {
      return { success: false, error: error.message || '伺服器錯誤' };
    }
  };

  /**
   * 更新密碼
   */
  const resetPassword = async (token, newPassword) => {
    try {
      const response = await fetch('http://localhost:8000/api/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error || '更新密碼失敗' };
      }
    } catch (error) {
      return { success: false, error: error.message || '伺服器錯誤' };
    }
  };

  

  const value = {
    currentUser,
    loading,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,

  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );

};
