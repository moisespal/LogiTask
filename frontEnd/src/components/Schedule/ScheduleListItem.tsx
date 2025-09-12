import React from 'react';
import { ScheduleForManagement } from '../../types/interfaces';
import { formatCapitalized, daysUntilNextJob} from '../../utils/format';

interface ScheduleListItemProps {
  schedule: ScheduleForManagement;
  index: number;
}

const ScheduleListItem: React.FC<ScheduleListItemProps> = ({ schedule, index }) => {

  const userTimeZone = localStorage.getItem("userTimeZone") || "UTC";
  
 
  const clientName = schedule.property.client.firstName + 
    (schedule.property.client.lastName ? ` ${schedule.property.client.lastName}` : '');
    
  return (
    <li className={`list-item sch-item`}>
      <div className="list-item-header sch-header-row">
        <div className="sch-content">
          <div className="sch-header">
            <div className="sch-name-address">
              <div className="sch-address-inline sch-address">
                <i className="fa-solid fa-location-dot"></i>
                <span>{schedule.property.street}, {schedule.property.zipCode}</span>
              </div>
              <div className="sch-client-name sch-client">
                <i className="fa-solid fa-user"></i>
                <span> {clientName} </span>
              </div>
            </div>
            <div className="sch-priority" aria-label={`Priority ${index + 1}`}>
              <span>#{index + 1}</span>
            </div>
          </div>
          
          <div className="sch-details">
            <div className="service-tags sch-service-tags">
              <div className="service-pill service-item pill-container sch-service-pill">
                <i className="fa-solid fa-briefcase" />
                {formatCapitalized(schedule.service)}
              </div>
              <div className="frequency-pill service-item pill-container sch-frequency-pill">
                <i className="fa-solid fa-calendar-days" />
                {formatCapitalized(schedule.frequency)}
              </div>
              <div className="cost-pill service-item pill-container sch-cost-pill">
                <i className="fa-solid fa-dollar-sign"></i>
                {Math.floor(schedule.cost)}
              </div>
            </div>

            <div className ="service-pill pill-container sch-next-date-pill">
              <span>{daysUntilNextJob(schedule.nextDate, userTimeZone).text}</span>
            </div>
          </div>

        </div>
      </div>
    </li>
  );
};

export default ScheduleListItem