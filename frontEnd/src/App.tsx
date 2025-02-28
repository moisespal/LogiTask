import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import Home from "./pages/Home";
import ErrorPage from "./pages/ErrorPage";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Dev from "./pages/dev";

const Logout: React.FC = () =>{
  localStorage.clear()
  return <Navigate to="/login" />
}

const RegisterAndLogout: React.FC = () =>{
  localStorage.clear()
  return <RegisterPage />
}


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <Home/>
          </ProtectedRoute>
        }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/logout" element={<Logout/>} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="/dev" element={<Dev />} />
        <Route path="*" element={<ErrorPage />} />

      </Routes>
    </Router>
  );
};

export default App;
