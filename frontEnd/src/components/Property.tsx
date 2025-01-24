import React from "react";

interface PropertyProps {
    street: string;
    city: string;
    state: string;
    zipCode: string;

}

interface FormProps {
    property: PropertyProps;
}
function Property({property}:FormProps) {
    
    return (
        <div className="note-container">
            <p className="note-title">{property.street}</p>
            <p className="note-content">{property.city}</p>
            <p className="note-date">{property.state}</p>
            <p className="note-email">{property.zipCode}</p>
        </div>
    );
}

export default Property