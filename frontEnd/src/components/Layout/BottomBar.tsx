import React from 'react';
import { FaExchangeAlt, FaUserPlus } from 'react-icons/fa';
import { FaRankingStar } from "react-icons/fa6";
import '../../styles/components/BottomBar.css';
import { CompanyCard } from '../Company/CompanyCard';
import { useUser } from '../../contexts/userContext';
import { useNavigate } from 'react-router-dom';

interface BottomBarProps {
    isModeRotated: boolean;
    handleModeClick: () => void;
    openAddClientModal: () => void;
    onTeamModalOpen: () => void;
    onStatsToggle: () => void;
    modeType: string;
    showStats?: boolean;
}

const BottomBar: React.FC<BottomBarProps> = ({ isModeRotated, handleModeClick, openAddClientModal, onTeamModalOpen, onStatsToggle, modeType, showStats = false}) => {
    const user = useUser();

    const navigate = useNavigate();

    const handleScheduleManagement = () => {
        navigate('/schedule-management/');
    }
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
                            {modeType === 'Client' ? (
                                <button className="action-button" onClick={openAddClientModal} title="Add Client">
                                    <FaUserPlus />
                                </button>
                            ) : (
                                <button className="action-button" onClick={handleScheduleManagement} title="Manage Schedules">
                                    <FaRankingStar />
                                </button>
                            )}
                        </>
                    )}
                    {modeType === 'Daily' && (
                        <button 
                            className={`action-button stats-button ${showStats ? 'active' : ''}`}
                            onClick={onStatsToggle}
                            title={showStats ? "Hide Daily Stats" : "Show Daily Stats"}
                        >
                            <i className="fa-solid fa-chart-column"></i>
                        </button>
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