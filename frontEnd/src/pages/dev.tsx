import { useState } from 'react';
import api from '../api';

const Dev: React.FC = () => {

    //  const generateJobs = async () => {
    //   await api.get("/api/generateJobs/", {});
    // };
    
    const schedule_id = 1
    const title = "FIRST NOTE3"
    const content = "DO NOT MOW"
    const createNote = async () => {
      await api.post(`/api/schedule/${schedule_id}/notes/`,  { title: title,content:content});
    };
    const noteID= 1
    const getNote = async () => {
      await api.get(`/api/schedule-note/${noteID}/`);
    }
    
  return(
  <>
    
    <button onClick={createNote}>SEND NOTE</button>
    <div>UPDATE NOTE</div>
    <button onClick={getNote}>GET NOTE</button>
    <div>DELETE Note</div>
    
    
    
  </>
  )
  
};

export default Dev;