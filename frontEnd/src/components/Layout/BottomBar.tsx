import React from 'react';
import { FaExchangeAlt, FaUserPlus } from 'react-icons/fa';
import '../../styles/components/BottomBar.css';
import { CompanyCard } from '../Company/CompanyCard';
import { useUser } from '../../contexts/userContext';

interface BottomBarProps {
    isModeRotated: boolean;
    handleModeClick: () => void;
    openAddClientModal: () => void;
    onTeamModalOpen: () => void;
}

const BottomBar: React.FC<BottomBarProps> = ({ isModeRotated, handleModeClick, openAddClientModal, onTeamModalOpen}) => {
    const user = useUser();

    return (
        <div className="bottom-menu">
            <div className="bottom-menu-container">
                <div className="bottom-menu-button-container">
                    {user.role === 'BOSS' && (
                        <>
                            <button 
                                className={`action-button mode-button ${isModeRotated ? 'rotated' : ''}`} 
                                onClick={handleModeClick} 
                                title={`Switch Mode`}
                            >
                                <FaExchangeAlt />
                            </button>
                            <button className="action-button" onClick={openAddClientModal} title="Add Client">
                                <FaUserPlus />
                            </button>
                        </>
                )}
                </div>
                
                <CompanyCard 
                        image="https://art.pixilart.com/thumb/sr2e1188a7c216a.png" 
                        name="Company Name"
                        level={user.role === 'BOSS' ? 'Admin' : user.role === 'WORKER' ? 'Worker' : 'None'}
                        onTeamModalOpen={onTeamModalOpen}
                />
            </div>
        </div>
    )
}

export default BottomBar;