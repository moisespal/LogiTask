import React from 'react';
import { Client } from '../types/interfaces';
import './TopBar.css';

interface TopBarProps {
  focusedItemId: number | null;
  selectedClient: Client | null;
  sortOption: string;
  handleSortChange: (option: string) => void;
}

const formatPhoneNumber = (phone: string | undefined): string => {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : phone;
};

const TopBar: React.FC<TopBarProps> = ({ focusedItemId, selectedClient, sortOption, handleSortChange }) => {
  return (
    <div className="top-bar">
      <div className="top-menu-shape"></div>
      <div className={`client-info ${focusedItemId !== null ? 'visible' : ''}`}>
        {focusedItemId !== null && (
          <>
            <div>ID:{selectedClient?.id}</div>
            <div>{selectedClient?.firstName} {selectedClient?.lastName}</div>
            <div className="client-phone">{formatPhoneNumber(selectedClient?.phoneNumber)}</div>
            <div className="client-email">{selectedClient?.email}</div>
          </>
        )}
      </div>
      <div className="sort-button-container" style={{ marginTop: '20px' }}>
        Sort
        <button className="sort-button">By {sortOption.charAt(0).toUpperCase() + sortOption.slice(1)}</button>
        <div className="sort-dropdown">
          <button onClick={() => handleSortChange('none')}>None</button>
          <button onClick={() => handleSortChange('firstName')}>First Name</button>
          <button onClick={() => handleSortChange('lawnSize')}>Lawn Size</button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;