// Main.tsx (or whatever your main entry file is)
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AuthPage from './components/AuthPage';

const Main: React.FC = () => {
  // The 'page' state tracks which page we're on: 'auth' or 'app'
  const [page, setPage] = useState<'auth' | 'app'>('auth');

  // This callback switches us to the 'app' page
  const handleLogin = () => {
    setPage('app');
  };

  return (
    <>
      {page === 'auth' && <AuthPage onLogin={handleLogin} />}
      {page === 'app' && <App />}
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
