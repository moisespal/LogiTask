// Calendar.tsx
import React, { useRef, useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import './Calendar.css';

// Interface for the Visit object
interface Visit {
  date: string;
  paid: boolean;
}

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


  // Generate the last 30 days, oldest to today
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - (29 - i)); // Adjusted to get the correct dates
    return date;
  });

  // Function to assign classNames to days
  const getDayClassName = (date: Date) => {
    const visit = visits.find(visit => {
      const [year, month, day] = visit.date.split('-').map(Number);
      const visitDate = new Date(year, month - 1, day);
      return visitDate.toDateString() === date.toDateString();
    });

    let className = 'calendar-day';

    // Mark today's date
    if (date.toDateString() === today.toDateString()) {
      className += ' today';
    }

    if (visit) {
      className += visit.paid ? ' paid' : ' not-paid';
    }

    if (date.getMonth() !== today.getMonth()) {
      className += ' previous-month';
    }
    return className;
  };

  // Get the day of the week for the first day
  const firstDay = last30Days[0].getDay();

  // Create an array of blanks for padding
  const paddedDays = Array(firstDay).fill(null).concat(last30Days);

  return (
    <Draggable
      onStart={handleDragStart}
    >
      <div className="calendar-container" ref={calendarRef}>
        <h2>
          {today.toLocaleDateString('default', { month: 'long' })} {today.getFullYear()}
        </h2>

        <div className="calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={index} className="calendar-weekday">{day}</div>
          ))}
          {paddedDays.map((day, index) =>
            day ? (
              <div key={index} className={getDayClassName(day)}>
                <span className="date">{day.getDate()}</span>
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
