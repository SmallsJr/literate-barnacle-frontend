import React from 'react';

const FileCount = ({ count, onShowFiles }) => (
  <div className="file-count">
    <h3>Retrieved Documents</h3>
    <div className="file-counter">{count}</div>
    <button 
      className="show-files-btn" 
      onClick={onShowFiles}
    >
      View Retrieved Files
    </button>
  </div>
);

export default FileCount;
