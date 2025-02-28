import React, { useState, useEffect, useRef } from 'react';
import ClientCalendar from '../components/Calendar/ClientCalendar';
import ClientListItem from '../components/Client/ClientListItem';
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
  const listRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isModeRotated, setIsModeRotated] = useState(false);
  const [customers, setCustomer] = useState([])
  
  useEffect(()=>{
    getClients();
  }, [])

  const getClients = () => {
    api
        .get("/api/clients/")
        .then((res) => res.data)
        .then((data) => {
            setCustomer(data);
            console.log(data);
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
      if (isAddClientModalOpen) return;
      
      if (e.key === 'Backspace') setSearchTerm(prev => prev.slice(0, -1));
      else if (/^[a-zA-Z0-9,.\s]$/.test(e.key)) setSearchTerm(prev => prev + e.key);
      else if (e.key === 'ArrowRight') navigateFocusedItem(1);
      else if (e.key === 'ArrowLeft') navigateFocusedItem(-1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredClients]);

  const navigateFocusedItem = (direction: number) => {
    if (filteredClients.length === 0) return;
    setFocusedItemId(prevId => {
      const currentIndex = filteredClients.findIndex(client => client.id === prevId);
      const newIndex = Math.min(Math.max(currentIndex + direction, 0), filteredClients.length - 1);
      const newFocusedItemId = filteredClients[newIndex]?.id ?? null;
  
      if (newFocusedItemId !== null) {
        const newItemIndex = filteredClients.findIndex(client => client.id === newFocusedItemId);
        listRefs.current[newItemIndex]?.scrollIntoView({
          behavior: 'auto',
          block: 'center'
        });
      }
  
      return newFocusedItemId;
    });
  };

  // Automatically focus the first or reset focus when needed
  useEffect(() => {
    if (filteredClients.length === 1) setFocusedItemId(filteredClients[0].id);
    else if (filteredClients.length > 1 && !filteredClients.some(client => client.id === focusedItemId)) {
      setFocusedItemId(null);
    }
  }, [filteredClients, focusedItemId]);

  const selectedClient = focusedItemId !== null ? filteredClients.find(client => client.id === focusedItemId) : null;

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
        {customers.map((client: Client) => (
          <ClientListItem
            key={client.id}
            client={client}
            isFocused={focusedItemId === client.id}
            onClick={() => setFocusedItemId(client.id)}
            renderStars={renderStars}
          />
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
