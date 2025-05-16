import React, { useEffect, useState } from 'react';
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
    fetchBalanceHistory();
  },[]);
  
  
  return(
  <>
    <div>Dev</div>;
    <button onClick={handlesubmit}> TRY ME</button>
    <AddSchedule isOpen={isopen} onClose={onClose} propertyId={38}/>
  </>
  )
  
};

export default Dev;