import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import addresses from './data.json';
import Calendar from './components/Calendar';
import { Client } from './types/interfaces'; // Import interfaces

// function that takes in square feet and returns a star value integer. 
// the star value integer is used to render the number of stars on the client list.
// the star value is determined by the square footage of the lawn.
const getStars = (lawnSize: string): number => {
  const size = parseInt(lawnSize.replace(/\D/g, ''), 10);
  if (isNaN(size)) return 0;
  if (size < 350) return 1;
  if (size < 600) return 2;
  if (size < 700) return 3;
  if (size < 800) return 4;
  if (size < 900) return 5;
  if (size < 1000) return 6;
  return 7;
};


/**
 * Renders a specified number of stars as JSX elements.
 * 
 * @param count - The number of stars to render.
 * @returns An array of JSX elements representing the stars.
 */
const renderStars = (count: number): JSX.Element[] => {
  return Array.from({ length: count }, (_, i) => (
    <span key={i} className="star">★</span>
  ));
};


// gets today as a string in the format of the day of the week
const getTodayDayString = (): string => {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' });
};

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedItemId, setFocusedItemId] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<string>('none');
  const [modeType, setModeType] = useState('Client');
  const [clients, setClients] = useState<Client[]>(addresses);
  const listRefs = useRef<(HTMLLIElement | null)[]>([]);

  const handleModeClick = () => {
    if (modeType === 'Client') return setModeType('Daily');
    return setModeType('Client');
  };

  const sortAddresses = (clients: Client[]): Client[] => {
    return [...clients].sort((a, b) => {
      switch (sortOption) {
        case 'firstName':
          return a.firstName.localeCompare(b.firstName);
        case 'address':
          return a.address.localeCompare(b.address);
        case 'phone':
          return a.phone.localeCompare(b.phone);
        case 'lawnSize':
          return parseInt(a.lawnSize) - parseInt(b.lawnSize);
        default:
          return 0;
      }
    });
  };

  const todayDayString = getTodayDayString();

  const filterByModeType = (clients: Client[]): Client[] => {
    if (modeType === 'Client') return clients;
    if (modeType === 'Daily') return clients.filter(item => item.tags.some(tag => tag.day === todayDayString));
    return [];
  };

  const filterBySearchTerm = (clients: Client[]): Client[] => {
    return clients.filter(item =>
      [item.firstName, item.lastName, item.address, item.phone, item.email, item.lawnSize, item.selected]
        .some(field => field && field.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const filteredAddresses = sortAddresses(filterBySearchTerm(filterByModeType(clients)));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleItemClick = (id: number) => {
    if (modeType === "Daily") {
      setClients(prevClients => prevClients.map(client => {
        if (client.id === id) {
          let newStatus;
          if (client.id === focusedItemId) {
            if (client.selected === "Complete") {
              newStatus = "Paid";
            } else if (client.selected === "Paid") {
              newStatus = "None";
            } else {
              newStatus = "Complete";
            }
          } else {
            newStatus = client.selected;
          }
          return { ...client, selected: newStatus };
        }
        return client;
      }));
    }
    setFocusedItemId(id);
  };

  const handleSortChange = (option: string) => {
    setSortOption(option);
  };

  const getOrdinalSuffix = (day: number): string => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const today = new Date();
  const day = today.getDate();
  const formattedDate = `${today.toLocaleDateString('en-US', { weekday: 'long' })}, ${today.toLocaleDateString('en-US', { month: 'long' })} ${day}${getOrdinalSuffix(day)}`;

  useEffect(() => {
    if (filteredAddresses.length === 1) {
      setFocusedItemId(filteredAddresses[0].id);
    } else if (filteredAddresses.length > 1) {
      const focusedItem = filteredAddresses.find(client => client.id === focusedItemId);
      if (!focusedItem) {
        setFocusedItemId(null);
      }
    }
  }, [filteredAddresses, focusedItemId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const allowedKeys = /^[a-zA-Z0-9,.\s]$/;
      if (e.key === 'Backspace') {
        setSearchTerm((prev) => prev.slice(0, -1));
      } else if (allowedKeys.test(e.key)) {
        setSearchTerm((prev) => prev + e.key);
      } else if (e.key === 'ArrowRight') {
        setFocusedItemId((prevId) => {
          const currentIndex = filteredAddresses.findIndex(client => client.id === prevId);
          const newIndex = Math.min(currentIndex + 1, filteredAddresses.length - 1);
          const newFocusedItemId = filteredAddresses[newIndex]?.id ?? null;
          if (newFocusedItemId !== null) {
            const newItemIndex = filteredAddresses.findIndex(client => client.id === newFocusedItemId);
            listRefs.current[newItemIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return newFocusedItemId;
        });
      } else if (e.key === 'ArrowLeft') {
        setFocusedItemId((prevId) => {
          const currentIndex = filteredAddresses.findIndex(client => client.id === prevId);
          const newIndex = Math.max(currentIndex - 1, 0);
          const newFocusedItemId = filteredAddresses[newIndex]?.id ?? null;
          if (newFocusedItemId !== null) {
            const newItemIndex = filteredAddresses.findIndex(client => client.id === newFocusedItemId);
            listRefs.current[newItemIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return newFocusedItemId;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [filteredAddresses.length, filteredAddresses]);

  const selectedClient = focusedItemId !== null ? filteredAddresses.find(client => client.id === focusedItemId) : null;

  return (
    <div className="app-container" style={{ backgroundImage: selectedClient ? `url(${selectedClient.image})` : `url(${'https://wallpapers.com/images/hd/windows-default-background-ihuecjk2mhalw3nq.jpg'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {selectedClient && modeType === 'Client' && (
        <Calendar visits={selectedClient.visits} />
      )}
      {!selectedClient && modeType === 'Client' && (
        <div className="calendar-container">
          <h2>Past 30 Days</h2>
          <div className="calendar-grid">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="calendar-day">
                <span className="date"></span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="back-ground"></div>
      <input
        type="text"
        className={`search-bar ${searchTerm ? 'active' : ''}`}
        value={searchTerm}
        onChange={handleChange}
        placeholder="Search: Type to search"
      />
      <div className="top-bar">
        <div className={`client-info ${focusedItemId !== null ? 'visible' : ''}`}>
          {focusedItemId !== null && (
            <>
              <div>{selectedClient?.firstName} {selectedClient?.lastName}</div>
              <div>{selectedClient?.address}</div>
              <div>{selectedClient?.phone}</div>
              <div>{selectedClient?.email}</div>
              <div>{selectedClient?.lawnSize}</div>
            </>
          )}
        </div>
        <div className="sort-button-container" style={{ marginTop: '20px' }}>
          Sort
          <button className="sort-button">By {sortOption.charAt(0).toUpperCase() + sortOption.slice(1)}</button>
          <div className="sort-dropdown">
            <button onClick={() => handleSortChange('none')}>None</button>
            <button onClick={() => handleSortChange('firstName')}>First Name</button>
            <button onClick={() => handleSortChange('address')}>Address</button>
            <button onClick={() => handleSortChange('phone')}>Phone Number</button>
            <button onClick={() => handleSortChange('lawnSize')}>Lawn Size</button>
          </div>
        </div>
      </div>
      <ul className="right-aligned-list">
        {modeType === 'Daily' && (
          <li className="list-item date-header">
            {formattedDate}
          </li>
        )}
        {filteredAddresses.map((item: Client, index) => (
          <li
            key={item.id}
            className={`list-item 
              ${item.id === focusedItemId ? 'focused' : ''} 
              ${item.selected === 'Complete' ? 'complete' : ''} 
              ${item.selected === 'Paid' ? 'paid' : ''}`}
            ref={el => listRefs.current[index] = el}
            onClick={() => handleItemClick(item.id)}
          >
            {item.address}
            <div className="stars">{renderStars(getStars(item.lawnSize))}</div>
          </li>
        ))}
      </ul>
      <div className="bottom-menu">
        <div className="mode-button-container">
          <button className="mode-button" onClick={handleModeClick}>{modeType}</button>
        </div>
        <div className="add-client-button-container">
          <button className="add-client">+</button>
        </div>
        <div className="company-profile-card">
          Company Name
        </div>
      </div>
    </div>
  );
}

export default App;