import React from "react";
import { Job } from "../../types/interfaces";
import "../../styles/components/NoteSection.css";

interface NotesSectionProps {
  selectedJob: Job | null;
  isDraggingDisabled?: boolean;
}

const NotesSection: React.FC<NotesSectionProps> = ({ selectedJob, isDraggingDisabled }) => {
  if (!selectedJob) return null;

  const propertyNote = selectedJob.property.propertynote;
  const scheduleNote = selectedJob.schedule.schedulenote;

  return (
    <div className={`notes-section ${isDraggingDisabled ? "fade-out" : ""}`}>
      {propertyNote && (
        <div className="note-card property">
          <div className="note-header">
            <span>Property Note</span>
            <button className="note-edit-btn">
              <i className="fa-solid fa-pen"></i>
            </button>
          </div>
          <div className="note-content">
            <p>{propertyNote.content}</p>
          </div>
        </div>
      )}
      {scheduleNote && (
        <div className="note-card schedule">
          <div className="note-header">
            <span>Schedule Note</span>
            <button className="note-edit-btn">
              <i className="fa-solid fa-pen"></i>
            </button>
          </div>
          <div className="note-content">
            <p>{scheduleNote.content}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesSection;
