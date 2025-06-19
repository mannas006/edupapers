import React from 'react';
import './SkeletonLoading.css';

const SkeletonLoading = () => {
  return (
    <div className="skeleton-loading-container">
      <div className="skeleton-item"></div>
      <div className="skeleton-item"></div>
      <div className="skeleton-item"></div>
      <div className="skeleton-item"></div>
      <div className="skeleton-item"></div>
    </div>
  );
};

export default SkeletonLoading;
