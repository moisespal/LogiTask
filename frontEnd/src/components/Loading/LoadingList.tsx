import React from 'react';
import '../../styles/components/LoadingList.css';

const LoadingList: React.FC = () => {
  return (
    <>
       {[...Array(6)].map((_, i) => (
        <div className="client-wrapper" key={i}>
          <li 
            className="list-item loading-item"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            <div className="list-item-header loading-header">
              <div className="profile-pic-container loading-avatar">
                <img
                        src={'https://i.pinimg.com/736x/c0/74/9b/c0749b7cc401421662ae901ec8f9f660.jpg'}
                        className="profile-pic"
                        />
              </div>
              <div className="list-item-name loading-text"> Loading... </div>
            </div>
          </li>
        </div>
      ))}
    </>
  );
}

export default LoadingList;