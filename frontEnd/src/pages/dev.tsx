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

    const client_id = 11;
    const getProperties = async () => {
      await api.get(`/api/client/${client_id}/properties/`,{});
    };

    const getworkers = async () => {
      await api.get(`/api/user/workers/`,{});
    };


    const getPayment = async () =>{
      await api.get(`/api/daily/payments/`,{});
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
    
  </>
  )
  
};

export default Dev;