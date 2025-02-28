import React from 'react';
import { Client } from '../../types/interfaces';
import '../../styles/components/ClientListItem.css';

interface ClientListItemProps {
    client: Client;
    isFocused: boolean;
    onClick: (id: number) => void;
    renderStars: (count: number) => JSX.Element[];
}

const ClientListItem: React.FC<ClientListItemProps> = ({ client, isFocused, onClick, renderStars }) => (
<li
    className={`list-item ${isFocused ? 'focused' : ''}`}
    onClick={() => onClick(client.id)}
>
    <div className="list-item-header">
        <div className="profile-pic-container">
            <img
            src={client.image || 'https://i.pinimg.com/736x/c0/74/9b/c0749b7cc401421662ae901ec8f9f660.jpg'}
            alt={`${client.firstName} ${client.lastName}`}
            className="profile-pic"
            />
        </div>
        <div className="list-item-name">{`${client.firstName} ${client.lastName}`}</div>
        {isFocused && (
            <button
            className="gear-button"
            onClick={(e) => { e.stopPropagation();}}
            title="More options"
            >
            <i className="fas fa-cog"></i>
                </button>
            )}
    </div>
    <div className="stars">{renderStars(3)}</div>
</li>
);

export default ClientListItem;