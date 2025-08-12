
import React, { useEffect, useState } from 'react';
import { fetchFiles, downloadFile, deleteFile } from '../../../services/fileService';

export default function FileList({ folderId }) {
  const [files, setFiles] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // list or grid

  // 1. 載入檔案清單
  useEffect(() => {
    fetchFiles(folderId)
      .then(res => setFiles(res.data))
      .catch(console.error);
  }, [folderId]);

  // 2. 下載
  const handleDownload = (file) => {
    downloadFile(file.id).then(res => {
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  // 3. 刪除
  const handleDelete = (id) => {
    deleteFile(id)
      .then(() => setFiles(files.filter(f => f.id !== id)))
      .catch(console.error);
  };

  return (
    <div className={`files-container ${viewMode}`}>
      {files.map(file => (
        <div key={file.id} className="file-card">
          <div className="file-card-content">
            <div className="file-info">
              <i className={`file-icon ${file.type}`}></i>
              <div className="file-details">
                <div className="file-name">{file.name}</div>
                <div className="file-meta">
                  <span>{file.uploadedAt}</span>
                  <span>{file.size} MB</span>
                </div>
              </div>
            </div>
            <div className="file-actions">
              <button className="btn-icon" onClick={() => handleDownload(file)}>
                <i className="icon-download"></i>
              </button>
              <button className="btn-icon text-danger" onClick={() => handleDelete(file.id)}>
                <i className="icon-trash"></i>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
