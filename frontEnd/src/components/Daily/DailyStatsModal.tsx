import React, {useMemo} from 'react';
import { Job } from '../../types/interfaces';
import '../../styles/components/DailyStatsModal.css';

interface DailyStatsPanelProps {
  jobs: Job[];
  isVisible: boolean;
}

const DailyStatsPanel: React.FC<DailyStatsPanelProps> = ({ jobs, isVisible }) => {
  const userTimezone = localStorage.getItem('userTimezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        timeZone: userTimezone
    });
  }, [userTimezone]);

  if (!isVisible) return null;

  const completedJobs = jobs.filter(job => job.status === 'complete');
  const totalJobs = jobs.length;
  const completionRate = totalJobs > 0 ? (completedJobs.length / totalJobs) * 100 : 0;
  
  const totalPotentialRevenue = jobs.reduce((sum, job) => sum + Number(job.cost), 0);
  const completedRevenue = completedJobs.reduce((sum, job) => sum + Number(job.cost), 0);
  const revenueRate = totalPotentialRevenue > 0 ? (completedRevenue / totalPotentialRevenue) * 100 : 0;

  return (
    <div className="daily-stats-panel">
      <div className="stats-header">
        <div className="date-time-container">
            <div className="date-display">
                <i className="fa-solid fa-calendar"></i>
                <span>{formattedDate}</span>
            </div>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-label">Jobs</div>
          <div className="stat-value">{completedJobs.length}/{totalJobs}</div>
          <div className="progress-mini">
            <div 
              className="progress-fill-mini completion" 
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-label">Revenue</div>
          <div className="stat-value">${completedRevenue.toFixed(0)}</div>
          <div className="progress-mini">
            <div 
              className="progress-fill-mini revenue" 
              style={{ width: `${revenueRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyStatsPanel;