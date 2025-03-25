import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/components/CompanyCard.css';
import { Company } from '../../types/interfaces';
import { FaCog, FaSignOutAlt, FaChevronUp, FaChevronDown } from 'react-icons/fa';

const CompanyCard: React.FC<Company> = ({image, name, level }) => {
    const [showMenu, setShowMenu] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowMenu(!showMenu);
    };

    const handleLogout = () => {
        navigate('/logout');
    };

    const handleSettings = () => {
        console.log('Settings clicked');
        setShowMenu(false);
    };

    return (
        <div className="company-card-wrapper">
            <div className={`company-popup-menu ${showMenu ? 'visible' : ''}`}>
                <button 
                    className="popup-menu-button settings-button"
                    onClick={handleSettings}
                >
                    <FaCog />
                    <span>Settings</span>
                </button>
                <button 
                    className="popup-menu-button logout-button"
                    onClick={handleLogout}
                >
                    <FaSignOutAlt />
                    <span>Logout</span>
                </button>
            </div>
            
            <button 
                className={`company-profile-card ${showMenu ? 'active' : ''}`}
                onClick={toggleMenu}
                aria-expanded={showMenu}
                title="Click to open menu"
            >
                <div className="toggle-indicator">
                    {showMenu ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                <img
                    id="company-image"
                    src={image}
                    alt="Company Logo"
                />
                <div className="company-info">
                    <div className="company-info-text">
                        <p className="company-name">{name}</p>
                        <p className="level">{level}</p>
                    </div>
                    <div className="xp-bar-container">
                        <div className="xp-bar"></div>
                        <div className="xp-glow"></div>
                    </div>
                </div>
            </button>
        </div>
    );
};

export {CompanyCard};
