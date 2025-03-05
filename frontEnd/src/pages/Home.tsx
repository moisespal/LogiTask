import React, { useState, useEffect, useRef } from 'react';
import ClientCalendar from '../components/Calendar/ClientCalendar';
import ClientListItem from '../components/Client/ClientListItem';
import ClientProperties from '../components/Client/ClientProperties';
import TopBar from '../components/Layout/TopBar';
import BottomBar from '../components/Layout/BottomBar';
import AddClientModal from '../components/Client/AddClientModal';
import { Client } from '../types/interfaces';
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
  const [modeType, setModeType] = useState('Client');
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isModeRotated, setIsModeRotated] = useState(false);
  const [customers, setCustomer] = useState<Client[]>([]);
  const focusedElementRef = useRef<HTMLDivElement | null>(null);
  
  // Load clients when component mounts
  useEffect(() => {
    getClients();
  }, []);
  
  // Listen for reload-clients event
  useEffect(() => {
    const handleReloadClients = () => {
      getClients();
    };
    
    window.addEventListener('reload-clients', handleReloadClients);
    
    return () => {
      window.removeEventListener('reload-clients', handleReloadClients);
    };
  }, []);

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


  // Event Handlers
  const handleModeClick = () => {
    setModeType(prev => (prev === 'Client' ? 'Daily' : 'Client'));
    setIsModeRotated(prev => !prev);
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
      [client.firstName, client.lastName, client.address, client.phone, client.email, client.lawnSize]
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
  }, [filteredClients, isAddClientModalOpen, isPropertyModalOpen]);

  const navigateFocusedItem = (direction: number) => {
    if (filteredClients.length === 0) return;
    
    setFocusedItemId(prevId => {
      const currentIndex = filteredClients.findIndex(client => client.id === prevId);
      const newIndex = Math.min(Math.max(currentIndex + direction, 0), filteredClients.length - 1);
      return filteredClients[newIndex]?.id ?? null;
    });
  };

  // Handle property modal state changes
  const handlePropertyModalStateChange = (isOpen: boolean) => {
    setIsPropertyModalOpen(isOpen);
  };

  // Automatically focus the first or reset focus when needed
  useEffect(() => {
    if (filteredClients.length === 1) setFocusedItemId(filteredClients[0].id);
    else if (filteredClients.length > 1 && !filteredClients.some(client => client.id === focusedItemId)) {
      setFocusedItemId(null);
    }
  }, [filteredClients, focusedItemId]);

  // This effect runs whenever focusedItemId changes
  useEffect(() => {
    if (focusedItemId === null) return;
    
    // Find the element with the matching data-client-id attribute
    const focusedElement = document.querySelector(`[data-client-id="${focusedItemId}"]`);
    if (focusedElement) {
      // Store reference to focused element
      focusedElementRef.current = focusedElement as HTMLDivElement;
      
      // Scroll into view with smooth behavior
      focusedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [focusedItemId]);

  const selectedClient = focusedItemId !== null ? filteredClients.find(client => client.id === focusedItemId) : null;

  // Modify your client click handler
  const handleClientClick = (id: number) => {
    setFocusedItemId(id);
  };

  return (
    <div
      className="app-container" 
      style={{
        backgroundImage: `url(${selectedClient?.image || 'https://oldschoolgrappling.com/wp-content/uploads/2018/08/Background-opera-speeddials-community-web-simple-backgrounds.jpg'})`
      }}
    >      
      {modeType === 'Client' && (
      selectedClient ? (
        <ClientCalendar visits={selectedClient.visits ?? []} />
      ) : null
      )}
    
      <TopBar
      focusedItemId={focusedItemId}
      selectedClient={selectedClient || null}
      sortOption={sortOption}
      handleSortChange={handleSortChange}
      />

      <input
      type="text"
      className={`search-bar ${searchTerm ? 'active' : ''}`}
      value={searchTerm}
      onChange={handleChange}
      placeholder="Search: Type to search"
      />
    
      <ul className="right-aligned-list">
        {filteredClients.map((client: Client) => (
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
                phoneNumber: client.phone || '',
                properties: client.properties || []
              }} 
              visible={focusedItemId === client.id}
              onPropertyModalStateChange={handlePropertyModalStateChange}
            />
          </div>
        ))}
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
