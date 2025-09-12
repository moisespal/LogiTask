import React from 'react';
import '../../styles/components/LoadingJob.css';

const LoadingJob: React.FC = () => {
  return (
    <>
       {[...Array(3)].map((_, i) => (
        <div className="job-wrapper" key={i}>
            <li 
                className="list-item daily-item loading-job"
                style={{ animationDelay: `${i * 0.15}s` }}
            >
                <div className="list-item-header">
                    <div className="daily-icon">
                       <i className="fa-regular fa-circle"></i> 
                    </div>
                    <div className="daily-content loading-text">
                        <div className="list-item-name daily-address">Loading Jobs...</div>
                    </div>
                </div>
            </li>
        </div>
      ))}
    </>
  );
}

export default LoadingJob;