import React, { createContext, useState, useEffect, useCallback } from 'react';

export const DocumentContext = createContext();

export const DocumentProvider = ({ children }) => {
  const API_BASE = 'http://localhost:8000/api/documents';
  const token = localStorage.getItem('token');

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  // 取得文件清單
const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error(error);
    } 
  }, [token]);

  // 當 documents 改變時，觸發這個 useEffect
  useEffect(() => {
    console.log('更新後的文件資料：', documents);  // 檢查資料是否已經更新
  }, [documents]);


  // 上傳文件
  const uploadDocument = async (file, folder) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      return await response.json();
    } catch (error) {
      console.error('上傳文件失敗', error);
      return null;
    }
  };

  // 下載文件
  const downloadDocument = async (filename, downloadName = 'downloaded-file') => {
    try {
      const response = await fetch(`${API_BASE}/download/${encodeURIComponent(filename)}`);
      if (!response.ok) throw new Error('下載失敗');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadName || filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下載錯誤', error);
    }
  };

  // 刪除文件
  const deleteDocument = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/delete/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('伺服器錯誤');

      const result = await response.json();
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      return result;
    } catch (error) {
      console.error('刪除文件失敗', error);
      return null;
    }
  };

  const value = {
    documents,
    loading,
    fetchDocuments,
    uploadDocument,
    downloadDocument,
    deleteDocument,
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};
