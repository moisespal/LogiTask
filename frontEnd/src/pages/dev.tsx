import React from 'react';
import api from '../api';

const Dev: React.FC = () => {
  


  const handlesubmit = async (e:React.FormEvent) =>{
    e.preventDefault();

    try{
      const response = await api.get("/api/properties-service-info/?client_id=33", {
        
      });
      if(response.status===201){
        return response.data
      }
    

      }catch(err){
        console.error("Error adding property:", err);
        alert(`Error: ${err}`);
    }
  }
  
  
  return(
  <>
    <div>Dev</div>;
    <button onClick={handlesubmit}> TRY ME</button>
  </>
  )
  
};

export default Dev;