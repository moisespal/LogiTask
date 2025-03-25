import React, { useState, useEffect } from 'react';
import { Job, Client } from '../../types/interfaces';
import '../../styles/components/PaymentModal.css';
import api from '../../api';
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  job?: Job;
  client?: Client;
  onPaymentSubmit: (amount: string, method: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  job, 
  client, 
  onPaymentSubmit 
}) => {
  // If job is provided, use its cost, otherwise default to 0
  const [paymentAmount, setPaymentAmount] = useState(job ? job.cost.toString() : '0');
  const [paymentMethod, setPaymentMethod] = useState('');

  // Reset payment amount when job or client changes
  useEffect(() => {
    if (job) {
      setPaymentAmount(job.cost.toString());
    } else {
      setPaymentAmount('');
    }
  }, [job, client]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
   
    try {
      job?.client.id
      const propertyResponse = await api.post("/api/payments/", {
          amount:paymentAmount,
          paymentType:paymentMethod,
          client_id: client?.id || job?.client.id
      }, { headers: { // Correctly formatted object
          'Content-Type': 'application/json'
      }});
      if (propertyResponse.status === 201) {
        alert("Payment received")
      }
    }catch (err) {
      console.error("Error adding Payment:", err);
      alert(`Error: ${err}`);
  }   

    onPaymentSubmit(paymentAmount, paymentMethod);
    onClose();
    setPaymentMethod('');
    const cost = job?.cost || '0'
    setPaymentAmount(cost.toString())
  };

  if (!isOpen) return null;
  
  return (
    <div 
      className="payment-modal-overlay" 
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div 
        className="payment-modal-container" 
        onClick={(e) => {
          e.stopPropagation(); 
          e.preventDefault();
        }}
      >
        <button 
          type="button"
          className="close-modal-btn" 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close"
        >
          x
        </button>
        
        <h3>Record Payment</h3>
        
        <form onSubmit={handleSubmit}>
            <div className="payment-form-section">
              <div className="payment-section-title">
                {job ? 'Property Information' : 'Client Information'}
              </div>
              
              {/* Only show property info if job is provided */}
              {job && (
                <div className="payment-property-info">
                  <i className="fa-solid fa-location-dot"></i>
                  <span>{job.property.street}</span>
                </div>
              )}
              
              <div className="payment-client-info">
                <i className="fa-solid fa-user"></i>
                <span>
                  {job ? `${job.client.firstName} ${job.client.lastName}` : 
                    client ? `${client.firstName} ${client.lastName}` : 'Client'}
                </span>
              </div>
            </div>
            
            <div className="payment-form-section">
              <label htmlFor="payment-amount" className="payment-section-title">Payment Amount</label>
              <div className="payment-amount-container">
                <div className="payment-amount-input-container">
                  <span className="dollar-sign">$</span>
                  <input
                    id="payment-amount"
                  name="payment-amount"
                    type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                    min="0"
                    step="1"
                    required
                  onClick={(e) => e.stopPropagation()}
                    placeholder="Amount"
                  />
                </div>
              </div>
            </div>
            
            <div className="payment-form-section">
              <div className="payment-section-title">Payment Method</div>
              <div className="payment-method-options" role="radiogroup">
          <button
            type="button"
                className={`payment-method-pill ${paymentMethod === 'cash' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
                  handlePaymentMethodSelect('cash');
            }}
                aria-pressed={paymentMethod === 'cash'}
          >
                <i className="fa-solid fa-money-bill"></i> Cash
          </button>
              <button 
                type="button"
                className={`payment-method-pill ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePaymentMethodSelect('card');
                }}
                aria-pressed={paymentMethod === 'card'}
              >
                <i className="fa-solid fa-credit-card"></i> Card
              </button>
              <button 
                type="button"
                className={`payment-method-pill ${paymentMethod === 'check' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePaymentMethodSelect('check');
                }}
                aria-pressed={paymentMethod === 'check'}
              >
                <i className="fa-solid fa-money-check-dollar"></i> Check
              </button>
              <button 
                type="button"
                className={`payment-method-pill ${paymentMethod === 'venmo' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePaymentMethodSelect('venmo');
                }}
                aria-pressed={paymentMethod === 'venmo'}
              >
                <i className="fa-brands fa-venmo"></i> Venmo
              </button>
              
              {/* Hidden input to store the selected payment method for form submission */}
              <input 
                type="hidden" 
                name="payment-method" 
                value={paymentMethod} 
                required
              />
      </div>
            </div>
            
            <div className="payment-form-actions">
              <button 
                type="button"
                className="property-btn-secondary" 
              onClick={(e) => {
                e.stopPropagation();
                  onClose();
                }}
              >
                <i className="fas fa-times"></i> Cancel
              </button>
              <button 
                type="submit"
                className="property-btn-primary" 
                disabled={!paymentMethod}
                onClick={(e) => e.stopPropagation()} // Ensure this does not block form submission
              >
                <i className="fas fa-check"></i> Record Payment
              </button>
              
            </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal; 