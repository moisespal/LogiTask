import React from "react";


interface ClientProps {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
}

interface FormProps {
    client: ClientProps;
}
function Client({client}:FormProps) {
    
    return (
        <div className="note-container">
            <p className="note-title">{client.firstName}</p>
            <p className="note-content">{client.lastName}</p>
            <p className="note-date">{client.phoneNumber}</p>
            <p className="note-email">{client.email}</p>
        </div>
    );
}

export default Client