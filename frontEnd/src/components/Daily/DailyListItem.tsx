import React, { useState } from 'react';
import { Job } from '../../types/interfaces';
import '../../styles/components/DailyListItem.css';

interface DailyListItemProps {
  job: Job;
  isFocused: boolean;
  onClick: (id: number) => void;
  onComplete?: (id: number) => void;
}

const DailyListItem: React.FC<DailyListItemProps> = ({ job, isFocused, onClick, onComplete}) => {
  const isComplete = job.status === 'COMPLETE';
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFocused && onComplete && !isComplete) {
      onComplete(job.id);
    } else {
      onClick(job.id);
    }
  };

  return (
    <li
      className={`daily-item ${isFocused ? 'daily-focused' : ''} ${isComplete ? 'daily-complete' : ''} ${isHovered ? 'hovered' : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="daily-item-header">
        <div className="daily-icon">
          {isComplete ? (
            <i className="fa-solid fa-circle-check"></i>
          ) : isFocused ? (
            <i className="fa-regular fa-circle-check"></i>
          ) : (
            <i className="fa-regular fa-circle"></i>
          )}
        </div>
        <div className="daily-content">
          <div className="daily-address">
            {job.property.street}
          </div>
          <div className="daily-status">
            {isComplete ? (
              <span className="complete-text">Done</span>
            ) : isFocused ? (
              <span className="click-hint">Click to finish</span>
            ) : (
              <span className="pending-text">To do</span>
            )}
          </div>
        </div>
      </div>
    </li>
  );
};

export default DailyListItem;
