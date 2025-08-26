import { faL } from '@fortawesome/free-solid-svg-icons';
import React, { createContext, useState, useEffect, useCallback
 } from 'react';
import axios from 'axios';

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
  const [securitySettings, setSecuritySettings] = useState(null);

  

  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    fetchSecuritySettings();
    setLoading(false);
  }, []);

  /**
   * 抓取安全設定
   */
  const fetchSecuritySettings = useCallback(async() => {
    try {
      const response = await axios.get('http://localhost:8000/api/security-settings/getSettings');
      
      // FOR DEBUG
      console.log('AuthContext: API response received: ', response.data);

      if (response.data) {
        setSecuritySettings(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch security settings: ", error);
    }
  }, []);

  /**
   * 用戶登入
   */
  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8000/api/login', { email, password });

      const data = response?.data;

      if (data?.success && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        setCurrentUser(data.user);
        return { success: true };
      } else {
        return { 
          success: false,
          error: data.error || '登入失敗',
          securitySettings: data.securitySettings || null,
          lockRemainingSeconds: data.lockRemainingSeconds || 0,
          remainingAttempts: data.remainingAttempts
        };
      }

      return { success: false, error: data?.error || '登入失敗' };
    } catch (error) {
      const msg = error.response?.data?.error || error.message || '登入失敗';
      return { success: false, error: msg };
    }
  };

  /**
   * 用戶登出
   */
  const logout = async () => {

    // get the Email of current User
    const currentUserData = localStorage.getItem('currentUser');
    let email = null;
    if (currentUserData) {
      try {
        email = JSON.parse(currentUserData).email;
      } catch (error) {
        email = null
      }
    }

    // call API
    if (email) {
      try {
        await fetch('http://localhost:8000/api/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
      } catch (error) {
        
      }
    }

    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  /**
   * 用戶註冊
   */
  const register = async (userData) => {
    try {
      const response = await fetch('http://localhost:8000/api/register', {
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

  // FOR DEBUG
  console.log("AuthProvider is rendering. Current securitySettings state: ", securitySettings);

  const value = {
    currentUser,
    loading,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
    fetchSecuritySettings

  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );

};
