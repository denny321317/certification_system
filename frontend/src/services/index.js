import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
  // 其他設定（如有需要）
});

export default axiosInstance;
