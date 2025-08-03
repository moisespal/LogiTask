import React, { useState }from 'react';
import { ClientDataID, Job, Balance } from '../../types/interfaces';
import '../../styles/components/TopBar.css';
import { formatCapitalized, formatPhoneNumber } from '../../utils/format';
import { useNavigate } from "react-router-dom";
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { useUser } from '../../contexts/userContext.tsx';

interface TopBarProps {
  focusedItemId: number | null;
  selectedClient: ClientDataID | null;
  selectedJob: Job | null;
  mode: 'Client' | 'Daily';
  sortOption: string;
  handleSortChange: (option: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ 
  focusedItemId, 
  selectedClient, 
  selectedJob,
  mode,
  sortOption, 
  handleSortChange 
}) => {
  const user = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showBalance, setShowBalance] = useState(false);
  const [balance, setBalance] = useState<Balance>();

  React.useEffect(() => {
    setShowBalance(false);
  }, [focusedItemId]);

  const handleBalanceClick = async () => {
    if (!selectedJob || !selectedJob.client || !selectedJob.client.id) {
      return;
    }

    if (showBalance) {
      setShowBalance(false);
      return;
    }

    const clientId = selectedJob.client.id;

    // Check cache first
    const cachedBalance = queryClient.getQueryData<Balance>(['balance', clientId]);

    if (cachedBalance) {
      setBalance(cachedBalance);
      setShowBalance(true);
      return;
    }

    try {
      const response = await api.get(`/api/get_estimated_balance/${clientId}/`);
      if (response.status === 200) {
        setBalance(response.data);
        setShowBalance(true);
        queryClient.setQueryData(['balance', clientId], response.data);
      } else {
        console.error('Failed to fetch balance');
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }

  const handleClientClick = async () => {
  
    if (mode !== 'Daily' || !selectedJob?.client?.id) {
      return;
    }

    const clientId = selectedJob.client.id;
    
    const cachedClients = queryClient.getQueryData<ClientDataID[]>(['clients']);
    const cachedClient = cachedClients?.find(client => client.id === clientId);
    
    if (cachedClient) {
      navigate('client-view/', {
        state: { client: cachedClient }
      });
      return;
    }
 
    try {
      const response = await api.get(`/api/client/${clientId}/properties/`);
      
      if (response.status === 200) {
        navigate('client-view/', {
          state: { client: response.data }
        });
      } else {
        console.error('Failed to fetch client properties');
      }
    } catch (error) {
      console.error('Error fetching client:', error);
    }
  };

  return (
    <div className="top-bar">
      <div className="top-menu-shape" />
      <div className={`info-container ${focusedItemId !== null ? 'visible' : ''}`}>
        {mode === 'Client' && selectedClient && focusedItemId !== null ? (
          <div className="client-info">
            <div className="client-item">
              <i className="fa-solid fa-user" />
              <span>{selectedClient.firstName} {selectedClient.lastName}</span>
            </div>
              <div className="client-item">
                <i className="fa-solid fa-phone" />
                <span>{formatPhoneNumber(selectedClient.phoneNumber)}</span>
              </div>
              <div className="client-item">
                <i className="fa-solid fa-envelope"></i>
                  {selectedClient.email ? (
                    <span>{selectedClient.email}</span>
                   ) : ( 
                    <span className="noEmail">No email provided</span>
                   )} 
              </div>
          </div>
        ) : mode === 'Daily' && selectedJob && focusedItemId !== null ? (
          <div className="job-info">
            <div className="property">
              <div className="address service-item">
                <i className="fa-solid fa-location-dot" />
                {selectedJob.property.street}, {selectedJob.property.city}, {selectedJob.property.state} {selectedJob.property.zipCode}
              </div>
            </div>
            <div className="contact">
              <div className={`job-client ${user.role === 'BOSS' ? 'job-client-button' : ''}`} onClick={user.role === 'BOSS' ? handleClientClick : undefined}>
                <i className="fa-solid fa-user" />
                <span>{selectedJob.client.firstName} {selectedJob.client.lastName}</span>
              </div>
              <div className="phone service-item">
                <i className="fa-solid fa-phone" />
                <span>{formatPhoneNumber(selectedJob.client.phoneNumber)}</span>
              </div>
            </div>
            <div className="service-tags">
              <div className="service-pill service-item pill-container">
                <i className="fa-solid fa-briefcase" />
                {selectedJob.schedule.service}
              </div>
              <div className="frequency-pill service-item pill-container">
                <i className="fa-solid fa-calendar-days" />
                {formatCapitalized(selectedJob.schedule.frequency)}
              </div>
              <div className="cost-pill-container">
                <div className="cost-pill service-item pill-container" onClick={handleBalanceClick} title={showBalance ? 'Hide Balance' : 'Show Balance'}>
                  <i className="fa-solid fa-dollar-sign" />
                  {Math.floor(selectedJob.cost)}
                </div>
                <div className={`balance-info ${showBalance ? 'show' : ''}`}>
                  <div className="outstanding-balance">
                    <span>
                      {balance && parseFloat(balance.estimated_balance) < 0 ? 'Balance: ' : 'Credit: '}
                    </span>
                    <span 
                      className={balance && parseFloat(balance.estimated_balance) < 0 ? 'balance-negative' : 'balance-positive'}
                    >
                      {balance && parseFloat(balance.estimated_balance) < 0
                        ? `$${Math.abs(parseFloat(balance.estimated_balance)).toFixed(2)}` 
                        : `$${parseFloat(balance?.estimated_balance || '0').toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <div className="sort-button-container">
        Sort
        <button className="sort-button">By {sortOption.charAt(0).toUpperCase() + sortOption.slice(1)}</button>
        <div className="sort-dropdown">
          <button onClick={() => handleSortChange('none')}>None</button>
          <button onClick={() => handleSortChange('firstName')}>First Name</button>
          <button onClick={() => handleSortChange('phoneNumber')}>Phone Number</button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
