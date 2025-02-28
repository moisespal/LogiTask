import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/ErrorPage.css'

const ErrorPage: React.FC = () => {
const navigate = useNavigate();

const handleGoHome = () => {
    navigate('/');
};

return (
    <div className="error-container">
    <div className="error-card">
        <h2 className="error-code">404</h2>
        <h2>Page Not Found</h2>
        <p>The page you’re looking for doesn’t exist or has been moved.</p>
        <button className="auth-btn" onClick={handleGoHome}>
        Return Home
        </button>
    </div>
    </div>
);
};

export default ErrorPage;