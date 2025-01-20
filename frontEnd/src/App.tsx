import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import Home from "./Home";
import ErrorPage from "./pages/ErrorPage";
// import ProtectedRoute from "./components/ProtectedRoute";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Error page route */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/home" element={<Home />} />

        <Route path="/404" element={<ErrorPage />} />

      </Routes>
    </Router>
  );
};

export default App;
