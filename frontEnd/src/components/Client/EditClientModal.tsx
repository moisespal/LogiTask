import React, { useState, useEffect } from 'react';
import { ClientDataID } from '../../types/interfaces';
import api from '../../api';
import '../../styles/components/EditClientModal.css';
import { formatPhoneNumber, normalizeInput, getPhoneDigits } from '../../utils/format';

const EditClientModal: React.FC<{ 
    client: ClientDataID; 
    onClose: () => void; 
    onClientUpdated: (updatedClient: ClientDataID) => void;
    isOpen: boolean 
}> = ({ client, onClose, onClientUpdated, isOpen }) => {
    const [firstName, setFirstName] = useState(client.firstName);
    const [lastName, setLastName] = useState(client.lastName);
    const [phoneNumber, setPhoneNumber] = useState(formatPhoneNumber(client.phoneNumber));
    const [email, setEmail] = useState(client.email);
    const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

    useEffect(() => {
        const cleanedCurrentPhone = getPhoneDigits(phoneNumber);
        const cleanedOriginalPhone = getPhoneDigits(client.phoneNumber);
        
        const hasRequiredFields = firstName.trim() !== '' && cleanedCurrentPhone.length == 10;
       
        const hasChanges = (
            firstName !== client.firstName ||
            lastName !== client.lastName ||
            cleanedCurrentPhone !== cleanedOriginalPhone ||
            email !== client.email
        );
        
        setIsSubmitEnabled(hasRequiredFields && hasChanges);
    
    }, [firstName, lastName, phoneNumber, email, client]);

    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();

        const cleanedPhoneNumber = getPhoneDigits(phoneNumber);

        try {
            const response = await api.patch(`/api/client/${client.id}/update/`, {
                firstName,
                lastName,
                phoneNumber: cleanedPhoneNumber,
                email
            })
            if (response.status === 200) {
                console.log('Client updated successfully');
                const updatedClient = {
                    ...client,
                    firstName,
                    lastName,
                    phoneNumber: cleanedPhoneNumber,
                    email
                }
                onClientUpdated(updatedClient);
                onClose();
            }
        } catch (error) {
            console.error('Error updating client:', error);
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const previousValue = phoneNumber;

        const formattedValue = normalizeInput(value, previousValue);

        setPhoneNumber(formattedValue);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container client-edit-container">
                <button className="modal-close-btn" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>
                
                <h3>Edit Client Information</h3>
                <form>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="modal-section-title">First Name</label>
                            <input type="text" value={firstName} placeholder="First Name" onChange={(e) => setFirstName(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="modal-section-title">Last Name</label>
                            <input type="text" value={lastName} placeholder="Last Name" onChange={(e) => setLastName(e.target.value)} />
                        </div>
                    </div>


                    <div className="form-row">
                        <div className="form-group">
                            <label className="modal-section-title">Phone Number</label>
                            <input type="text" value={(phoneNumber)} placeholder="Phone" onChange={handlePhoneChange} maxLength={14} />
                        </div>
                        <div className="form-group">
                            <label className="modal-section-title">Email</label>
                            <input type="email" value={email} placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                        </div>
                    </div>

                    <div className="modal-btn-container">
                        <button type="button" className="modal-btn-cancel"  onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="modal-btn-submit" disabled={!isSubmitEnabled} onClick={handleSubmit}>
                            Confirm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditClientModal;