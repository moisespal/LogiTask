import React, { useEffect, useState } from 'react';
import api from '../api';

const Dev: React.FC = () => {
  
  

  const handlesubmit = async (e:React.FormEvent) =>{
    e.preventDefault();

    try{
      const response = await api.get("/api/properties-service-info/?client_id=54", {
        
      });
      if(response.status===201){
        return response.data
      }
    

      }catch(err){
        console.error("Error adding property:", err);
        alert(`Error: ${err}`);
    }
  }

  useEffect(() => {
    const fetchBalanceHistory = async () => {
      await api.get("/api/balance-history/44/", {});
    };
    const deleteJob = async () => {
      await api.delete("/api/job/delete/5/", {})
    };

  
    //fetchBalanceHistory();
    //deleteJob();
  },[]);

     const generateJobs = async () => {
      await api.get("/api/generateJobs/", {});
    };
  
  
  return(
  <>
    <div>Dev</div>;
    <button onClick={generateJobs}> TRY ME</button>
    
  </>
  )
  
};

export default Dev;