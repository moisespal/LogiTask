import React, { useEffect, useState } from "react";
import api from "../api";
import { useLocation } from "react-router-dom";
import { ClientDataID, clientViewJob, Payment } from "../types/interfaces";
import "../styles/pages/ClientView.css";
import { formatPhoneNumber, formatUTCtoLocal }  from "../utils/format";
import PaymentModal from '../components/Payment/PaymentModal';
import AdjustmentModal from '../components/Payment/AdjustmentModal';
import EditClientModal from "../components/Client/EditClientModal";

const ClientView: React.FC = () => {
    const location = useLocation();
    const { client } = location.state as {
        client: ClientDataID;
    };

    const [newBalance, setNewBalance] = useState<number>(0);
    const [allPayments, setTotalPayments] = useState<(Payment & { invoiced: boolean })[]>([]);
    const [allPaymentsTotal, setAllPaymentsTotal] = useState<number>(0);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [allJobsCompleted, setAllJobsCompleted] = useState<(clientViewJob & { invoiced: boolean })[]>([]);
    const [allJobsTotal, setAllJobsTotal] = useState<number>(0);

    const timezone = localStorage.getItem("userTimeZone") || "UTC";

    useEffect(() => {
        const combinedJobs: (clientViewJob & { invoiced: boolean })[] = [];
        let combinedJobTotalCents = 0;

        const combinedPayments: (Payment & { invoiced: boolean })[] = [];
        let combinedPaymentsTotalCents = 0;

        let combinedBalance = 0;

        api.get(`/api/client/${client.id}/unapplied/`)
            .then(response => {
            combinedBalance += parseFloat(response.data.delta);

            const unapplied = response.data.unapplied_jobs;
            if (Array.isArray(unapplied)) {
                for (const job of unapplied.reverse()) {
                    combinedJobs.push({ ...job, invoiced: false });
                    combinedJobTotalCents += parseFloat(job.cost) * 100;
                    console.log("Unapplied Job:", job);
                }
            }

            const unappliedPayments = response.data.unapplied_payments;
            if (Array.isArray(unappliedPayments)) {
                for (const payment of unappliedPayments.reverse()) {
                    combinedPayments.push({ ...payment, invoiced: false });
                    combinedPaymentsTotalCents += parseFloat(payment.amount) * 100; 
                }
            }

            return api.get(`/api/balance-history/${client.id}/`);
            })
            .then(response => {
                if (response.data && response.data.length > 0) {
                    combinedBalance += parseFloat(response.data[response.data.length - 1].new_balance);
                    
                    for (const dataItem of response.data) {
                        if (Array.isArray(dataItem.jobs)) {
                            for (const job of dataItem.jobs.reverse()) {
                                combinedJobs.push({ ...job, invoiced: true });
                                combinedJobTotalCents += parseFloat(job.cost) * 100;
                                console.log("Invoiced Job:", job);
                            }
                        }
                        
                        if (Array.isArray(dataItem.payments)) {
                            for (const payment of dataItem.payments.reverse()) {
                                combinedPayments.push({ ...payment, invoiced: true });
                                combinedPaymentsTotalCents += parseFloat(payment.amount) * 100; 
                            }
                        }
                    }
                }
                setAllJobsCompleted(combinedJobs);
                setAllJobsTotal(combinedJobTotalCents / 100);
                setTotalPayments(combinedPayments);
                setAllPaymentsTotal(combinedPaymentsTotalCents / 100);
                setNewBalance(combinedBalance);
            })
        .catch(error => {
            console.error('Error fetching jobs:', error);
        });
    }, [client.id]);

    const getGradientFromBalance = (newBalance: number): [string, number] => {

        if (newBalance >= 0 || allJobsTotal === 0) {
            const fullGreen = "linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%)";
            return [fullGreen, 100];
        }

        const paid = Math.max(0, allPaymentsTotal);                 // never negative
        const percentPaid = Math.min(100, (paid / allJobsTotal) * 100);

        const eased = Math.pow(percentPaid / 100, 0.85);    
        const hue = eased * 80;                                                    

        const start = `hsl(${hue}, 100%, 40%)`          
        const end   = `hsl(${hue}, 100%, 50%)`;

        return [`linear-gradient(90deg,${start} 0%,${end} 100%)`, percentPaid];
    }

    const gradientAndPercentage = getGradientFromBalance(newBalance);

    const handleEditClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            setShowEditModal(true);
    };


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
                    <div className="client-avatar-and-details">
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
                    <button className="client-settings-button gear-button" onClick={handleEditClick} title="Edit Client Information">
                        <i className="fas fa-cog"></i>
                    </button>
                </div>
                
                {/* Balance Card */}
                <div className="client-balance-card">
                    <div className="balance-header">
                        <div className="balance-text">
                            {newBalance >= 0 ? (
                                <span className="balance-status">Credit: <span className="balance-amount" style={{  backgroundImage: gradientAndPercentage[0]}}>${(newBalance)}  </span></span>
                            ) : (
                                <>
                                    <span>Balance Due:</span> <span className="balance-amount" style={{  backgroundImage: gradientAndPercentage[0]}}>${(Math.abs(newBalance)).toFixed(2)}</span>
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
                            <button 
                                className="balance-adjustment-button"
                                onClick={() => setShowAdjustmentModal(true)}
                                title="Adjust Balance"
                            >
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
                    <h3 className="panel-header">Completed Jobs<span className="total-amount">${allJobsTotal.toFixed(2)}</span></h3>
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
                                {allJobsCompleted.map((job, i) => (
                                    <tr className={job.invoiced ? "invoiced-job" : "unapplied-job"} key={i}>
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
                    <h3 className="panel-header">Payments<span className="total-amount">${allPaymentsTotal.toFixed(2)}</span></h3>
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
                                    <tr className={payment.invoiced ? "invoiced-payment" : "unapplied-payment"} key={i}>
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
            <AdjustmentModal
                isOpen={showAdjustmentModal}
                client={client}
                onClose={() => setShowAdjustmentModal(false)}
            />
            <EditClientModal 
                isOpen={showEditModal}
                client={client}
                onClose={() => setShowEditModal(false)}
            />
        </div>
    );
};

export default ClientView;