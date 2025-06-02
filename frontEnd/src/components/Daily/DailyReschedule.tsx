import React, { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import "../../styles/components/DailyResheduleStrip.css"

interface DailyRescheduleProps {
  isDragging?: boolean;
}

const DailyReschedule: React.FC<DailyRescheduleProps> = ({ isDragging }) => {
  const userTimeZone = useMemo(() => {
    return localStorage.getItem("userTimeZone") || "America/Chicago";
  }, []);
  
  const nextSixDays = useMemo(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 1; i <= 6; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      const formatter = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        timeZone: userTimeZone
      });
      
      days.push({
        dayNum: i,
        date: date,
        formatted: formatter.format(date)
      });
    }
    
    return days;
  }, [userTimeZone]);

  // Create the droppable areas
  const droppables = [
    useDroppable({ id: "droppable-1" }),
    useDroppable({ id: "droppable-2" }),
    useDroppable({ id: "droppable-3" }),
    useDroppable({ id: "droppable-4" }),
    useDroppable({ id: "droppable-5" }),
    useDroppable({ id: "droppable-6" })
  ];

  const deleteJob = useDroppable({ id: "delete-job" });
  
  if (!isDragging) {
    return null; 
  }

  return (
    <>
      <div className="daily-reschedule-strip-container">
        <section className="daily-reschedule-strip">
          {nextSixDays.map((day, index) => (
            <div 
              key={`day-${day.dayNum}`}
              ref={droppables[index].setNodeRef} 
              className={`box ${droppables[index].isOver ? 'is-over' : ''}`}
            >
              {/* Month and day at the bottom */}
              <span className="dates">
                {new Intl.DateTimeFormat('en-US', { 
                  month: 'long', 
                  day: 'numeric',
                  timeZone: userTimeZone 
                }).format(day.date)}
              </span>
              {/* Weekday at the top */}
              <span className="weekday">
                {new Intl.DateTimeFormat('en-US', { 
                  weekday: 'short',
                  timeZone: userTimeZone 
                }).format(day.date)}
              </span>
            </div>
          ))}
        </section>
      </div>
      <div className="daily-reschedule-delete">
        <div 
          ref={deleteJob.setNodeRef} 
          className={`trash-can ${deleteJob.isOver ? 'is-over' : ''}`}
        >
          <div className="trash-lid"></div>
          <div className="trash-container"></div>
          <div className="trash-label">Delete Job</div>
        </div>
      </div>
    </>
  );
};

export default DailyReschedule;