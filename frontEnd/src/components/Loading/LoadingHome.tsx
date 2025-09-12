import React from 'react';

const LoadingHome: React.FC = () => {
  return (
    <>
        <div className="app-container loading-home">
            <div className="top-bar">
                <div className="top-menu-shape"></div>
                <div className="sort-button-container">
                    Sort
                    <div className="sort-button">By None</div>
                </div>
            </div>
            <div className="search-container">
                        <input
                            type="text"
                            className={'search-bar'}
                            placeholder={"Search..."}
                        />
            </div>

            <div className="bottom-menu">
                <div className="bottom-menu-container">
                    <div className="bottom-menu-button-container">
                        <button 
                            className="action-button mode-button"
                        >
                            <i className="fa-solid fa-question"></i>
                        </button>
                        <button
                            className="action-button"
                        >
                            <i className="fa-solid fa-question"></i>
                        </button>
                    </div>

                    <div className="company-card-wrapper">
                        <button 
                            className={`company-profile-card loading-card`}
                        >
                            <div className="toggle-indicator"></div>
                            <div 
                                id="company-image" 
                                className="loading-company-image"
                            >
                                <img
                                    src="https://cdn.dribbble.com/userupload/19649402/file/original-54db6f49d967a06f8d54bdd60d7cbc8f.gif"
                                    alt="Loading Company Logo"
                                />
                            </div>

                            <div className="company-info">
                                <div className="company-info-text">
                                    <p className="company-name">Loading...</p>
                                    <p className="level">hmm...</p>
                                </div>
                                <div className="xp-bar-container">
                                    <div className="xp-bar"></div>
                                    <div className="xp-glow"></div>
                                </div>
                            </div>
                        </button>
                   </div>
                </div>
            </div>
        </div>
    </>
  );
}

export default LoadingHome;