// still not working properly
import React from 'react';
import './Progressbar.css';

interface ProgressbarProps {
  total: number;
  completed: number;
}

const Progressbar: React.FC<ProgressbarProps> = ({ total, completed }) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="progress-bar">
      <div
        className="progress-bar-fill"
        style={{ width: `${percentage}%` }}
      ></div>
      <span className="progress-bar-text">{`${completed} / ${total}`}</span>
    </div>
  );
};

export default Progressbar;
