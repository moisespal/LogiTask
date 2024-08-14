import React from 'react';
import './Calendar.css';


//creates the Visit object with date and paid properties
interface Visit {
  date: string;
  paid: boolean;
}

//creates an object array that holds Visit objects in each element: ex:[{date, paid}, {date, paid}, {date, paid}]
interface CalendarProps { 
  visits: Visit[];
}

/// Creates a React functional component named Calendar that takes CalendarProps as props
/// <CalendarProps> ensures the props passed to this component match the CalendarProps interface
/// {visits} pulls the visits property from the props. able to use it directly in the component.
const Calendar: React.FC<CalendarProps> = ({ visits }) => {

  const today = new Date(); // grabs todays date and stores it in the today constant. 

  const last30Days = Array.from({ length: 30 }, (_, i) => { /// creates an array of 30 with indexes filling each one with the previous 30 days from today
    const date = new Date(); // gets todays date 
    date.setDate(today.getDate()-i); // sets the date to today minus the index, 
    return date; /// returns the date element to the last30Days array
  }).reverse(); /// reverses order so days go from oldest to today


  /// function to assign classNames to the 30 days from today, expects to pass a date when using the function
  const getDayClassName = (date: Date) => {

    //if the date passed in the function is found in the props array of objects, it returns the the object that contains that date. so {date, paid.
    const visit = visits.find(
      visit => new Date(visit.date).toDateString() === date.toDateString()
    );
    
    /// used to concatinate the className later
    let className = 'calendar-day';

    /// if it found the object then its either 'calendar-day.paid' or 'calendar-day.not-paid' as its 'class-name', depending on what the objects paid boolean holds
    if (visit) {
      className += visit.paid ? ' paid' : ' not-paid';
    }

    // if the 30 days include days not part of todays month then you are part of 'calendar-day.previous-month
    if (date.getMonth() !== today.getMonth()) {
      className += ' previous-month';
    }
    return className;
  };

  
  const firstDay = last30Days[0].getDay(); // Gets the day of the week for the first day (oldest of the 30 days) sun = 0, mon = 1 ... sat = 6 
  

// We create an array of blanks depending on the value of 'firstDay'
  const paddedDays = Array(firstDay).fill(null).concat(last30Days);

  return (

    <div className="calendar-container">

      {/* converts todays date to string form and converts it to its 'long' month name */}
      <h2>{today.toLocaleDateString('default', { month: 'long' })} {today.getFullYear()}</h2>


      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={index} className="calendar-weekday">{day}</div>
        ))}
        {paddedDays.map((day, index) => (
          day ? (
            <div key={index} className={getDayClassName(day)}>

              <span className="date">{day.getDate()}</span>
            </div>
          ) : (
            <div key={index} className="calendar-day empty"></div>
          )
        ))}
      </div>

    </div>
  );
};

export default Calendar;
