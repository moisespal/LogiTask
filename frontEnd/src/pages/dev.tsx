import api from '../api';

const Dev: React.FC = () => {

    //  const generateJobs = async () => {
    //   await api.get("/api/generateJobs/", {});
    // };
    const createworker = async () => {
      await api.get("/api/worker/create/", {});
    };
  
  
  return(
  <>
    <div>Dev</div>;
    <button onClick={createworker}> TRY ME</button>
    
  </>
  )
  
};

export default Dev;