import React, { useState } from 'react';
import { Job } from '../../types/interfaces';
import PaymentModal from '../Payment/PaymentModal';
import '../../styles/components/DailyListItem.css';
import '../../styles/components/listItem.css';

interface DailyListItemProps {
  job: Job;
  isFocused: boolean;
  onClick: (id: number) => void;
  onComplete?: (id: number) => void;
}

const DailyListItem: React.FC<DailyListItemProps> = ({ job, isFocused, onClick, onComplete }) => {
  const isComplete = job.status === 'complete';
  const [isHovered, setIsHovered] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFocused && onComplete) {
      onComplete(job.id);
    } else {
      onClick(job.id);
    }
  };

  const handlePayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = (amount: string, method: string) => {
    // Here you would call your API to record the payment
    console.log(`Payment recorded for ${job.property.street}: $${amount} via ${method}`);
  };

  return (
    <>
      <li
        className={`list-item daily-item ${isFocused ? 'focused daily-focused' : ''} ${isComplete ? 'daily-complete' : ''} ${isHovered ? 'hovered' : ''}`}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-job-id={job.id}
      >
        <div className="list-item-header">
          <div 
            className={`daily-icon ${isComplete ? 'status-complete' : isFocused ? 'status-focused' : 'status-pending'}`}
          >
            {isComplete ? (
              <i className="fa-solid fa-check-circle"></i>
            ) : isFocused ? (
              <i className="fa-regular fa-circle-dot"></i>
            ) : (
              <i className="fa-regular fa-circle"></i>
            )}
          </div>
          <div className="daily-content">
            <div className="list-item-name daily-address">
              {job.property.street}
            </div>
            {isFocused && (
              <div className="client-action-buttons">
                <button 
                  className="client-payment-button" 
                  onClick={handlePayClick} 
                  title="Record payment"
                >
                  <i className="fa-solid fa-money-bill-wave"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </li>
      
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        job={job}
        onPaymentSubmit={handlePaymentSubmit}
      />
    </>
  );
};

export default DailyListItem;
