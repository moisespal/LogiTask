import React, {useMemo, useState} from 'react';
import { Job, PaymentWithClient } from '../../types/interfaces';
import '../../styles/components/DailyStatsModal.css';

interface DailyStatsPanelProps {
  jobs: Job[];
  payments: PaymentWithClient[];
  isVisible: boolean;
}

const DailyStatsPanel: React.FC<DailyStatsPanelProps> = ({ jobs, payments, isVisible }) => {
  const [showPaymentsList, setShowPaymentsList] = useState(false);
  const userTimezone = localStorage.getItem('userTimezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        timeZone: userTimezone
    });
  }, [userTimezone]);

  const formatPaymentTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: userTimezone
    });
  };

  if (!isVisible) return null;

  const completedJobs = jobs.filter(job => job.status === 'complete');
  const totalJobs = jobs.length;
  const completionRate = totalJobs > 0 ? (completedJobs.length / totalJobs) * 100 : 0;
  
  const totalJobsCost = jobs.reduce((sum, job) => sum + Number(job.cost), 0);
  const totalPaymentsReceived = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
  const paymentCollectionRate = totalJobsCost > 0 ? (totalPaymentsReceived / totalJobsCost) * 100 : 0;

  return (
    <div className="daily-stats-panel">
      <div className="stats-header">
        <div className="date-time-container">
            <div className="date-display">
                <span>{formattedDate}</span>
            </div>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-label">Jobs</div>
          <div className="stat-value-daily">{completedJobs.length}/{totalJobs}</div>
          <div className="progress-mini">
            <div 
              className="progress-fill-mini completion" 
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">Payments</div>

          <button 
            className="stat-value-daily payments-header-btn"
            onClick={() => setShowPaymentsList(!showPaymentsList)}
            title="Click to view payment details"
          >
            ${totalPaymentsReceived.toFixed(0)}
          </button>
          <div className="progress-mini">
            <div 
              className="progress-fill-mini payments" 
              style={{ width: `${paymentCollectionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Payments List */}
      {showPaymentsList && (
        <div className="payments-list-container">
          <div className="payments-list-header">
            <h4>Payments ({payments.length})</h4>
            <button 
              className="close-payments-list" 
              onClick={() => setShowPaymentsList(false)}
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
          
          {payments.length === 0 ? (
            <div className="no-payments">
              <i className="fa-solid fa-receipt"></i>
              <p>No payments recorded yet :,(</p>
            </div>
          ) : (
            <div className="payments-list">
              {payments.map((payment) => (
                <div 
                  key={payment.id} 
                  className="payment-item" 
                  data-payment-type={payment.paymentType}
                >
                  <div className="payment-left">
                    <h4 className="payment-client-name">
                      {payment.client.firstName} {payment.client.lastName}
                    </h4>
                    <div className="payment-method-display">
                      <h3 className="payment-amount">${parseFloat(payment.amount).toFixed(2)}</h3>
                      <span className="payment-method">
                        {payment.paymentType.charAt(0).toUpperCase() + payment.paymentType.slice(1)}
                      </span>
                    </div>
                    
                  </div>
                  
                  <div className="payment-right">
                    <div className="payment-time">
                      {formatPaymentTime(payment.paymentDate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyStatsPanel;