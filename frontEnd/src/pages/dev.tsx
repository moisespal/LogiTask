import { useState } from 'react';
import api from '../api';

const Dev: React.FC = () => {

    //  const generateJobs = async () => {
    //   await api.get("/api/generateJobs/", {});
    // };
    const username = 'worker5@gmail.com'
    const password = '123'
    const createworker = async () => {
      await api.post("/api/worker/create/",  { username, password });
    };

    const client_id = 1;
    const getProperties = async () => {
      await api.get(`/api/client/${client_id}/properties/`,{});
    };

    const getworkers = async () => {
      await api.get(`/api/user/workers/`,{});
    };


    const getPayment = async () =>{
      await api.get(`/api/daily/payments/`,{});
    };

    const updateClient = async () =>{
      await api.patch(`/api/client/${client_id}/update/`,{
        //firstName:'Joe2',
        //lastName: 'momma',
        phoneNumber: '911',
       // email:'34@gmail.com'

      });
    };
    const date='Friday'    
    const getSchedules = async () =>{
      await api.get(`/api/schedules/management/?date=${date}`,{
       
      });
    };
    const [scheduleIDs, setSchedulesID] = useState([39,54,44,46,51,52,55,56,57])
    const [newOrder, setOder] = useState([57,54,44,46,51,52,55,56,39])
    const updateOrder = async () => {
      await api.post("/api/schedules/reorder/",  { schedules: newOrder});
    };
  return(
  <>
    <div>Dev</div>;
    <button onClick={createworker}> TRY ME</button>
    <div>Dev</div>;
    <button onClick={getProperties}> TRY ME</button>
    <div>workers</div>;
    <button onClick={getworkers}> TRY ME</button>
    <div>payments</div>
    <button onClick={getPayment}>me</button>
    <button onClick={getPayment}>me</button>
    <button onClick={getPayment}>me</button>
    <div>update</div>
    <button onClick={updateClient}>me</button>
    <div>schedules</div>
    <button onClick={getSchedules}>me</button>
    <div>change order</div>
    <button onClick={updateOrder}>REORDER</button>
    
  </>
  )
  
};

export default Dev;