import axios from 'axios';

// 建立一個 axios 實例，baseURL 指向你的後端 API 前綴
const API = axios.create({
  baseURL: '/api',           // 或你的實際 API 路徑
  headers: { 'Content-Type': 'application/json' }
});

// 1. 取得檔案列表（可依 folderId 篩選）
export const fetchFiles = (folderId) => {
  // 如果有資料夾 id，就把它帶入 query string
  const url = folderId ? `/files?folder=${folderId}` : '/files';
  return API.get(url);
};

// 2. 上傳檔案（multipart/form-data）
export const uploadFile = (folderId, file) => {
  const form = new FormData();
  form.append('file', file);
  if (folderId) form.append('folder', folderId);
  return API.post('/files', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// 3. 下載檔案（二進位流）
export const downloadFile = (fileId) => {
  return API.get(`/files/${fileId}/download`, {
    responseType: 'blob'
  });
};

// 4. 刪除檔案
export const deleteFile = (fileId) => {
  return API.delete(`/files/${fileId}`);
};
