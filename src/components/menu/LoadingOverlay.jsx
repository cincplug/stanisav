import React from "react";

function LoadingOverlay({ isLoading }) {
  if (!isLoading) {
    return null;
  }

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <svg className="loading-spinner" viewBox="0 0 50 50">
          <circle
            className="loading-circle"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="31.416"
            strokeDashoffset="31.416"
          />
        </svg>
        <div className="loading-text">Loading Language Galaxy...</div>
      </div>
    </div>
  );
}

export default LoadingOverlay;
