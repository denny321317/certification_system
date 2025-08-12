// src/pages/document-management/files/FileUpload.jsx
import React, { useRef } from 'react';
import { uploadFile } from '../../../services/fileService';

export default function FileUpload({ folderId, onUploaded }) {
  const fileInput = useRef();

  const handleUpload = () => {
    const file = fileInput.current.files[0];
    if (!file) return;
    uploadFile(folderId, file)
      .then(() => {
        onUploaded();   //  not yet 
        fileInput.current.value = '';
      })
      .catch(console.error);
  };

  return (
    <div className="header-actions">
      <input
        type="file"
        ref={fileInput}
        className="search-input"
      />
      <button className="btn btn-primary btn-sm" onClick={handleUpload}>
        上傳檔案
      </button>
    </div>
  );
}
