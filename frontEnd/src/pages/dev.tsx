import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import Client from '../components/client';
import Property from '../components/Property';

function Dev(){
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [street, setStreet] = useState("")
    const [city, setCity] = useState("")
    const [zipCode, setzipCode] = useState("")

    const [client, setClients] = useState([])
    const [properties, setProperties] = useState([])

    useEffect(()=>{
        getClients();
      }, [])  
      useEffect(()=>{
        getProperties();
      }, [])  

    const getClients = () => {
        api
            .get("/api/clients/")
            .then((res) => res.data)
            .then((data) => {
                setClients(data);
                console.log(data);
            })
            .catch((err) => alert(err));
    };
    const getProperties = () => {
        api
            .get("/api/properties/")
            .then((res) => res.data)
            .then((data) => {
                setProperties(data);
                console.log(data);
            })
            .catch((err) => alert(err));
    };
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
        } else {
          alert("Failed to create property.");
        }
      } else {
        alert("Failed to create client.");
      }
    } catch (err) {
      alert(`Error: ${err}`);
    }
  
    
  };
    
    return (
        <div>Hello
            <h2>List of Clients</h2>
            <div>
            {client.map((note) => (
                    <Client client={note} />
                ))}
            </div>
            <h2>Property List</h2>
            <div>
            {properties.map((note) => (
                    <Property property={note} />
                ))}
            </div>
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
          <button type="submit" className="btn-primary">
            <i className="fas fa-plus"></i> Add Client
          </button>
        </div>
      </form>




        </div>
        
    )
}


export default Dev