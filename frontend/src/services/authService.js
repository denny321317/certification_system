import axios from 'axios';

const API_URL = 'http://localhost:8080/';

// 設置請求攔截器，為請求添加認證令牌
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 創建封裝API調用的函數
const apiCall = async (method, url, data = null) => {
  try {
    const response = await axios({
      method,
      url: `${API_URL}${url}`,
      data,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      // 服務器返回錯誤狀態碼
      const errorMessage = error.response.data.detail || '發生錯誤，請稍後再試';
      throw new Error(errorMessage);
    } else if (error.request) {
      // 請求已發出但沒有收到響應
      throw new Error('無法連接到服務器，請檢查你的網絡連接');
    } else {
      // 請求設置時出現問題
      throw new Error('請求失敗，請稍後再試');
    }
  }
};

// 登入用戶
export const loginUser = async (email, password) => {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);
  
  return await apiCall('post', '/login', formData);
};

// 註冊用戶
export const registerUser = async (userData) => {
  return await apiCall('post', '/register', userData);
};

// 獲取當前用戶
export const getCurrentUser = async () => {
  return await apiCall('get', '/me');
};

// 發送忘記密碼請求
export const forgotPassword = async (email) => {
  return await apiCall('post', '/forgot-password', { email });
};

// 重置密碼
export const resetPassword = async (token, password) => {
  return await apiCall('post', '/reset-password', { token, password });
};

// 登出
export const logout = () => {
  // 在客戶端處理登出，清除令牌等
  // 如果後端需要處理登出操作，可以調用後端API
  // return await apiCall('post', '/logout');
}; 