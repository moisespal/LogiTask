import React, { useState, useEffect, useMemo } from 'react';
import '../../styles/components/AddClientModal.css';
import api from '../../api';
import { ClientData, Property_list, Schedule } from '../../types/interfaces';


interface AddClientModelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddClientModal: React.FC<AddClientModelProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'select' | 'single' | 'multiple'>('select');
  //multiple files logic 
  const [file,setFile] = useState<File|null>(null)
  const [uploading, setUploading] = useState<boolean>(false);
  const [jobList, setJobList] = useState<string[]>(["mow"]);
  
  const [clientData, setClientData] = useState<ClientData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    properties: [
      {
        street: "",
        city: "",
        state: "TX",
        zipCode: "",
        schedules: [
          {
            frequency: "",
            nextDate: "",
            service: "",
            cost: 0.00,
          },
        ],
      },
    ],
  });

  // Add keyboard event prevention for when modal is open
  useEffect(() => {
    if (!isOpen) return;
    
    const preventKeyboardEventPropagation = (e: KeyboardEvent) => {
        // Prevent event propagation for any keyboard events when modal is open
        e.stopPropagation();
    };

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

  const handlePropertyChange = (index: number, field: keyof Property_list, value: string) => {
    setClientData((prev) => {
      const updatedProperties = [...prev.properties];
      updatedProperties[index] = {
        ...updatedProperties[index],
        [field]: value,
      };
      return {
        ...prev,
        properties: updatedProperties,
      };
    });
  };
  
  const updateSchedule = (propertyIndex: number, scheduleIndex: number, field: keyof Schedule, value: string | number) => {
    setClientData((prev) => {
      const updatedProperties = [...prev.properties];
      const updatedSchedules = [...updatedProperties[propertyIndex].schedules];
  
      // Update the specific schedule
      updatedSchedules[scheduleIndex] = {
        ...updatedSchedules[scheduleIndex],
        [field]: value,
      };
  
      // Update the property with the new schedules
      updatedProperties[propertyIndex] = {
        ...updatedProperties[propertyIndex],
        schedules: updatedSchedules,
      };
  
      return {
        ...prev,
        properties: updatedProperties,
      };
    });
  };
  
  const handleSubmit = async (e:React.FormEvent) =>{
    e.preventDefault();
    try {
      // First, create the client
      console.log(JSON.stringify(clientData));
      const clientResponse = await api.post("/api/clientPropertySetUp/", clientData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (clientResponse.status === 201) {
        alert("Client Property Schedule Created!");
        onClose();
        window.location.reload();
      }
    }
    catch(err){
      console.error("Error creating client:", err);
    }
  };

  const resetForm = () => {
    setClientData({
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      properties: [
        {
          street: "",
          city: "",
          state: "TX",
          zipCode: "",
          schedules: [
            {
              frequency: "",
              nextDate: "",
              service: "",
              cost: 0.00,
            },
          ],
        },
      ],
    });
    setFile(null);
    setMode('select');
  };

  const handleCancel = () => {
      resetForm();
  };

  const handleClose = () => {
      resetForm(); 
      onClose();
  };

   
  const getJobsNames = async () =>{ // TODO use react query for this to avoid multiple calls when just opening modal, it should be called once and then cached for reuse, since its just a list of jobs the user has made before.
    try {
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]); // Store the selected file
      console.log("Selected file:", event.target.files[0].name);
    }
  };

  const uploadFile = async () => {
    if (!file) {
        alert("Please select a file first!");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setUploading(true); // Set uploading state

    try {
        const response = await api.post("/api/multiple-clientsSetup", formData, {
            headers: {
                // Axios sets "Content-Type": "multipart/form-data" automatically
            }
        });

        if (response.status === 201) {
            alert("Client Property Schedule Created!");
            onClose();
            window.location.reload();
        } else {
            alert(`Error uploading file: ${response.data.error || "Unknown error"}`);
        }
    } catch (error) {
        console.error("Upload failed:", error);
        alert(`Something went wrong! `);
    } finally {
        setUploading(false); // Reset uploading state
    }
};

const isClientFormComplete = useMemo(() => {

    if (!clientData.firstName.trim() || !clientData.phoneNumber.trim()) {
      return false;
    }

    return clientData.properties.every(property => {
      const hasPropertyFields = 
        property.street.trim() &&
        property.city.trim() &&
        property.state.trim() &&
        property.zipCode.trim();

      const hasScheduleFields = property.schedules.every(schedule =>
        schedule.service.trim() &&
        schedule.frequency.trim() &&
        schedule.nextDate.trim() &&
        schedule.cost > 0
      );

      return hasPropertyFields && hasScheduleFields;
    });
  }, [clientData]);

  const renderModeSelection = () => (
    <div className="mode-selection">
      <h3>Add New Client(s)</h3>
      <div className="client-btn-container">
        <button className="btn-mode modal-btn" onClick={async () => {
          setMode('single');
          await getJobsNames();
        }}>
          <i className="fas fa-user-plus"></i>
          <span>Add One</span>
        </button>
        <button className="btn-mode modal-btn" onClick={() => setMode('multiple')}>
          <i className="fas fa-users"></i>
          <span>Add Multiple</span>
        </button>
      </div>
    </div>
  );

  const renderSingleClientForm = () => (
    <>
      <h3>Add New Client</h3>
      <form onSubmit={handleSubmit}>
        {/* Client Information Section */}
        <div className="modal-form-section">
          <div className="modal-section-title">Client Information</div>
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                placeholder="First Name"
                value={clientData.firstName}
                onChange={handleInputChange}
                name="firstName"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Last Name (optional)"
                value={clientData.lastName}
                onChange={handleInputChange}
                name='lastName'
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <input
                type="tel"
                placeholder="Phone Number"
                value={clientData.phoneNumber}
                onChange={handleInputChange}
                name='phoneNumber'
                required
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                placeholder="Email (optional)"
                value={clientData.email}
                onChange={handleInputChange}
                name='email'
              />
            </div>
          </div>
        </div>

        {/* Property Information Section */}
        {clientData.properties.map((prop, index) => (
          <React.Fragment key={index}>
            <div className="modal-form-section">
              <div className="modal-section-title">Property Information</div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Street Address"
                  value={prop.street}
                  name='street'
                  onChange={(e) => handlePropertyChange(index, "street", e.target.value)}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="City"
                    value={prop.city}
                    name='city'
                    onChange={(e) => handlePropertyChange(index,"city",e.target.value)}
                    required
                  />
                </div>
                <div className="state-zip-row">
                  <div className="state-input">
                    <input
                      type="text"
                      placeholder="State"
                      name='state'
                      onChange={(e) => handlePropertyChange(index,"state",e.target.value)}
                      maxLength={2}
                      required
                    />
                  </div>
                  <div className="zip-input">
                    <input
                      type="text"
                      placeholder="ZIP"
                      name='zipCode'
                      value={prop.zipCode}
                      onChange={(e) => handlePropertyChange(index,"zipCode",e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Service Information Section */}
            <div className="modal-form-section">
              <div className="modal-section-title">Service Information</div>
              <div className="form-row">
                <div className="form-group">
                  <input
                    list="service-options"
                    name="service"
                    value={prop.schedules[0].service}
                    onChange={(e) => updateSchedule(index, 0, "service", e.target.value)}
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
                      min='1'
                      step='0.01'
                      onChange={(e) => updateSchedule(index,0,"cost", parseFloat(e.target.value))}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <input 
                    placeholder='Start Date'
                    className='date-input' 
                    type="text"
                    onFocus={(e) => e.target.type = 'date'}
                    onBlur={(e) => e.target.type = 'text'}
                    name='nextDate'
                    onChange={(e)=> updateSchedule(index,0,"nextDate",e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <select
                    name="frequency"
                    value={prop.schedules[0].frequency}
                    onChange={(e)=>updateSchedule(index,0,"frequency",e.target.value)}
                    required
                  >
                    <option value="" disabled>How Often?</option>
                    <option value="Once">One Time</option>
                    <option value="Weekly">Weekly</option>
                    <option value="BiWeekly">Every 2 Weeks</option>
                  </select>
                </div>
              </div>
            </div>
          </React.Fragment>
        ))}
        <div className="modal-btn-container">
          <button type="button" className="modal-btn-cancel" onClick={handleCancel}>
             Cancel
          </button>
          <button type="submit" disabled={!isClientFormComplete} className="modal-btn-submit">
             Add Client
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
      {file && <p>Selected: {file.name}</p>}
      <div className="modal-btn-container">

          <button type="button" className="modal-btn-cancel" onClick={handleCancel}>
            Cancel
          </button>

          <button 
                type="button" 
                className="modal-btn-submit" 
                onClick={uploadFile}
                disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload File"}
          </button>
      </div>
    </>
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container client-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={handleClose}>
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
