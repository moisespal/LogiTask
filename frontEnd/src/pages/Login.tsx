import React from 'react';
import { Link } from 'react-router-dom'; // <-- Import Link
import '../components/AuthPage.css';

interface LoginPageProps {
  onLogin?: () => void; // Callback when login succeeds
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Typically handle validation, API calls, etc. here
    if (onLogin) {
      onLogin();
    }
  };

  return (
    <div className="auth-container">
      <h1 className="brand">
        Logi<span className="highlight">Task</span>
      </h1>

      <div className="auth-card">
        <h2>Login</h2>

        <form onSubmit={handleSubmit}>
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
            Log In
          </button>
        </form>

        {/* Button/Link to go to the Register page */}
        <div className="toggle-section">
          <p>Don't have an account?</p>
          <Link to="/register" className="toggle-btn">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
