import { useState } from 'react';
import api from '../api';

const Dev: React.FC = () => {

    //  const generateJobs = async () => {
    //   await api.get("/api/generateJobs/", {});
    // };
    
    const schedule_id = 2
    const title = "FIRST NOTE3"
    const content = "DO NOT MOW"
    const createNote = async () => {
      await api.post(`/api/job/${schedule_id}/notes/`,  { title: title,content:content});
    };
    const noteID= 2
    const UpdateNote = async () => {
      await api.patch(`/api/schedule-notes/${noteID}/`, {content:content});
    }
    const DeleteNote = async () => {
      await api.delete(`/api/schedule-notes/${noteID}/`,{});
    }
  return(
  <>
    
    <button onClick={createNote}>SEND NOTE</button>
    <div>UPDATE NOTE</div>
    <button onClick={UpdateNote}>UPDATE NOTE</button>
    <div>DELETE Note</div>
    <button onClick={DeleteNote}>DELETE NOTE</button>
    
    
  </>
  )
  
};

export default Dev;