import React from "react";

const FileCount = ({ count, onAddFile }) => (
  <div className="file-count">
    <h3>Retrieved Documents</h3>
    <div className="file-counter">{count}</div>
    <button onClick={onAddFile}>Simulate File Retrieval</button>
  </div>
);

export default FileCount;
