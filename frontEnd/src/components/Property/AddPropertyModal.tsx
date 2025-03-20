import React, { useState, useEffect } from 'react';
import '../../styles/components/AddPropertyModal.css';
import api from '../../api';
import { Property_list,Schedule } from '../../types/interfaces';
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
 
    const [clientData, setClientData] = useState<Property_list>({
        street: "",
        city: "",
        state: "",
        zipCode: "",
        schedules: [
        {
            frequency: "",
            nextDate: "",
            service: "",
            cost: 0.00
        }
    ]
    });

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


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setClientData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
    };
    
    const handlePropertyChange = (index: number, field: keyof Schedule, value: string | number) => {
      setClientData((prev) => {
        const updatedProperties = [...prev.schedules];
        updatedProperties[index] = {
        ...updatedProperties[index],
        [field]: value,
        };
        return {
        ...prev,
        schedules: updatedProperties,
        };
      });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Create the property associated with the client
            const propertyResponse = await api.post("/api/PropertySetup/", {
                ...clientData,
                clientId: clientId
            }, { headers:{
                'Content-Type': 'application/json'
            }});

            if (propertyResponse.status === 201) {
                // Reset form fields
                setClientData({
                    street: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    schedules: [
                        {
                            frequency: "",
                            nextDate: "",
                            service: "",
                            cost: 0.00
                        }
                    ]
                });
                
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
        <div className="property-modal-overlay" onClick={onClose}>
            <div className="property-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="property-modal-close-btn" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>
                
                <h2>Add New Property</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="property-form-section">
                        <div className="property-section-title">Property Information</div>
                        <div className="property-form-group">
                            <input
                                type="text"
                                placeholder="Street Address"
                                value={clientData.street}
                                onChange={handleInputChange}
                                name='street'
                                required
                            />
                        </div>
                        
                        <div className="property-form-row">
                            <div className="property-form-group">
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={clientData.city}
                                    onChange={handleInputChange}
                                    name='city'
                                    required
                                />
                            </div>
                            
                            <div className="property-state-zip-row">
                                <div className="property-state-input">
                                    <input
                                        type="text"
                                        placeholder="State"
                                        value={clientData.state}
                                        onChange={handleInputChange}
                                        name='state'
                                        maxLength={2}
                                        required
                                    />
                                </div>
                                <div className="property-zip-input">
                                    <input
                                        type="text"
                                        placeholder="ZIP Code"
                                        value={clientData.zipCode}
                                        onChange={handleInputChange}
                                        name='zipCode'
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {clientData.schedules.map((prop, index) => (
                        <div key={index} className="property-form-section property-service-section">
                            <div className="property-section-title">Service Information</div>
                            <div className="property-form-row">
                                <div className="property-form-group">
                                    <select 
                                        name="service"
                                        value={prop.service}
                                        onChange={(e) => handlePropertyChange(index, "service", e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>
                                            Select Service
                                        </option>
                                        <option value="Mowing">Mowing</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                
                                <div className="property-form-group">
                                    <div className="cost-input-container">
                                        <input 
                                            type="number" 
                                            placeholder="Cost" 
                                            name='cost'
                                            step="1.00"
                                            onChange={(e) => handlePropertyChange(index, "cost", parseFloat(e.target.value))}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="property-form-row">
                                <div className="property-form-group">
                                    <input 
                                        type="date" 
                                        placeholder="Start Date"
                                        value={prop.nextDate}
                                        name='nextDate'
                                        onChange={(e) => handlePropertyChange(index, "nextDate", e.target.value)}
                                        required
                                    />
                                </div>
                                
                                <div className="property-form-group">
                                    <select
                                        name="frequency"
                                        value={prop.frequency}
                                        onChange={(e) => handlePropertyChange(index, "frequency", e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>
                                            How Often?
                                        </option>
                                        <option value="Once">Once</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="BiWeekly">Every 2 Weeks</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <div className="property-form-actions">
                        <button type="button" className="property-btn-secondary" onClick={onClose}>
                            <i className="fas fa-times"></i> Cancel
                        </button>
                        <button type="submit" className="property-btn-primary">
                            <i className="fas fa-plus"></i> Add Property
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPropertyModal;