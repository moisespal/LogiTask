import React, { useState } from 'react';
import '../../styles/components/AddClientModal.css';
import api from '../../api';

interface AddClientModelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddClientModal: React.FC<AddClientModelProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'select' | 'single' | 'multiple'>('select');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState("")
  const [city, setCity] = useState("")
  const [zipCode, setzipCode] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      // First, create the client
      const clientResponse = await api.post("/api/clients/", {
        firstName,
        lastName,
        phoneNumber,
        email,
      });
  
      if (clientResponse.status === 201) {
        const clientId = clientResponse.data.id; // Assuming the server returns the created client's ID
        alert("Client Created!");
  
        // Now, create the property using the client's ID
        const propertyResponse = await api.post("/api/properties/", {
          street,
          city,
          zipCode,
          clientId: clientId, // Associate the property with the client
        });
  
        if (propertyResponse.status === 201) {
          alert("Property Created!");
          setFirstName('');
          setLastName('');
          setPhone('');
          setEmail('');
          setStreet('');
          setCity('');
          setzipCode('');
        } else {
          alert("Failed to create property.");
        }
      } else {
        alert("Failed to create client.");
      }
    } catch (err) {
      alert(`Error: ${err}`);
    }
  
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle file upload logic here
    console.log("File uploaded:", e.target.files);
    // You would typically process the file here
    onClose();
  };

  const renderModeSelection = () => (
    <div className="mode-selection">
      <h2>Add New Client(s)</h2>
      <div className="mode-buttons">
        <button className="btn-mode" onClick={() => setMode('single')}>
          <i className="fas fa-user-plus"></i>
          <span>Add One Client</span>
        </button>
        <button className="btn-mode" onClick={() => setMode('multiple')}>
          <i className="fas fa-users"></i>
          <span>Add Multiple Clients</span>
        </button>
      </div>
    </div>
  );

  const renderSingleClientForm = () => (
    <>
      <h2>Add New Client</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <input
              type="tel"
              placeholder="Phone"
              value={phoneNumber}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="Address"
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
              placeholder="ZipCode"
              value={zipCode}
              onChange={(e) => setzipCode(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => setMode('select')}>
            <i className="fas fa-arrow-left"></i> Back
          </button>
          <button type="submit" className="btn-primary">
            <i className="fas fa-plus"></i> Add Client
          </button>
        </div>
      </form>
    </>
  );

  const renderMultipleClientsUpload = () => (
    <>
      <h2>Add Multiple Clients</h2>
      <div className="file-upload-container">
        <input
          type="file"
          id="file-upload"
          onChange={handleFileUpload}
          accept=".csv,.xlsx,.xls"
          style={{ display: 'none' }}
        />
        <label htmlFor="file-upload" className="file-upload-label">
          <i className="fas fa-cloud-upload-alt"></i>
          <span>Drop your file here or click to upload</span>
        </label>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={() => setMode('select')}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
      </div>
    </>
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        {mode === 'select' && renderModeSelection()}
        {mode === 'single' && renderSingleClientForm()}
        {mode === 'multiple' && renderMultipleClientsUpload()}
      </div>
    </div>
  );
};

export default AddClientModal;
