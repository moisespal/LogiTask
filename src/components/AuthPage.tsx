// AuthPage.tsx
import React, { useState } from 'react';
import './AuthPage.css';

interface AuthPageProps {
  onLogin?: () => void; // This is our callback prop
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => setIsLogin(!isLogin);

  // Here’s a simple handler that calls onLogin if it exists
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Normally, you'd validate or do an API call here.
    // For now, just call onLogin to switch to App.
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
        <h2>{isLogin ? 'Login' : 'Register'}</h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              name="username"
              required
              placeholder="Username"
              className="auth-input"
            />
          )}
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
            {isLogin ? 'Log In' : 'Register'}
          </button>
        </form>

        <button className="toggle-btn" onClick={toggleMode}>
          {isLogin ? 'Register Instead' : 'Login Instead'}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
