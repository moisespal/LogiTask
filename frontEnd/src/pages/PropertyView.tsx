import React, { useEffect, useState, useRef } from "react";
import api from "../api";
import { useLocation } from "react-router-dom";
import { Property, ClientSchedule, ClientData } from "../types/interfaces";
import "../styles/pages/PropertyView.css";
import ConfirmationDialog  from "../components/Dialog/ConfirmationDialog";
import AddSchedule from "../components/Property/AddSchedule";
import SelectButtons from "../components/Dialog/SelectButtons";

const PropertyView: React.FC = () => {
  const location = useLocation();
  const { property, client } = location.state as {
    property: Property;
    client: ClientData;
  };

  const [schedules, setSchedules] = useState<ClientSchedule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedSchedules, setExpandedSchedules] = useState<
    Record<string, boolean>
  >({});
  const [showSchedules, setShowSchedules] = useState<boolean>(true);
  const [completedJobs, setCompletedJobs] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<string>("0");

  const [addScheduleOpen, setAddScheduleOpen] = useState<boolean>(false);
  const handleAddScheduleClose = (newSchedule?: ClientSchedule) => {
    setAddScheduleOpen(false);

    if (newSchedule) {
      console.log("New schedule added:", newSchedule);
      setSchedules((prevSchedules) => [...prevSchedules, newSchedule]);
    }

  };  

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogOpenFrequency, setDialogOpenFrequency] = useState(false);
  const [dialogOpenNextDate, setDialogOpenNextDate] = useState(false);

  const [dialogData, setDialogData] = useState<{
    scheduleId?: number;
    newStatus?: boolean;
    serviceName?: string;
    frequency?: string;
    cost?: number;
    nextDate?: string;
    endDate?: string;
  }>({});

  const [selected, setSelected] = useState<number | null>(null);
  const buttons = ['Once', 'Weekly', 'Biweekly', 'Monthly'];

  const nextRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);


  const openPicker = (ref: React.RefObject<HTMLInputElement>) => {
    if (ref.current?.showPicker) ref.current.showPicker();
    else ref.current?.click();
  };
  
  useEffect(() => {
    // Fetch schedules data
    api
      .get(`/api/schedule-jobs/?property_id=${property.id}`)
      .then((res) => {
        console.log("Loaded schedules:", res.data);
        const schedulesData = res.data;
        setSchedules(schedulesData);

        // Set all active schedules to expanded by default
        const expandedMap: Record<string, boolean> = {};
        schedulesData.forEach((schedule: ClientSchedule) => {
          if (schedule.id && schedule.isActive) {
            expandedMap[String(schedule.id)] = true;
          }
        });
        setExpandedSchedules(expandedMap);

        // Calculate completed jobs and revenue
        let completed = 0;
        let revenue = 0;

        schedulesData.forEach((schedule: ClientSchedule) => {
          if (schedule.jobs && Array.isArray(schedule.jobs)) {
            schedule.jobs.forEach((job) => {
              if (job.status === "complete") {
                completed++;
                revenue += parseFloat(String(job.cost || 0));
              }
            });
          }
        });

        // Only update if we have valid data
        if (completed > 0) setCompletedJobs(completed);
        if (revenue > 0)
          setTotalRevenue(
            revenue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          );

        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading schedules:", err);
        setIsLoading(false);
      });
  }, [property.id]);

  const formatCurrency = (amount: number | string | undefined): string => {
    if (amount === undefined || amount === null) return "0.00";
    if (typeof amount === "number") {
      return amount.toFixed(2);
    }
    // Try to parse the string as a number
    const parsed = parseFloat(amount);
    if (!isNaN(parsed)) {
      return parsed.toFixed(2);
    }
    return amount;
  };

  const formatDateLocal = (dateString: string): string => {

    if (!dateString) return "No date available";

    const userTimezone = localStorage.getItem("userTimeZone") || "UTC";
    
    // Parse date components
    const [year, month, day] = dateString.split('T')[0].split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0);

    const options: Intl.DateTimeFormatOptions = {
      timeZone: userTimezone,
      year: "numeric",
      month: "short",
      day: "numeric",
    };
  
  return date.toLocaleDateString("en-US", options);
}

  const formatDayofWeek = (dateString: string): string => {
    if (!dateString) return "No date available";
    const userTimezone = localStorage.getItem("userTimeZone") || "UTC";
    const [year, month, day] = dateString.split('T')[0].split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0);
    
    const options: Intl.DateTimeFormatOptions = {
      timeZone: userTimezone,
      weekday: "long",
  };
  
  return date.toLocaleDateString("en-US", options);
}

  const daysUntilNextService = (nextDate: string): { days: number, text: string } => {

    const nextServiceDate = new Date(nextDate);
    const todayString = getTodayInUserTimezone();
    const today = new Date(todayString);

    const daysDiff = nextServiceDate.getTime() - today.getTime();
    const daysUntil = Math.ceil(daysDiff / (1000 * 3600 * 24));
    
    // Return both the numeric value and formatted text
    if (daysUntil === 1) {
      return { days: 1, text: "Tomorrow" };
    } else {
      return { days: daysUntil, text: `${daysUntil} days` };
    }
  };

  const getTodayInUserTimezone = (): string => {
    const userTimezone = localStorage.getItem("userTimeZone") || "CST";

    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: userTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const parts = formatter.formatToParts(now);
    const month = parts.find(part => part.type === 'month')?.value;
    const day = parts.find(part => part.type === 'day')?.value;
    const year = parts.find(part => part.type === 'year')?.value;

    return `${year}-${month}-${day}`;
  }

  const capitalizeWords = (text: string | undefined): string => {
  if (!text) return '';
  
  // Split by spaces, capitalize each word, then join back
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

  const toggleSchedule = (scheduleId: string) => {
    setExpandedSchedules((prev) => ({
      ...prev,
      [scheduleId]: !prev[scheduleId],
  }));
};

  const toggleAllSchedules = () => {
    setShowSchedules(!showSchedules);
  };

  const getFrequencyLabel = (frequency: string | undefined) => {
    switch (frequency?.toLowerCase()) {
      case "weekly":
        return "Every week";
      case "biweekly":
        return "Every 2 weeks";
      case "monthly":
        return "Every month";
      default:
        return frequency || "Not set";
    }
  };

  // Helper to get service icon based on service name
  const getServiceIcon = (serviceName: string) => {
    const service = serviceName?.toLowerCase() || "";

    if (service.includes("mow") || service.includes("lawn")) {
      return "🚜";
    } else {
      return "🛠️"; // Default icon for other services
    }
  };

const handleStatusConfirm = async() => {
  try {
    console.log(dialogData.newStatus);
    const newStatus = dialogData.newStatus;
    
    // Create the request payload based on status
   const payload: { isActive: boolean; endDate: string | null } = { 
      isActive: newStatus ?? false,
      endDate: newStatus === false ? getTodayInUserTimezone() : null
    };
    
    // If setting to inactive, add today's date as the end date
    if (newStatus === false) {
      const today = getTodayInUserTimezone();
      payload.endDate = today;
      console.log("End date set to:", today);
      console.log("Payload for deactivation:", payload);
    }
    
    const response = await api.patch(
      `/api/update-schedule-status/${dialogData.scheduleId}/`, 
      payload
    );
    
    if (response.status === 200) {
      setSchedules(prev =>
        prev.map(schedule =>
          schedule.id === dialogData.scheduleId
            ? { 
                ...schedule, 
                isActive: Boolean(newStatus),
                endDate: payload.endDate
              }
            : schedule
        )
      );   
      setExpandedSchedules(prev => ({
        ...prev,
        [dialogData.scheduleId!.toString()]: Boolean(newStatus),
      }));
    }
  } catch(error) {
    console.error('Error toggling schedule status:', error);
}
  
  // Close the dialog
  setDialogOpen(false);
};

  const handleFrequencyConfirm = async() => {
    if (selected === null) {
      console.warn("No frequency selected");
      return;
    }

    const newFrequency = buttons[selected];

     const response = await api.patch(
      `/api/update-schedule-status/${dialogData.scheduleId}/`,
      { frequency: newFrequency }
    );

    if (response.status === 200) {
      setSchedules(prev =>
        prev.map(schedule =>
          schedule.id === dialogData.scheduleId
            ? { 
                ...schedule, 
                frequency: newFrequency,
              }
            : schedule
        )
      );
      setDialogOpenFrequency(false);
      setSelected(null);
    } else {  
      console.error("Failed to update frequency:", response.statusText);
    }
  }

const handleNextDateConfirm = async() => {
  if (!dialogData.nextDate) {
    console.warn("No next date set");
    return;
  }

  const response = await api.patch(
    `/api/update-schedule-status/${dialogData.scheduleId}/`,
    { nextDate: dialogData.nextDate 
      , endDate: dialogData.endDate || null
    }
  );

  if (response.status === 200) {
      setSchedules(prev =>
        prev.map(schedule =>
          schedule.id === dialogData.scheduleId
            ? { 
                ...schedule, 
                nextDate: dialogData.nextDate || schedule.nextDate,
                endDate: dialogData.endDate || null,
              }
            : schedule
        )
      );
    console.log("Next date updated successfully:", dialogData.nextDate);
    setDialogOpenNextDate(false);
    } 
  else {
    console.error("Failed to update next date:", response.statusText);
  }
};


  const handleAddScheduleClick = () => {
    setAddScheduleOpen(true);
  };

  return (
    <div className="property-view-container">
      {/* Property Header */}
      <div className="return-button-container">
        <button className="return-button" onClick={() => window.history.back()}>
          <i className="fa-solid fa-arrow-left"></i>
          <span>Back</span>
        </button>
      </div>
      <div className="property-header-card">
        <div className="property-map">
          <img
            src={
              "https://st2.depositphotos.com/7341970/10438/v/950/depositphotos_104389540-stock-illustration-city-map-with-streets.jpg"
            }
            alt="Property Map"
          />
          <div className="map-pin"></div>
        </div>
        <div className="property-details">
          <h2>
            {property.street}, {property.city}, {property.state}{" "}
            {property.zipCode}
          </h2>

          <div className="client-info-container">
            <div className="client-header">
              <div className="client-avatar">
                <div className="avatar-placeholder"></div>
                <img
                  src={
                    "https://i.pinimg.com/736x/c0/74/9b/c0749b7cc401421662ae901ec8f9f660.jpg"
                  }
                  alt="Client Avatar"
                />
              </div>
              <div className="client-details">
                <h3>
                  {client.firstName} {client.lastName}
                </h3>
                <div className="contact-icons">
                  <i className="fa-solid fa-phone"></i>
                  <span>{client.phoneNumber}</span>

                  <i className="fa-solid fa-envelope"></i>
                  <span>{client.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-layout">
        {/* Left Column - Schedules */}
        <div className="schedules-column">
          <div className="schedules-header">
            <h2>SCHEDULES</h2>
            <button className="add-schedule-btn" onClick={handleAddScheduleClick}>+</button>
            <button
              className="toggle-dropdown-btn"
              onClick={toggleAllSchedules}
            >
              {showSchedules ? "▼" : "▲"}
            </button>
          </div>

          {isLoading ? (
            <div className="loading-message">Loading schedules...</div>
          ) : schedules.length === 0 ? (
            <div className="empty-message">No service schedules found</div>
          ) : (
            showSchedules && (
              <div className="schedules-list">
                {schedules.map((schedule, index) => (
                  <div
                    key={schedule.id || index}
                    className={`schedule-item ${
                      schedule.isActive ? "active" : "inactive"
                    }`}
                  >
                    <div className="schedule-summary">

                      <div className="service-content">
                        <div className="service-top-row">
                          <div className="service-name-container">
                            <div className="service-icon">
                              {getServiceIcon(schedule.service)}
                            </div>
                            <div className="service-name">
                              {capitalizeWords(schedule.service) || "Unnamed Service"}
                            </div>
                          </div>

                          <div className="service-price-container">
                            <div className="service-cost">
                              ${formatCurrency(schedule.cost)}
                            </div>
                            <button
                              className="toggle-dropdown-btn"
                              onClick={() =>
                                toggleSchedule(
                                  String(schedule.id || index),
                                )
                              }
                            >
                              {expandedSchedules[String(schedule.id || index)]
                                ? "▼"
                                : "▲"}
                            </button>
                          </div>
                        </div>

                        <div className="service-bottom-row">
                          <div className="left-info">
                            <div className="service-status-badge">
                                <button
                                  className={`status-badge status-button ${
                                    schedule.isActive ? "active" : "inactive"
                                  }`}
                                  onClick={() => {
                                    setDialogData({
                                      scheduleId: schedule.id,
                                      newStatus: !schedule.isActive,
                                      serviceName: schedule.service,
                                      frequency: schedule.frequency,
                                      cost: schedule.cost,
                                      nextDate: schedule.nextDate,
                                    });
                                    setDialogOpen(true);
                                  }}
                                >
                                  {schedule.isActive ? "ACTIVE" : "INACTIVE"}
                                </button>
                              </div>
                            <div className="frequency-label-container">
                              <button className="frequency-label"
                                onClick={() => {
                                  setDialogData({
                                      scheduleId: schedule.id,
                                      frequency: schedule.frequency,
                                    });
                                    const currentIndex = buttons.findIndex(b => b.toLowerCase() === schedule.frequency?.toLowerCase());
                                    setDialogOpenFrequency(true);
                                    setSelected(currentIndex !== -1 ? currentIndex : null);
                                }}
                              >
                                {getFrequencyLabel(schedule.frequency)}
                              </button>
                            </div>
                          </div>
                          {schedule.isActive ? (
                            <button className="next-service-date"
                              onClick={() => {
                                setDialogData({
                                  scheduleId: schedule.id,
                                  nextDate: schedule.nextDate,
                                  endDate: schedule.endDate || "",
                                });
                                setDialogOpenNextDate(true);
                              }}
                            >
                              {formatDateLocal(schedule.nextDate)}
                            </button>
                          ) :
                            
                            <div className="ended-service-date">
                              {"Ended: " + formatDateLocal(schedule.endDate || "")}
                            </div>
                          }
                        </div>
                      </div>
                    </div>

                    {
                      expandedSchedules[String(schedule.id || index)] && (
                        <div className="job-history-section">
                          <div className="job-table">
                            <div className="job-table-header">
                              <div className="job-date-column">DATE</div>
                              <div className="job-status-column">STATUS</div>
                              <div className="job-cost-column">AMOUNT</div>
                            </div>

                            <div className="job-history-list">
                              {schedule.jobs && schedule.jobs.length > 0 ? (
                                schedule.jobs.map((job, jobIndex) => (
                                  <div
                                    key={job.id || jobIndex}
                                    className="job-item"
                                  >
                                    <div className="job-date">
                                      {formatDateLocal((job.jobDate))}
                                    </div>
                                    <div className="job-status">
                                      <span
                                        className={`job-status-badge status-${job.status?.toLowerCase()}`}
                                      >
                                        {job.status}
                                      </span>
                                    </div>
                                    <div className="job-cost">
                                      ${formatCurrency(job.cost)}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="empty-message">
                                  No job history available
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Right Column - Stats */}
        <div className="stats-column">
          <div className="stat-card">
            <h3>Completed Jobs</h3>
            <div className="stat-value">{completedJobs}</div>
          </div>

          <div className="stat-card">
            <h3>Service Total</h3>
            <div className="stat-value">${totalRevenue}</div>
          </div>

          <div className="stat-card">
            <h3>Next Scheduled Service</h3>
            <div className="stat-value">
              {(() => {
                const activeSchedules = schedules.filter(
                  (s) => s.isActive && s.nextDate
                );
                if (activeSchedules.length === 0) return "None scheduled";

                const today = new Date();
                const upcoming = activeSchedules
                  .sort(
                    (a, b) =>
                      new Date(a.nextDate).getTime() -
                      new Date(b.nextDate).getTime()
                  )
                  .find((s) => new Date(s.nextDate) >= today);

                return upcoming
                  ? (() => {
                      const serviceInfo = daysUntilNextService(upcoming.nextDate);
                      if (serviceInfo.days === 1) {
                        return "Tomorrow";
                      } else {
                        return `${formatDayofWeek(upcoming.nextDate)} in ${serviceInfo.text}`;
                      }
                    })()
                  : "None scheduled";
              })()}
            </div>
          </div>
        </div>
      </div>
      <ConfirmationDialog
        open={dialogOpen}
        title="Confirm Status Change"
        message={
          <>
            <div className="dialog-service-preview">
              <div className="dialog-service-info">
                <div className="top-row">
                  <div className="service-icon">
                    {getServiceIcon(dialogData.serviceName || "")}
                  </div>
                  <div className="dialog-service-name">
                    {dialogData.serviceName || "Unnamed Service"}
                  </div>
                  <div className="dialog-service-cost">
                    ${formatCurrency(dialogData.cost)}
                  </div>
                </div>
                

                <div className="dialog-service-meta">
                  <span>{getFrequencyLabel(dialogData.frequency)}</span>
                  <div className="dialog-next-service-date">
                    {dialogData.nextDate ? formatDateLocal(dialogData.nextDate) : "No date set"}
                  </div>
                </div>
              </div>
            </div>
            <div className="dialog-status-change">
              <p>Change status to:
                <span className={`dialog-status dialog-status-${dialogData.newStatus ? 'active' : 'inactive'}`}>
                  {dialogData.newStatus ? "ACTIVE" : "INACTIVE"}
                </span>
              </p>
            </div>
          </>
        }
        onConfirm={handleStatusConfirm}
        onCancel={() => setDialogOpen(false)}
      />
      <ConfirmationDialog
        open={dialogOpenFrequency}
        title="Confirm Frequency Change"
        message={
            <SelectButtons
              selected={selected}
              setSelected={setSelected}
              buttons={buttons}
            />
        }
        onConfirm={handleFrequencyConfirm}
        onCancel={() => {
          setDialogOpenFrequency(false);
          setSelected(null);
        }}
      />
      <ConfirmationDialog
        open={dialogOpenNextDate}
        title="Confirm Next Service Date"
        message={
          <div className="date-card">
            {/* ---------- NEXT DATE ---------- */}

            <div className="date-item">
              <button
                type="button"
                className="date-btn next"
                aria-label="Pick next service date"
                onClick={() => openPicker(nextRef)}
              >
                <i className="fa-regular fa-calendar"></i>
                <span>Next</span>
              </button>

              {/* hidden native input */}
              <input
                ref={nextRef}
                type="date"
                value={dialogData.nextDate}
                onChange={(e) =>
                  setDialogData({ ...dialogData, nextDate: e.target.value })
                }
                className="sr-only"
              />

              <div className="date-readout">{dialogData.nextDate ? formatDateLocal(dialogData.nextDate) : 'None Set'}</div>
            </div>

            {/* ---------- END DATE ---------- */}
            <div className="date-item">
              <button
                type="button"
                className="date-btn end"
                aria-label="Pick end date"
                onClick={() => openPicker(endRef)}
              >
                <i className="fa-regular fa-calendar-xmark"></i>
                <span>End</span>
              </button>

              <input
                ref={endRef}
                type="date"
                value={dialogData.endDate}
                onChange={(e) =>
                  setDialogData({ ...dialogData, endDate: e.target.value })
                }
                className="sr-only"
              />

              <div className="date-readout">{dialogData.endDate ? formatDateLocal(dialogData.endDate) : 'Not Set'}</div>
            </div>
          </div>}
        onConfirm={handleNextDateConfirm}
        onCancel={() => setDialogOpenNextDate(false)}
      />
      <AddSchedule
        isOpen={addScheduleOpen}
        onClose={handleAddScheduleClose}
        propertyId={property.id}
      />
    </div>
  );
};

export default PropertyView;
