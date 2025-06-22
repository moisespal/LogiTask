import React, { useEffect, useState } from "react";
import api from "../api";
import { useLocation } from "react-router-dom";
import { ClientDataID, clientViewJob, Payment } from "../types/interfaces";
import "../styles/pages/ClientView.css";
import { formatPhoneNumber, formatUTCtoLocal }  from "../utils/format";

const ClientView: React.FC = () => {
    const location = useLocation();
    const { client } = location.state as {
        client: ClientDataID;
    };
    const [allJobs, setAllJobs] = useState<clientViewJob[]>([]);
    const [allPayments, setAllPayments] = useState<Payment[]>([]);
    const [newBalance, setNewBalance] = useState<number>(0);
    const [jobAmount, setJobAmount] = useState<number>(0);
    const [totalAmount, setTotalAmount] = useState<number>(0);

    const timezone = localStorage.getItem("userTimeZone") || "UTC";

    useEffect(() => {
         api
            .get(`/api/balance-history/${client.id}/`)
            .then(response => {
                console.log('Balance history:', response.data);

                const balanceData = response.data[0].new_balance;
                if (balanceData !== undefined) {
                    setNewBalance(balanceData);
                } else {
                    setNewBalance(0);
                }

                const allJobs = [];
                let jobCost = 0;
                for (const dataItem of response.data) {
                    if (dataItem.jobs && Array.isArray(dataItem.jobs)) {
                        
                        for (const job of dataItem.jobs) {
                            allJobs.push(job);
                            jobCost += parseFloat(job.cost);

                        }
                        setJobAmount(jobCost);
                    }
                }
                console.log(jobCost);
                setAllJobs(allJobs);

                // Set the payments state
                const allPayments = [];
                let totalPaymentAmount = 0;
                for (const dataItem of response.data) {
                    if (dataItem.payments && Array.isArray(dataItem.payments)) {
                        for (const payment of dataItem.payments) {
                            allPayments.push(payment);
                            totalPaymentAmount += parseFloat(payment.amount);
                        }
                        setTotalAmount(totalPaymentAmount);
                    }
                }
                setAllPayments(allPayments);
            })
            .catch(error => {
                console.error('Error fetching balance history:', error);
            });

    }, [client.id]);

    const percentagePaid = (totalAmount > 0) ? (totalAmount / jobAmount) * 100 : 100;

    let balanceColor = "#4CAF50";  // Default green
    let progressGradient = "linear-gradient(90deg, #4CAF50, #8BC34A)";  // Default green gradient

    if (newBalance < 0) {
        // Negative balance - red
        balanceColor = "#f44336";
        progressGradient = "linear-gradient(90deg, #f44336, #FF5722)";
    }   // For progress bar width

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
                                <span>{formatPhoneNumber(client.phoneNumber)}</span>
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
                            <span>Balance Due:</span> <span className="balance-amount" style={{ color: balanceColor }}>${Math.abs(newBalance)}</span>
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
                            style={{ 
                                width: `${percentagePaid}%`,
                                background: progressGradient
                            }}
                        >
                        </div>
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
                    <h3 className="panel-header">Completed Jobs<span className="total-amount">${jobAmount}</span></h3>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Address</th>
                                    <th>Service</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allJobs.map((job, i) => (
                                    <tr key={i}>
                                        <td>{job.property.street}</td>
                                        <td>{job.schedule.service}</td>
                                        <td>{formatUTCtoLocal(job.complete_date, timezone)}</td>
                                        <td>${job.cost}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* Payments */}
                <div className="client-panel payments-panel">
                    <h3 className="panel-header">Payments<span className="total-amount">${totalAmount}</span></h3>
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
                                {allPayments.map((payment, i) => (
                                    <tr key={i}>
                                        <td>{formatUTCtoLocal(payment.paymentDate, timezone)}</td>
                                        <td>{payment.paymentType}</td>
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