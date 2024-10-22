// Calendar.tsx
import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import './Calendar.css';
import { Visit } from '../types/interfaces'; // Import Visit interface

// Interface for the Visit object

// Interface for the component props
interface CalendarProps {
  visits: Visit[];
}

const Calendar: React.FC<CalendarProps> = ({ visits }) => {
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
  const totalAmountOwed = visits
    .filter(visit => visit.complete && !visit.paid)
    .reduce((sum, visit) => sum + visit.charge, 0);

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

  return (
    <Draggable onStart={handleDragStart}>
      <div className="calendar-container" ref={calendarRef}>
        <h2>
          {today.toLocaleDateString('default', { month: 'long' })} {today.getFullYear()}
        </h2>

        {/* Display total amount owed */}
        <div className="total-amount-owed">
          Outstanding Balance: ${totalAmountOwed.toFixed(2)}
        </div>

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
                          {visit.paid ? 'Paid' : 'Charged'} - ${visit.charge}
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
    </Draggable>
  );
};

export default Calendar;
