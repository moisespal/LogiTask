import React, { useEffect } from "react";
import api from "../api";
import { useLocation } from "react-router-dom";
import { ClientDataID } from "../types/interfaces";
import "../styles/pages/ClientView.css";

const ClientView: React.FC = () => {
    const location = useLocation();
    const { client } = location.state as {
        client: ClientDataID;
    };

    useEffect(() => {
       // fetch balance and client data
         api
            .get(`/api/balance-history/${client.id}`)
            .then(response => {
                // Handle the response data
                console.log('Balance history:', response.data);
            })
            .catch(error => {
                console.error('Error fetching balance history:', error);
            });
    }, [client.id]); // TODO: FIX THE BALANCE HISTORY API CALL

    // Dummy data for layout purposes
    const dummyBalance = 130;
    const dummyPaymentPercentage = 45; // For progress bar width
    const dummyServices = [
        { address: "4572 Dog St", service: "St mowed", date: "05/11/25", amount: 50 },
        { address: "2112 Bone Ln", service: "Ln mowed", date: "05/01/12", amount: 50 },
        { address: "4572 Dog St", service: "Ln mowed", date: "04/18/25", amount: 50 },
        { address: "2112 Bone Ln", service: "St mowed", date: "03/18/25", amount: 50 },
    ];
    const dummyPayments = [
        { date: "05/01/25", method: "Check", amount: 50 },
        { date: "04/24/25", method: "Cash", amount: 20 },
    ];
    
    return (
        <div className="client-view-container">
            {/* Top Section */}
            <div className="back-button-container">
                <button className="return-button" onClick={() => window.history.back()}>
                    <i className="fa-solid fa-arrow-left"></i> Back
                </button>
            </div>
            <div className="client-header-section">
                {/* Client Info Card */}
                <div className="client-info-card">
                    <div className="client-avatar">
                        <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" alt="Client avatar" />
                    </div>
                    <div className="client-details">
                        <h2 className="client-name">{client.firstName} {client.lastName}</h2>
                        <div className="client-contact">
                            <div className="contact-item">
                                <i className="fa-solid fa-phone"></i>
                                <span>{client.phoneNumber}</span>
                            </div>
                            <div className="contact-item">
                                <i className="fa-solid fa-envelope"></i>
                                <span>{client.email}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Balance Card */}
                <div className="client-balance-card">
                    <div className="balance-header">
                        <div className="balance-text">
                            <span>Balance Due:</span> <span className="balance-amount">${dummyBalance}</span>
                        </div>
                        <div className="header-buttons">
                            <button className="payment-button-secondary">
                                <i className="fa-solid fa-money-bill-wave"></i> 
                            </button>
                            <button className="balance-adjustment-button">
                                <i className="fa-solid fa-wrench"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div className="balance-progress-bar">
                        <div 
                            className="progress-fill" 
                            style={{ width: `${dummyPaymentPercentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>
            
            {/* Bottom Section */}
            <div className="client-details-section">
                {/* Addresses */}
                <div className="client-panel addresses-panel">
                    <h3 className="panel-header">Addresses</h3>
                    <ul className="address-list">
                        {client.properties.map((property, i) => (
                            <li key={i} className="client-address-item">
                                {property.street}
                            </li>
                        ))}
                    </ul>
                </div>
                
                {/* Services */}
                <div className="client-panel services-panel">
                    <h3 className="panel-header">Completed Jobs<span className="total-amount">$200</span></h3>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Address</th>
                                    <th>Service</th>
                                    <th>Date</th>
                                    <th>$$$</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dummyServices.map((service, i) => (
                                    <tr key={i}>
                                        <td>{service.address}</td>
                                        <td>{service.service}</td>
                                        <td>{service.date}</td>
                                        <td>${service.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* Payments */}
                <div className="client-panel payments-panel">
                    <h3 className="panel-header">Payments<span className="total-amount">$70</span></h3>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Method</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dummyPayments.map((payment, i) => (
                                    <tr key={i}>
                                        <td>{payment.date}</td>
                                        <td>{payment.method}</td>
                                        <td>${payment.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientView;