import React, { useState, useEffect, useRef } from 'react';
import ClientCalendar from '../components/Calendar/ClientCalendar';
import ClientListItem from '../components/Client/ClientListItem';
import ClientProperties from '../components/Client/ClientProperties';
import TopBar from '../components/Layout/TopBar';
import BottomBar from '../components/Layout/BottomBar';
import AddClientModal from '../components/Client/AddClientModal';
import { ClientDataID, Job } from '../types/interfaces';
import api from "../api"
import '../styles/pages/App.css';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableDailyList from '../components/Daily/SortableDailyList';
import { AnimatePresence } from 'framer-motion';
// Utility functions

const renderStars = (count: number): JSX.Element[] => (
  Array.from({ length: count }, (_, i) => <span key={i} className="star">★</span>)
);

const restrictWithinWindow = ({ transform }: { transform: { x: number; y: number; scaleX: number; scaleY: number } }) => {
  const windowWidth = window.innerWidth;
  const maxRightDistance = windowWidth * 0; 
  const maxLeftDistance = windowWidth * 0.62;
  
  return {
    ...transform,
    x: Math.max(-maxLeftDistance, Math.min(maxRightDistance, transform.x)),
  };
};

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
  const [customers, setCustomer] = useState<ClientDataID[]>([]);
  const focusedElementRef = useRef<HTMLDivElement | null>(null);
  
  // New job-related states
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  const [isDraggingDisabled, setIsDraggingDisabled] = useState(false);

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
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);

  const handleSortChange = (option: string) => setSortOption(option);

  // Filtering and Sorting
  const filterClientsByMode = (clients: ClientDataID[]): ClientDataID[] => {
    return clients;
  };

  const filterClientsBySearch = (clients: ClientDataID[]): ClientDataID[] => 
    clients.filter(client =>
      [client.firstName, client.lastName, client.phoneNumber, client.email, client.properties?.[0]?.street, client.properties?.[0]?.zipCode]
        .some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const filterJobsBySearch = (jobs: Job[]): Job[] =>
    jobs.filter(job =>
      [job.client.firstName, job.client.lastName, job.property.street, job.client.phoneNumber, job.client.email, job.property.zipCode]
        .some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const filteredJobs = filterJobsBySearch(jobs);

  const sortClients = (clients: ClientDataID[]): ClientDataID[] =>
    [...clients].sort((a, b) => {
      switch (sortOption) {
        case 'firstName': return a.firstName.localeCompare(b.firstName);
        case 'lastName': return a.lastName.localeCompare(b.lastName);
        case 'phoneNumber': return a.phoneNumber.localeCompare(b.phoneNumber);
        default: return 0;
      }
    });

  const filteredClients = sortClients(filterClientsBySearch(filterClientsByMode(customers)));

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      if (filteredJobs.length === 0) return;
      
      const currentJobIndex = filteredJobs.findIndex(job => job.id === focusedItemId);
      const newJobIndex = Math.min(Math.max(currentJobIndex + direction, 0), filteredJobs.length - 1);
      const selectedJob = filteredJobs[newJobIndex];
      
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
        // Daily mode - use filteredJobs instead of jobs
        if (filteredJobs.length === 1) {
          // Auto-focus when exactly one job matches the search
          setFocusedItemId(filteredJobs[0].id);
          setSelectedJob(filteredJobs[0]);
        } 
        else if (filteredJobs.length > 1 && (!focusedItemId || !filteredJobs.some(job => job.id === focusedItemId))) {
          setFocusedItemId(filteredJobs[0].id);
          setSelectedJob(filteredJobs[0]);
        }
        else if (filteredJobs.length === 0) {
          // If no jobs match, clear the selection
          setFocusedItemId(null);
          setSelectedJob(null);
        }
    }
}, [filteredClients, filteredJobs, focusedItemId, modeType]);

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

  const selectedClient = focusedItemId !== null ? filteredClients.find(client => client.id === focusedItemId) ?? null : null;

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setJobs((currentJobs) => {
        const oldIndex = currentJobs.findIndex(job => job.id === active.id);
        const newIndex = currentJobs.findIndex(job => job.id === over.id);
        
        const reorderedJobs = [...currentJobs];
        const [movedJob] = reorderedJobs.splice(oldIndex, 1);
        reorderedJobs.splice(newIndex, 0, movedJob);
        
        return reorderedJobs;
      });
    }
  };

  const toggleDraggingEnabled = (isDisabled: boolean) => {
  setIsDraggingDisabled(isDisabled);
};
  
  return (
    <div
      className="app-container" 
      style={{
        backgroundImage: `url('https://oldschoolgrappling.com/wp-content/uploads/2018/08/Background-opera-speeddials-community-web-simple-backgrounds.jpg')`
      }}
    >      
      {modeType === 'Client' && selectedClient && (
        <ClientCalendar visits={[]} client_id={1} />
      )}
    
      <TopBar
        focusedItemId={focusedItemId}
        selectedClient={selectedClient}
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
          filteredClients.map((client: ClientDataID) => (
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
            {filteredJobs.length === 0 ? (
              <div className="no-jobs-message">
                {jobs.length === 0 ? "No jobs scheduled for today" : "No jobs match your search"}
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictWithinWindow]}
              >
                <SortableContext
                  items={filteredJobs.map(job => job.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <AnimatePresence>
                    {filteredJobs.map((job: Job) => (
                      <div 
                        key={job.id}
                        className="job-wrapper"
                        data-job-id={job.id}
                      >
                        <SortableDailyList
                          job={job}
                          isFocused={focusedItemId === job.id}
                          onClick={(id) => {
                            setFocusedItemId(id);
                            setSelectedJob(job);
                          }}
                          onComplete={handleJobComplete}
                          isDisabled={isDraggingDisabled}
                          onModalToggle={toggleDraggingEnabled}
                        />
                      </div>
                    ))}
                  </AnimatePresence>
                </SortableContext>
              </DndContext>
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
