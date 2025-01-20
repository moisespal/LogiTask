import React from 'react';
import { Link } from 'react-router-dom'; // <-- Import Link
import '../components/AuthPage.css';

interface RegisterPageProps {
  onRegister?: () => void; // Callback when registration succeeds
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister }) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle validation, API calls, etc. here
    if (onRegister) {
      onRegister();
    }
  };

  return (
    <div className="auth-container">
      <h1 className="brand">
        Logi<span className="highlight">Task</span>
      </h1>

      <div className="auth-card">
        <h2>Register</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            required
            placeholder="Username"
            className="auth-input"
          />
          <input
            type="email"
            name="email"
            required
            placeholder="Email"
            className="auth-input"
          />
          <input
            type="password"
            name="password"
            required
            placeholder="Password"
            className="auth-input"
          />

          <button type="submit" className="auth-btn">
            Register
          </button>
        </form>

        {/* Button/Link to go back to the Login page */}
        <div className="toggle-section">
          <p>Already have an account?</p>
          <Link to="/login" className="toggle-btn">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
