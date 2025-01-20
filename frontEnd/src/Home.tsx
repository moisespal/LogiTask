import React, { useState, useEffect, useRef } from 'react';
import addresses from './data.json';
import Calendar from './components/Calendar';
import TopBar from './components/TopBar';
import AddClientModal from './components/AddClientModal';
import { Client } from './types/interfaces';
import './App.css';
import { FaExchangeAlt, FaUserPlus } from 'react-icons/fa';
import api from "./api"

// Utility functions
const getStars = (lawnSize: string): number => {
  const size = parseInt(lawnSize.replace(/\D/g, ''), 10);
  if (isNaN(size)) return 0;
  return Math.min(Math.floor((size - 350) / 100) + 1, 7);
};

const renderStars = (count: number): JSX.Element[] => (
  Array.from({ length: count }, (_, i) => <span key={i} className="star">★</span>)
);

const getTodayDayString = (): string =>
  new Date().toLocaleDateString('en-US', { weekday: 'long' });

const getOrdinalSuffix = (day: number): string => {
  if (day > 3 && day < 21) return 'th';
  const suffixes = ['th', 'st', 'nd', 'rd'];
  return suffixes[(day % 10)] || 'th';
};

// Main Component
const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedItemId, setFocusedItemId] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<string>('none');
  const [modeType, setModeType] = useState('Client');
  const [clients, setClients] = useState<Client[]>(addresses);
  const listRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isModeRotated, setIsModeRotated] = useState(false);

  // Event Handlers
  const handleModeClick = () => {
    setModeType(prev => (prev === 'Client' ? 'Daily' : 'Client'));
    setIsModeRotated(prev => !prev);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);

  const handleItemClick = (id: number) => {
    if (modeType === 'Daily') {
      setClients(prevClients => 
        prevClients.map(client =>
          client.id === id
            ? { ...client, selected: getNextStatus(client) }
            : client
        )
      );
    }
    setFocusedItemId(id);
  };

  const handleSortChange = (option: string) => setSortOption(option);

  const getNextStatus = (client: Client) => {
    if (client.id !== focusedItemId) return client.selected;
    if (client.selected === 'Complete') return 'Paid';
    if (client.selected === 'Paid') return 'None';
    return 'Complete';
  };

  // Filtering and Sorting
  const filterClientsByMode = (clients: Client[]): Client[] => {
    if (modeType === 'Daily') {
      const todayDayString = getTodayDayString();
      return clients.filter(client => client.tags.some(tag => tag.day === todayDayString));
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
        case 'phone': return a.phone.localeCompare(b.phone);
        case 'lawnSize': return parseInt(a.lawnSize) - parseInt(b.lawnSize);
        default: return 0;
      }
    });

  const filteredClients = sortClients(filterClientsBySearch(filterClientsByMode(clients)));

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') setSearchTerm(prev => prev.slice(0, -1));
      else if (/^[a-zA-Z0-9,.\s]$/.test(e.key)) setSearchTerm(prev => prev + e.key);
      else if (e.key === 'ArrowRight') navigateFocusedItem(1);
      else if (e.key === 'ArrowLeft') navigateFocusedItem(-1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredClients]);

  const navigateFocusedItem = (direction: number) => {
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

  // Formatting Date
  const today = new Date();
  const formattedDate = `${today.toLocaleDateString('en-US', { weekday: 'long' })}, ${today.toLocaleDateString('en-US', { month: 'long' })} ${today.getDate()}${getOrdinalSuffix(today.getDate())}`;

  const selectedClient = focusedItemId !== null ? filteredClients.find(client => client.id === focusedItemId) : null;

  const handleAddClient = (newClient: Partial<Client>) => {
    // Logic to add the new client to your state or send to backend
    console.log('New client:', newClient);
    // Close the modal after adding the client
    setIsAddClientModalOpen(false);
  };

  return (
    <div 
      className="app-container" 
      style={{
        backgroundImage: `url(${selectedClient?.image || 'https://wallpapers.com/images/hd/windows-default-background-ihuecjk2mhalw3nq.jpg'})`
      }}
    >
      
      {modeType === 'Client' && (
      selectedClient ? (
        <Calendar visits={selectedClient.visits} />
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
      {modeType === 'Daily' && (
        <li className="list-item date-header">
        {formattedDate}
        </li>
      )}
    
      {filteredClients.map((item: Client, index) => (
        <li
          key={item.id}
          className={`list-item 
            ${item.id === focusedItemId ? 'focused' : ''} 
            ${modeType === 'Daily' && item.selected === 'Complete' ? 'complete' : ''} 
            ${modeType === 'Daily' && item.selected === 'Paid' ? 'paid' : ''}`}
          ref={el => listRefs.current[index] = el}
          onClick={() => handleItemClick(item.id)}
        >
          <div className="list-item-address">{item.address}</div>
          <div className="stars">{renderStars(getStars(item.lawnSize))}</div>
        </li>
      ))}
      </ul>
    
      <div className="bottom-menu">
      <div className="bottom-menu-container">
        <div className="bottom-menu-button-container">
        <button 
          className={`action-button mode-button ${isModeRotated ? 'rotated' : ''}`} 
          onClick={handleModeClick} 
          title={`Switch to ${modeType === 'Client' ? 'Daily' : 'Client'} Mode`}
        >
          <FaExchangeAlt />
        </button>
        <button className="action-button" onClick={() => setIsAddClientModalOpen(true)} title="Add Client">
          <FaUserPlus />
        </button>
        </div>
        
        <div className="company-profile-card">
        <img
          id="company-image"
          src="https://art.pixilart.com/thumb/sr2e1188a7c216a.png"
          alt="Company Logo"
        />
        <div className="company-info">
          <div className="company-info-text">
            <p className="company-name">Company Name</p>
            <p className="level">Lvl 5</p>
          </div>
          <div className="xp-bar-container">
            <div className="xp-bar"></div>
            <div className="xp-glow"></div>
          </div>
        </div>
        </div>
      </div>
      </div>

      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
        onSubmit={handleAddClient}
      />
    </div>
  );
}

export default Home;
