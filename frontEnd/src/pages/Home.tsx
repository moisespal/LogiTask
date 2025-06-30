import React, { useState, useEffect, useRef } from 'react';
import ClientCalendar from '../components/Calendar/ClientCalendar';
import ClientListItem from '../components/Client/ClientListItem';
import ClientProperties from '../components/Client/ClientProperties';
import TopBar from '../components/Layout/TopBar';
import BottomBar from '../components/Layout/BottomBar';
import AddClientModal from '../components/Client/AddClientModal';
import DailyReschedule from '../components/Daily/DailyReschedule';
import { ClientDataID, Job } from '../types/interfaces';
import api from "../api"
import '../styles/pages/App.css';

import { DndContext, pointerWithin, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableDailyList from '../components/Daily/SortableDailyList';
// Utility functions

const renderStars = (count: number): JSX.Element[] => (
  Array.from({ length: count }, (_, i) => <span key={i} className="star">★</span>)
);

const restrictWithinWindow = ({ transform }: { transform: { x: number; y: number; scaleX: number; scaleY: number } }) => {
  const windowWidth = window.innerWidth;
  const maxRightDistance  = 0.2 * windowWidth;
  const maxLeftDistance = windowWidth * 0.66;
  
  return {
    ...transform,
    x: Math.max(-maxLeftDistance, Math.min(maxRightDistance, transform.x))
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

  const [activeJobId, setActiveJobId] = useState<number | null>(null);

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
    jobs.filter(job => job ?
      [job.client.firstName, job.client.lastName, job.property.street, job.client.phoneNumber, job.client.email, job.property.zipCode]
        .some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()))
        : false
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
          setFocusedItemId(null);
          setSelectedJob(null);
        }
    }
}, [filteredClients, filteredJobs, focusedItemId, modeType]);

  // This effect runs whenever focusedItemId changes
  useEffect(() => {
  if (focusedItemId === null || customers.length === 0 || jobs.length === 0) return;

  const selector = modeType === 'Client'
    ? `[data-client-id="${focusedItemId}"]`
    : `[data-job-id="${focusedItemId}"]`;
  
  const focusedElement = document.querySelector(selector);
  if (focusedElement) {
    focusedElementRef.current = focusedElement as HTMLDivElement;
    focusedElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }
}, [focusedItemId, modeType, customers, searchTerm, jobs]);

  const selectedClient = focusedItemId !== null ? filteredClients.find(client => client.id === focusedItemId) ?? null : null;

  const handleClientClick = (id: number) => {
    setFocusedItemId(id);
    sessionStorage.setItem('lastFocusedClientId', id.toString());
  };

  const handleJobClick = (id: number, job: Job) => {
    setFocusedItemId(id);
    setSelectedJob(job);
    sessionStorage.setItem('lastFocusedJobId', id.toString());
  };

  // Handle property modal state changes
  const handlePropertyModalStateChange = (isOpen: boolean) => {
    setIsPropertyModalOpen(isOpen);
  };
   
  useEffect(() => {
    if (modeType === "Client") {
      getClients();
      const savedFocusedId = sessionStorage.getItem('lastFocusedClientId');
      if (savedFocusedId) {
        setFocusedItemId(parseInt(savedFocusedId));
      }
    } else {
      fetchTodaysJobs();
      const savedFocusedId = sessionStorage.getItem('lastFocusedJobId');
      if (savedFocusedId) {
        setFocusedItemId(parseInt(savedFocusedId));
      }
    }
  }, [modeType]);

  useEffect(() => {
  if (modeType === 'Daily' && focusedItemId && jobs.length > 0) {
    const job = jobs.find(job => job.id === focusedItemId);
    if (job) {
      setSelectedJob(job);
    }
  }
}, [focusedItemId, jobs, modeType]);

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event; // active is the item being dragged, over is the item being hovered over
    setActiveJobId(null); // used to reset UI state after drag ends
    console.log('Drag Ended:', active.id, 'over:', over?.id);
    if (!over) return;
    if (active.id === over.id) {
      console.log('Dropped on itself, no action taken');
      return;
    }
  
    if (over.id.toString().includes('droppable-')) {
      const dayIndex = parseInt(over.id.toString().split('-')[1]); // uses the droppable id to determine how many days to shift the job

      try {
        const tz = localStorage.getItem("userTimeZone") || "America/Chicago";
        const target = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
        target.setHours(0, 0, 0, 0); // resets the time to midnight
        target.setDate(target.getDate() + dayIndex); // applies that shift to the current date

        const formattedDate = target.toISOString().slice(0, 10);

        const rescheduleJob = async () => {
            const response = await api.patch(`/api/Update-Schedule/${active.id}/`, {
              jobDate: formattedDate,
            });
            if (response.status === 200) {
              setJobs(prevJobs => {
                const updatedJobs = prevJobs.filter(job => job.id !== active.id);
                if (updatedJobs.length === 0) {
                  setSelectedJob(null);
                }
                return updatedJobs;
              });
            }
        };
        rescheduleJob();

      } catch (error) {
        console.error('Error rescheduling job:', error);
        alert('Failed to reschedule job');
      }
    }

    if (over.id == 'delete-job') {
      const deleteJob = async () => {
        try {
          const response = await api.delete(`/api/job/delete/${active.id}/`, {});
          if (response.status === 204) {
            setJobs(prevJobs => {
              const updatedJobs = prevJobs.filter(job => job.id !== active.id);
              if (updatedJobs.length === 0) {
                setSelectedJob(null);
              }
              return updatedJobs;
            });
            
          }
        } catch (error) {
          console.error('Error deleting job:', error);
          alert('Failed to delete job');
        }
      };
      deleteJob();
    }

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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveJobId(active.id as number)
  }

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
        <ClientCalendar visits={[]} client_id={focusedItemId?focusedItemId:null} />
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
            {jobs.length === 0 ? (
              <div className="no-jobs-message">
                  <>
                    <div className="no-jobs-icon">🎉</div>
                    <h3>All Done for Today!</h3>
                    <p>Check back tomorrow for new tasks</p>
                  </> 
              </div>
            )  : (
              <DndContext
                sensors={sensors}
                collisionDetection={pointerWithin}
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
                modifiers={[restrictWithinWindow]}
              >

                <SortableContext
                  items={filteredJobs.map(job => job.id)}
                  strategy={verticalListSortingStrategy}
                >
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
                            handleJobClick(id, job);
                          }}
                          onComplete={handleJobComplete}
                          isDisabled={isDraggingDisabled}
                          onModalToggle={toggleDraggingEnabled}
                        />
                      </div>
                    ))}  
                </SortableContext>
                <DragOverlay dropAnimation={null} style={{zIndex: 5}}>
                  {activeJobId ? (
                    <div 
                      key={activeJobId}
                      className="job-wrapper"
                      style={{ width: '100%'}}
                    >
                      <SortableDailyList
                        job={jobs.find(job => job.id === activeJobId)!}
                        isFocused={focusedItemId === activeJobId}
                        onClick={() => {}}
                        onComplete={handleJobComplete}
                        isDisabled={false}
                        isDragging={true}
                        onModalToggle={toggleDraggingEnabled}
                      />
                    </div>
                  ) : null}
                </DragOverlay>
                <DailyReschedule 
                  isDragging={activeJobId !== null && jobs.find(job => job.id === activeJobId)?.status !== 'complete'} 
                />
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
