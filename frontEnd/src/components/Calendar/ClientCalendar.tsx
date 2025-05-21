// Calendar.tsx
import React, { useRef, useState, useEffect} from 'react';
import Draggable from 'react-draggable';
import '../../styles/components/ClientCalendar.css';
import { Visit } from '../../types/interfaces'; // Import Visit interface
import { FaDollarSign } from 'react-icons/fa';
import api from '../../api';
// Interface for the Visit object

// Interface for the component props
interface CalendarProps {
  visits: Visit[];
  client_id: number;
}

interface balance {
  balance_adjustment: string;
  current_balance: string;
  id: number;
  update_at: Date;
  estimated_balance:string;
}

const ClientCalendar: React.FC<CalendarProps> = ({ visits,client_id }) => {
  const [showBalance, setShowBalance] = useState(false);
  const [balance, setBalance] = useState<balance>();
  const today = new Date();

  // Ref to access the calendar container
  const calendarRef = useRef<HTMLDivElement>(null);

  // Ref to track if the user has moved the calendar
  const hasMoved = useRef(false);

  // Handler for when dragging starts
  const handleDragStart = () => {
    hasMoved.current = true;
  };

  // Calculate the total amount owed
 
  // Generate the last 30 days, oldest to today
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - (29 - i));
    return date;
  });

  // Function to assign classNames to days
  const getDayClassName = (date: Date) => {
    const visit = visits.find(visit => {
      const [year, month, dayOfMonth] = visit.date.split('-').map(Number);
      const visitDate = new Date(year, month - 1, dayOfMonth);
      return visitDate.toDateString() === date.toDateString();
    });

    let className = 'calendar-day';

    // Mark today's date
    if (date.toDateString() === today.toDateString()) {
      className += ' today';
    }

    if (visit) {
      if (visit.paid) {
        className += ' paid';
      } else if (visit.complete) {
        className += ' not-paid';
      }
    }

    // Only add 'previous-month' if there is no visit
    if (date.getMonth() !== today.getMonth() && !visit) {
      className += ' previous-month';
    }

    return className;
  };

  // Get the day of the week for the first day
  const firstDay = last30Days[0].getDay();

  // Create an array of blanks for padding
  const paddedDays = Array(firstDay).fill(null).concat(last30Days);
  
  const handleClick = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
        // Create the property associated with the client
        const balanceResponse = await api.get(`/api/get_estimated_balance/${client_id}/`);
        if (balanceResponse.status === 200) {
            // Reset form fields
            
            setBalance(balanceResponse.data)
                
        }
        else {
            alert("Failed to get balance.");
        }

    } catch (err) {
        console.error("Error adding property:", err);
        alert(`Error: ${err}`);
    }   

    useEffect(() => {
      setShowBalance(false);
    }, [client_id]);
};
  return (
    <Draggable onStart={handleDragStart}>
      <div className="calendar-container" ref={calendarRef}>
        <div className="calendar-header">
          <h2>
            {today.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button 
            className={`balance-toggle ${showBalance ? 'active' : ''}`} 
            onClick={() => {
              handleClick(new MouseEvent('click') as unknown as React.FormEvent)
              setShowBalance(!showBalance)

            }
            
            }
            title={showBalance ? "Hide Balance" : "Show Balance"}
          >
            <FaDollarSign />
          </button>
        </div>

        <div className="calendar-content">
          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <div key={index} className="calendar-weekday">{day}</div>
            ))}
            {paddedDays.map((day, index) =>
              day ? (
                <div key={index} className={getDayClassName(day)}>
                  <span className="date">{day.getDate()}</span>
                  {/* Show tooltip on hover if there's a visit */}
                  {(() => {
                    const visit = visits.find(visit => {
                      const [year, month, dayOfMonth] = visit.date.split('-').map(Number);
                      const visitDate = new Date(year, month - 1, dayOfMonth);
                      return visitDate.toDateString() === day.toDateString();
                    });
                    if (visit) {
                      return (
                        <div className="tooltip">
                          <span className="tooltip-text">
                            {visit.paid ? 'Paid' : 'Due'}: ${visit.charge.toFixed(2)}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              ) : (
                <div key={index} className="calendar-day empty" />
              )
            )}
          </div>
        </div>

        <div className={`balance-info ${showBalance ? 'show' : ''}`}>
          <div className="outstanding-balance">
            <span>Outstanding Balance</span>
            <span 
              style={{ color: balance && parseFloat(balance.estimated_balance) < 0 ? 'red' : 'green' }}
            >
                {balance && parseFloat(balance.estimated_balance) < 0 
                ? `$${Math.abs(parseFloat(balance.estimated_balance)).toFixed(2)}` 
                : `$${parseFloat(balance?.estimated_balance || '0').toFixed(2)}`}
            </span>
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default ClientCalendar;
