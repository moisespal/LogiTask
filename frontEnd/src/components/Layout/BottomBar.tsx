import React from 'react';
import { FaExchangeAlt, FaUserPlus } from 'react-icons/fa';
import '../../styles/components/BottomBar.css';

interface BottomBarProps {
    isModeRotated: boolean;
    handleModeClick: () => void;
    openAddClientModal: () => void;
}

const BottomBar: React.FC<BottomBarProps> = ({ isModeRotated, handleModeClick, openAddClientModal }) => (
    <div className="bottom-menu">
        <div className="bottom-menu-container">
            <div className="bottom-menu-button-container">
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
);

export default BottomBar;