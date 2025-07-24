import React from 'react';
import './FileListModal.css';

const FileListModal = ({ files, loading, onClose }) => {
  // Ensure files is always an array
  const fileList = Array.isArray(files) ? files : [];
  
  return (
    <div className="modal-backdrop">
      <div className="file-list-modal">
        <div className="modal-header">
          <h2>Retrieved Files</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="file-list-container">
          {loading ? (
            <div className="loading-files">Loading files...</div>
          ) : fileList.length === 0 ? (
            <div className="empty-files">No files retrieved yet</div>
          ) : (
            <ul className="file-list">
              {fileList.map((file, index) => (
                <li key={index} className="file-item">
                  <div className="file-icon">
                    {getFileIcon(file?.type)}
                  </div>
                  <div className="file-details">
                    <div className="file-name">{file?.name || 'Unnamed file'}</div>
                    <div className="file-meta">
                      <span className="file-type">{file?.type?.split('/').pop() || 'unknown'}</span>
                      {file?.size && (
                        <span className="file-size">{formatFileSize(file.size)}</span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getFileIcon = (fileType) => {
  const icons = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    ppt: '📽️',
    pptx: '📽️',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    txt: '📑',
    csv: '📋',
    default: '📁'
  };
  
  if (!fileType) return icons.default;
  
  const fileTypeKey = fileType.split('/').pop().toLowerCase();
  return icons[fileTypeKey] || icons.default;
};

const formatFileSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

export default FileListModal;