import React, { useState } from 'react';
import api from '../api';
import AddSchedule from '../components/Property/AddSchedule';
const Dev: React.FC = () => {
  const [isopen, setOpen ] = useState<boolean>(true)
  const onClose = (): void => {
    setOpen((prevState: boolean | undefined) => !prevState);
  }

  const handlesubmit = async (e:React.FormEvent) =>{
    e.preventDefault();

    try{
      const response = await api.get("/api/properties-service-info/?client_id=34", {
        
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
    <AddSchedule isOpen={isopen} onClose={onClose} propertyId={38}/>
  </>
  )
  
};

export default Dev;