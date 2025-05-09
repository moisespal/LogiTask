import React, { useEffect, useState } from "react";
import api from "../api";
import { useLocation } from "react-router-dom";
import { Property, Schedule, ClientData } from "../types/interfaces";
import "../styles/pages/PropertyView.css";

const PropertyView: React.FC = () => {
  const location = useLocation();
  const { property, client } = location.state as {
    property: Property;
    client: ClientData;
  };

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedSchedules, setExpandedSchedules] = useState<
    Record<string, boolean>
  >({});
  const [showSchedules, setShowSchedules] = useState<boolean>(true);
  const [completedJobs, setCompletedJobs] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<string>("0");

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
        schedulesData.forEach((schedule: Schedule) => {
          if (schedule.id && schedule.isActive) {
            expandedMap[String(schedule.id)] = true;
          }
        });
        setExpandedSchedules(expandedMap);

        // Calculate completed jobs and revenue
        let completed = 0;
        let revenue = 0;

        schedulesData.forEach((schedule: Schedule) => {
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

  const formatCurrency = (amount: number | string): string => {
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
    const userTimezone = localStorage.getItem("userTimeZone") || "UTC";
    const date = new Date(dateString);

    const options: Intl.DateTimeFormatOptions = {
      timeZone: userTimezone,
      year: "numeric",
      month: "short",
      weekday: "short",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  }

  const formatDayofWeek = (dateString: string): string => {
    const userTimezone = localStorage.getItem("userTimeZone") || "UTC";
    const date = new Date(dateString);

    const options: Intl.DateTimeFormatOptions = {
      timeZone: userTimezone,
      weekday: "long",
    };
    return date.toLocaleDateString("en-US", options);
  }

  const daysUntilNextService = (nextDate: string): string => {
    const today = new Date();
    const nextServiceDate = new Date(nextDate);

    const daysDiff = nextServiceDate.getTime() - today.getTime();
    const daysUntil = Math.ceil(daysDiff / (1000 * 3600 * 24)) + 1;

    return daysUntil > 0 ? `${daysUntil} days` : "Today";
  }

  const toggleSchedule = (scheduleId: string, isActive: boolean) => {
    // Only toggle if the schedule is active
    if (isActive) {
      setExpandedSchedules((prev) => ({
        ...prev,
        [scheduleId]: !prev[scheduleId],
      }));
    }
  };

  const toggleAllSchedules = () => {
    setShowSchedules(!showSchedules);
  };

  const getFrequencyLabel = (frequency: string) => {
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

  return (
    <div className="property-view-container">
      {/* Property Header */}
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
            <button className="add-schedule-btn">+</button>
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
                      <div className="service-icon">
                        {getServiceIcon(schedule.service)}
                      </div>

                      <div className="service-content">
                        <div className="service-top-row">
                          <div className="service-name-container">
                            <div className="service-name">
                              {schedule.service || "Unnamed Service"}
                            </div>
                            <div className="service-status-badge">
                              <span
                                className={`status-badge ${
                                  schedule.isActive ? "active" : "inactive"
                                }`}
                              >
                                {schedule.isActive ? "ACTIVE" : "INACTIVE"}
                              </span>
                            </div>
                          </div>

                          <div className="service-price-container">
                            <div className="service-cost">
                              ${formatCurrency(schedule.cost)}
                            </div>
                            {schedule.isActive && (
                              <button
                                className="toggle-dropdown-btn"
                                onClick={() =>
                                  toggleSchedule(
                                    String(schedule.id || index),
                                    schedule.isActive
                                  )
                                }
                              >
                                {expandedSchedules[String(schedule.id || index)]
                                  ? "▼"
                                  : "▲"}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="service-bottom-row">
                          <div className="frequency-label">
                            {getFrequencyLabel(schedule.frequency)}
                          </div>
                          {schedule.nextDate && (
                            <div className="next-service-date">
                              Next: {formatDateLocal(schedule.nextDate)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {schedule.isActive &&
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
            <h3>Revenue to Date</h3>
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
                  ? formatDayofWeek(upcoming.nextDate) + " in " +
                      daysUntilNextService(upcoming.nextDate)
                  : "None scheduled";
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyView;
