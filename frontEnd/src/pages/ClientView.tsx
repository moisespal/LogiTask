import React, { useEffect, useState } from "react";
import api from "../api";
import { useLocation } from "react-router-dom";
import { ClientDataID, clientViewJob, Payment } from "../types/interfaces";
import "../styles/pages/ClientView.css";
import { formatPhoneNumber, formatUTCtoLocal }  from "../utils/format";
import PaymentModal from '../components/Payment/PaymentModal';

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
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const timezone = localStorage.getItem("userTimeZone") || "UTC";

    useEffect(() => {
        api
            .get(`/api/client/${client.id}/unapplied/`) 
        api
            .get(`/api/balance-history/${client.id}/`)
            .then(response => {
                console.log('Balance history:', response.data);

                const balanceData = response.data[response.data.length - 1].new_balance;
                if (balanceData !== undefined) {
                    setNewBalance(balanceData);
                } else {
                    setNewBalance(0);
                }

                const allJobs = [];
                let totalJobCents = 0;
                for (const dataItem of response.data) {
                    if (dataItem.jobs && Array.isArray(dataItem.jobs)) {
                        
                        for (const job of dataItem.jobs) {
                            allJobs.push(job);
                            totalJobCents += Math.round(parseFloat(job.cost) * 100);

                        }
                        setJobAmount(totalJobCents / 100);
                    }
                }
                setAllJobs(allJobs);

                // Set the payments state
                const allPayments = [];
                let totalPaymentCents = 0;

                for (const dataItem of response.data) {
                    if (dataItem.payments && Array.isArray(dataItem.payments)) {
                        for (const payment of dataItem.payments) {
                            allPayments.push(payment);
                            totalPaymentCents += Math.round(parseFloat(payment.amount) * 100);
                        }
                        setTotalAmount(totalPaymentCents / 100);
                    }
                }
                setAllPayments(allPayments);
            })
            .catch(error => {
                console.error('Error fetching balance history:', error);
            });

    }, [client.id]);

    const getGradientFromBalance = (newBalance: number): [string, number] => {

        if (newBalance >= 0 || jobAmount === 0) {
            const fullGreen = "linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%)";
            return [fullGreen, 100];
        }

        const paid = Math.max(0, totalAmount);                 // never negative
        const percentPaid = Math.min(100, (paid / jobAmount) * 100);

        const eased = Math.pow(percentPaid / 100, 0.85);    
        const hue = eased * 80;                                                    

        const start = `hsl(${hue}, 100%, 40%)`          
        const end   = `hsl(${hue}, 100%, 50%)`;

        return [`linear-gradient(90deg,${start} 0%,${end} 100%)`, percentPaid];
    }

    const gradientAndPercentage = getGradientFromBalance(newBalance);


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
                            {newBalance >= 0 ? (
                                <span className="balance-status">Credit: <span className="balance-amount" style={{  backgroundImage: gradientAndPercentage[0]}}>${(newBalance)}  </span></span>
                            ) : (
                                <>
                                    <span>Balance Due:</span> <span className="balance-amount" style={{  backgroundImage: gradientAndPercentage[0]}}>${Math.abs(newBalance)}</span>
                                </>
                            )}
                        </div>
                        <div className="header-buttons">
                            <button 
                                className="payment-button-secondary" 
                                onClick={() => setShowPaymentModal(true)}
                                title="Record Payment"
                            >
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
                                width: `${gradientAndPercentage[1]}%`,
                                background: gradientAndPercentage[0]
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
            <PaymentModal 
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                client={client}
                onPaymentSubmit={() => setShowPaymentModal(false)}
            />
        </div>
    );
};

export default ClientView;