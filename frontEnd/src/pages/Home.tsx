import React, { useState, useEffect, useRef } from 'react';
import ClientCalendar from '../components/Calendar/ClientCalendar';
import ClientListItem from '../components/Client/ClientListItem';
import ClientProperties from '../components/Client/ClientProperties';
import TopBar from '../components/Layout/TopBar';
import BottomBar from '../components/Layout/BottomBar';
import AddClientModal from '../components/Client/AddClientModal';
import DailyListItem from '../components/Daily/DailyListItem';
import { Client, Job } from '../types/interfaces';
import api from "../api"
import '../styles/pages/App.css';

// Utility functions

const renderStars = (count: number): JSX.Element[] => (
  Array.from({ length: count }, (_, i) => <span key={i} className="star">★</span>)
);

const getTodayDayString = (): string =>
  new Date().toLocaleDateString('en-US', { weekday: 'long' });

// Main Component
const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedItemId, setFocusedItemId] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<string>('none');
  const [modeType, setModeType] = useState(()=>{
    return localStorage.getItem('mode') || "Client";
  });
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isModeRotated, setIsModeRotated] = useState(false);
  const [customers, setCustomer] = useState<Client[]>([]);
  const focusedElementRef = useRef<HTMLDivElement | null>(null);
  
  // New job-related states
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isGeneratingJobs, setIsGeneratingJobs] = useState(false);
  
 
 

  const getClients = () => {
    api
        .get("/api/clients/")
        .then((res) => res.data)
        .then((data) => {
            setCustomer(data);
            console.log('Clients loaded:', data);
        })
        .catch((err) => alert(err));
  };

  // Function to generate today's jobs
  const generateTodaysJobs = async () => {
    try {
      setIsGeneratingJobs(true);
      await api.get('/api/generateJobs/');
      await fetchTodaysJobs(); // Fetch jobs after generation
    } catch (error) {
      console.error('Error generating jobs:', error);
    } finally {
      setIsGeneratingJobs(false);
    }
  };

  // Function to fetch today's jobs
  const fetchTodaysJobs = async () => {
    try {
      const response = await api.get('/api/getTodaysJobs/');
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };
  function getUTCISOString() {
    return new Date().toISOString();
  }
  // Handle job completion toggle
  const handleJobComplete = async (jobId: number) => {
    try {
      const job = jobs.find(job => job.id === jobId);
      if (!job) return;
      const newStatus = job.status === 'complete' ? 'uncomplete' : 'complete';
      const dateTime = job.status === 'complete' ? null : getUTCISOString();
      await api.patch(`/api/Update-Schedule/${jobId}/`, { status: newStatus, complete_date:dateTime })
      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, status: newStatus } : job
      ));
    } catch (error) {
      console.error('Error toggling job completion:', error);
    }
  };

  // Event Handlers
  const handleModeClick = async () => {
    const newMode = modeType === 'Client' ? 'Daily' : 'Client';
    localStorage.setItem('mode',newMode)
    setModeType(newMode);
    setIsModeRotated(prev => !prev);
    
    
    
    // Reset focused item when switching modes
    setFocusedItemId(null);
    setSelectedJob(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);

  const handleSortChange = (option: string) => setSortOption(option);

  // Filtering and Sorting
  const filterClientsByMode = (clients: Client[]): Client[] => {
    if (modeType === 'Daily') {
      const todayDayString = getTodayDayString();
      return clients.filter(client =>(client.tags ?? []).some(tag => tag.day === todayDayString));
    }
    return clients;
  };

  const filterClientsBySearch = (clients: Client[]): Client[] => 
    clients.filter(client =>
      [client.firstName, client.lastName, client.address, client.phoneNumber, client.email, client.lawnSize]
        .some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const sortClients = (clients: Client[]): Client[] =>
    [...clients].sort((a, b) => {
      switch (sortOption) {
        case 'firstName': return a.firstName.localeCompare(b.firstName);
        case 'address': return a.address.localeCompare(b.address);
        case 'lawnSize': return parseInt(a.lawnSize) - parseInt(b.lawnSize);
        default: return 0;
      }
    });

  const filteredClients = sortClients(filterClientsBySearch(filterClientsByMode(customers)));

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Create a more explicit check for modals being open
      // and return early to prevent search from being affected
      if (isAddClientModalOpen || isPropertyModalOpen) {
        return;
      }
      
      // Check if the event target is an input, textarea, or other form element
      const target = e.target as HTMLElement;
      const isFormElement = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.tagName === 'SELECT' ||
        target.isContentEditable;
        
      // Don't capture keystrokes when user is typing in a form element
      if (isFormElement) {
        return;
      }
      
      if (e.key === 'Backspace') {
        setSearchTerm(prev => prev.slice(0, -1));
      }
      else if (/^[a-zA-Z0-9,.\s]$/.test(e.key)) {
        setSearchTerm(prev => prev + e.key);
      }
      else if (e.key === 'ArrowRight') {
        navigateFocusedItem(1);
      }
      else if (e.key === 'ArrowLeft') {
        navigateFocusedItem(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredClients, jobs, modeType, isAddClientModalOpen, isPropertyModalOpen]);

  const navigateFocusedItem = (direction: number) => {
    if (modeType === 'Client') {
      if (filteredClients.length === 0) return;
      
      setFocusedItemId(prevId => {
        const currentIndex = filteredClients.findIndex(client => client.id === prevId);
        const newIndex = Math.min(Math.max(currentIndex + direction, 0), filteredClients.length - 1);
        return filteredClients[newIndex]?.id ?? null;
      });
    } else {
      // Daily mode - navigate through jobs
      if (jobs.length === 0) return;
      
      const currentJobIndex = jobs.findIndex(job => job.id === focusedItemId);
      const newJobIndex = Math.min(Math.max(currentJobIndex + direction, 0), jobs.length - 1);
      const selectedJob = jobs[newJobIndex];
      
      if (selectedJob) {
        setFocusedItemId(selectedJob.id);
        setSelectedJob(selectedJob);
      }
    }
  };

  // Automatically focus the first or reset focus when needed
  useEffect(() => {
    if (modeType === 'Client') {
      if (filteredClients.length === 1) setFocusedItemId(filteredClients[0].id);
      else if (filteredClients.length > 1 && !filteredClients.some(client => client.id === focusedItemId)) {
        setFocusedItemId(null);
      }
    } else {
      // Auto-focus first job in Daily mode when jobs change
      if (jobs.length > 0 && (!focusedItemId || !jobs.some(job => job.id === focusedItemId))) {
        setFocusedItemId(jobs[0].id);
        setSelectedJob(jobs[0]);
      }
    }
  }, [filteredClients, jobs, focusedItemId, modeType]);

  // This effect runs whenever focusedItemId changes
  useEffect(() => {
    if (focusedItemId === null) return;
    
    // Find the element with the matching data attribute
    const selector = modeType === 'Client' 
      ? `[data-client-id="${focusedItemId}"]` 
      : `[data-job-id="${focusedItemId}"]`;
    
    const focusedElement = document.querySelector(selector);
    if (focusedElement) {
      // Store reference to focused element
      focusedElementRef.current = focusedElement as HTMLDivElement;
      
      // Scroll into view with smooth behavior
      focusedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [focusedItemId, modeType]);

  const selectedClient = focusedItemId !== null ? filteredClients.find(client => client.id === focusedItemId) : null;

  // Modify your client click handler
  const handleClientClick = (id: number) => {
    setFocusedItemId(id);
  };

  // Handle property modal state changes
  const handlePropertyModalStateChange = (isOpen: boolean) => {
    setIsPropertyModalOpen(isOpen);
  };
   
  useEffect(()=>{
    if (modeType==="Client"){
      getClients();
    }else{
      fetchTodaysJobs();
    }
  }, [modeType]);
  
  return (
    <div
      className="app-container" 
      style={{
        backgroundImage: `url(${selectedClient?.image || 'https://oldschoolgrappling.com/wp-content/uploads/2018/08/Background-opera-speeddials-community-web-simple-backgrounds.jpg'})`
      }}
    >      
      {modeType === 'Client' && selectedClient && (
        <ClientCalendar visits={selectedClient?.visits ?? []} client_id={selectedClient?.id} />
      )}
    
      <TopBar
        focusedItemId={focusedItemId}
        selectedClient={selectedClient || null}
        selectedJob={selectedJob}
        mode={modeType as 'Client' | 'Daily'}
        sortOption={sortOption}
        handleSortChange={handleSortChange}
      />

      <input
        type="text"
        className={`search-bar ${searchTerm ? 'active' : ''}`}
        value={searchTerm}
        onChange={handleChange}
        placeholder={modeType === 'Client' ? "Search clients..." : "Search jobs..."}
      />
    
      <ul className="right-aligned-list">
        {modeType === 'Client' ? (
          // Client list rendering
          filteredClients.map((client: Client) => (
            <div 
              key={client.id} 
              className="client-wrapper"
              data-client-id={client.id}
            >
              <ClientListItem
                client={client}
                isFocused={focusedItemId === client.id}
                onClick={() => handleClientClick(client.id)}
                renderStars={renderStars}
              />
              
              <ClientProperties 
                client={{
                  ...client,
                  phoneNumber: client.phoneNumber || '',
                  properties: client.properties || []
                }} 
                visible={focusedItemId === client.id}
                onPropertyModalStateChange={handlePropertyModalStateChange}
              />
            </div>
          ))
        ) : (
          // Daily jobs list rendering
          <>
            {isGeneratingJobs ? (
              <div className="loading-jobs">
                Generating today's jobs...
              </div>
            ) : jobs.length === 0 ? (
              <div className="no-jobs-message">
                No jobs scheduled for today
              </div>
            ) : (
              jobs.map((job: Job) => (
                <div 
                  key={job.id}
                  className="job-wrapper"
                  data-job-id={job.id}
                >
                  <DailyListItem
                    job={job}
                    isFocused={focusedItemId === job.id}
                    onClick={(id) => {
                      setFocusedItemId(id);
                      setSelectedJob(job);
                    }}
                    onComplete={handleJobComplete}
                  />
                </div>
              ))
            )}
          </>
        )}
      </ul>
      
      <BottomBar
        isModeRotated={isModeRotated}
        handleModeClick={handleModeClick}
        openAddClientModal={() => setIsAddClientModalOpen(true)}
      />
            
      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
      />
    </div>
  );
}

export default Home;
