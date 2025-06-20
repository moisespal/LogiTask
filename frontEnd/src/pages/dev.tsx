import api from '../api';

const Dev: React.FC = () => {

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