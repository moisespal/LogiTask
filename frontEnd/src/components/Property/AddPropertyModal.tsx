import React, { useState, useEffect } from 'react';
import '../../styles/components/AddPropertyModal.css';
import api from '../../api';
import { Property_list,Schedule } from '../../types/interfaces';
import { useQueryClient } from '@tanstack/react-query';

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
    const queryClient = useQueryClient();
    const [jobList, setJobList] = useState<string[]>(["mow"]);
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
        
        getJobsNames();
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
                queryClient.invalidateQueries({ queryKey: ['clients'] }); 
                queryClient.invalidateQueries({ queryKey: ['properties'] });
                onClose();
            } else {
                alert("Failed to add property.");
            }

        } catch (err) {
            console.error("Error adding property:", err);
            alert(`Error: ${err}`);
        }   
    };

     const getJobsNames = async () =>{
        try {
        // First, create the client
        const jobList = await api.get("/api/job-names/", {
            headers: {
            'Content-Type': 'application/json'
            }
        });

        if (jobList.status === 200) {
            setJobList(jobList.data)
        }
        }
        catch(err){
        console.error("Error getting clients:", err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="property-container modal-container" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>
                
                <h3>Add New Property</h3>
                
                <form onSubmit={handleSubmit}>
                    <div className="modal-form-section">
                        <div className="modal-section-title">Property Information</div>
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Street Address"
                                value={clientData.street}
                                onChange={handleInputChange}
                                name='street'
                                required
                            />
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={clientData.city}
                                    onChange={handleInputChange}
                                    name='city'
                                    required
                                />
                            </div>
                            
                            <div className="state-zip-row">
                                <div className="state-input">
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
                                <div className="zip-input">
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
                        <div key={index} className="modal-form-section">
                            <div className="modal-section-title">Service Information</div>
                            <div className="form-row">
                                <div className="form-group">
                                    <input 
                                        list="service-options"
                                        name="service"
                                        value={prop.service}
                                        onChange={(e) => handlePropertyChange(index, "service", e.target.value)}
                                        placeholder="Service Type"
                                        required
                                    />
                                    <datalist id="service-options">
                                        {jobList.map((service, i) => (
                                            <option key={i} value={service} />
                                            ))}
                                    </datalist>
                                </div>
                                
                                <div className="form-group">
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
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <input 
                                        type="date" 
                                        placeholder="Start Date"
                                        value={prop.nextDate}
                                        name='nextDate'
                                        onChange={(e) => handlePropertyChange(index, "nextDate", e.target.value)}
                                        className='date-input'
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
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
                    
                    <div className="modal-btn-container">
                        <button type="button" className="modal-btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="modal-btn-submit">
                            Add Property
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPropertyModal;