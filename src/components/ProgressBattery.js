import React from 'react';
import './ProgressBattery.css';

const ProgressBattery = ({ percentage }) => {
  // Handle error state
  if (percentage === -1) {
    return (
      <div className="progress-battery error">
        <div className="error-icon">⚠️</div>
        <div className="error-text">Error</div>
      </div>
    );
  }

  // Determine color based on percentage
  const getColor = () => {
    if (percentage < 30) return '#ef4444'; // red
    if (percentage < 70) return '#f59e0b'; // amber
    return '#10b981'; // green
  };

  return (
    <div className="progress-battery">
      <div className="battery-container">
        <div 
          className="battery-fill"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: getColor()
          }}
        ></div>
        <div className="battery-tip"></div>
      </div>
      <div className="battery-percentage">{percentage}%</div>
    </div>
  );
};

export default ProgressBattery;
