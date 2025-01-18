import React, { useState } from 'react';
import { Client } from '../types/interfaces';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (client: Partial<Client>) => void;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [mode, setMode] = useState<'select' | 'single' | 'multiple'>('select');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [lawnSize, setLawnSize] = useState('');
  const [frequency, setFrequency] = useState('');
  const [nextServiceDate, setNextServiceDate] = useState<Date | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      firstName,
      lastName,
      address,
      phone,
      email,
      lawnSize,
      schedule: {
        frequency,
        nextServiceDate: nextServiceDate?.toISOString() || null,
      },
    });
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
        <div className="form-group">
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <input
              type="tel"
              placeholder="Phone"
              value={phone}
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
        <div className="form-row">
          <div className="form-group">
            <input
              type="number"
              placeholder="Lawn Size (sq ft)"
              value={lawnSize}
              onChange={(e) => setLawnSize(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              required
            >
              <option value="">Select frequency</option>
              <option value="one-time">One-time</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <DatePicker
            selected={nextServiceDate}
            onChange={(date: Date | null) => setNextServiceDate(date)}
            dateFormat="MMMM d, yyyy"
            minDate={new Date()}
            placeholderText="Next Service Date"
            required
          />
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
