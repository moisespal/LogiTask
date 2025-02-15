import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import Client from '../components/client';
import Property from '../components/Property';
import './dev.css'

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

      const deleteClient = (clientId: number) => {
        api.delete(`/api/clients/delete/${clientId}/`)
          .then((response) => {
            console.log("Client deleted successfully!");
            // Optionally, update your state to remove the client from your UI.
          })
          .catch((error) => {
            console.error("Error deleting client:", error);
            alert("Failed to delete client");
          });
      };

    const getClients = () => {
        api.get("/api/clients/")
            .then((res) =>{
                console.log("Clients returned:", res.data);
                setClients(res.data);
            })
            .catch((err) => alert(err));
    };
    const getProperties = () => {
          api.get("/api/properties/")
          .then((res) => {
            console.log("Properties returned:", res.data);
            setProperties(res.data);
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
        <div className="container">
            <h1>Dev Page</h1>

            <div className="section">
                <h2>List of Clients</h2>
                <div className="list">
                    {client.map((note) => (
                        <div className="card" key={note.id}>
                          <Client client={note} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="section">
                <h2>Property List</h2>
                <div className="list">
                    {properties.map((note) => (
                        <div className="card" key={note.id}>
                          <Property property={note} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
export default Dev