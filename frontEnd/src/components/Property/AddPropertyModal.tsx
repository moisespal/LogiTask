import React, { useState, useEffect } from 'react';
import '../../styles/components/AddPropertyModal.css';
import api from '../../api';

interface AddPropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: number;
}

const AddPropertyModal: React.FC<AddPropertyModalProps> = ({ 
    isOpen, 
    onClose, 
    clientId
}) => {
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');

    // Add keyboard event prevention for when modal is open
    useEffect(() => {
        if (!isOpen) return;
        
        const preventKeyboardEventPropagation = (e: KeyboardEvent) => {
            // Prevent event propagation for any keyboard events when modal is open
            e.stopPropagation();
        };

        // Capture keyboard events in the capturing phase, before they bubble up
        document.addEventListener('keydown', preventKeyboardEventPropagation, true);

        return () => {
            document.removeEventListener('keydown', preventKeyboardEventPropagation, true);
        };
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Create the property associated with the client
            const propertyResponse = await api.post("/api/properties/", {
                street,
                city,
                state,
                zipCode,
                clientId
            });

            if (propertyResponse.status === 201) {
                // Reset form fields
                setStreet('');
                setCity('');
                setState('');
                setZipCode('');
                
                // Close modal first
                onClose();
                
                // This will trigger a reload of all clients in the parent component
                // We're using a small delay to ensure the modal is fully closed first
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('reload-clients'));
                }, 100);
            } else {
                alert("Failed to add property.");
            }

        } catch (err) {
            console.error("Error adding property:", err);
            alert(`Error: ${err}`);
        }   
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>
                
                <h2>Add New Property</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Street Address"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="City"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="State"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="ZIP Code"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            <i className="fas fa-times"></i> Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            <i className="fas fa-plus"></i> Add Property
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPropertyModal;