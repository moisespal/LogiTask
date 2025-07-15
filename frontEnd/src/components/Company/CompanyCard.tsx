import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/components/CompanyCard.css';
import { FaCog, FaSignOutAlt, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { BsPeopleFill } from "react-icons/bs";
import { Company } from '../../types/interfaces';

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

    const storedLogo = localStorage.getItem("companyLogo");

    let logoSrc = image;
    
    if (storedLogo) {
        if (storedLogo.startsWith("http")) {
            logoSrc = storedLogo;
        } else {
            logoSrc = `${import.meta.env.VITE_MEDIA_URL}${storedLogo}`;
        }
    }
    

    return (
        <div className="company-card-wrapper">
            <div className={`company-popup-menu ${showMenu ? 'visible' : ''}`}>
                <button 
                    className="popup-menu-button my-team-button"
                >
                    <BsPeopleFill  />
                    <span>Team Settings</span>
                    <div className='team-member-amount'> ({0})</div>
                </button>

                <button 
                    className="popup-menu-button settings-button"
                    onClick={handleSettings}
                >
                    <FaCog />
                    <span>My Settings</span>
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
                <div id="company-image">
                    <img
                        src={logoSrc}
                        alt="Company Logo"
                    />
                </div>
                <div className="company-info">
                    <div className="company-info-text">
                        <p className="company-name">{localStorage.getItem("companyName") || name}</p>
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
