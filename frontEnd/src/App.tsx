import React from "react"
import { BrowserRouter as Router,Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./Home"
import ErrorPage from "./pages/ErrorPage"
import ProtectedRoute from "./components/ProtectedRoute"




const App: React.FC = () => {
  return (
    <Home/>
  );
}

export default App