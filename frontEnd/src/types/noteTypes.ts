export interface NoteBase {
  id: number;
  content: string;
  createdAt: string;
  lastModified: string;
  createdBy: string;
}

export interface PropertyNote extends NoteBase {
  propertyId: number;
}

export interface ScheduleNote extends NoteBase {
  scheduleId: number;
}

//TODO: Notes field for jobs in case of issues on site, can be useful when looking back at past jobs.
export interface JobNote extends NoteBase {
  jobId: number;
}

export type Note = PropertyNote | ScheduleNote | JobNote;
