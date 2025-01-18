import React from 'react';
import { Client } from '../types/interfaces';

interface TopBarProps {
  focusedItemId: number | null;
  selectedClient: Client | null;
  sortOption: string;
  handleSortChange: (option: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ focusedItemId, selectedClient, sortOption, handleSortChange }) => {
  return (
    <div className="top-bar">
      <div className="top-menu-shape"></div>
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
  );
};

export default TopBar;