import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../../constants";
import { useUser } from "../../contexts/userContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [companyChecked, setCompanyChecked] = useState(false);
  const [hasCompany, setHasCompany] = useState(false);
  const [tzChecked, setTzChecked] = useState(false);
  const location = useLocation();
  const isCompanySetupRoute = location.pathname === "/company-setup";
  const { setRole } = useUser();

  // Check authentication when component mounts
  useEffect(() => {
    auth().catch(() => setIsAuthorized(false));
  }, []);

  // Check for company data when authentication is confirmed
  useEffect(() => {
    if (isAuthorized === true) {
      if (isCompanySetupRoute) {
        // Skip company check when on setup page
        setCompanyChecked(true);
      } else {
        // Use a simpler company check
        checkCompanyStatus();
        checkUserTimeZone();
      }
    }
  }, [isAuthorized, isCompanySetupRoute]);

  // Simplified company check that first looks at localStorage
  const checkCompanyStatus = () => {
    const cachedCompanyName = localStorage.getItem("companyName");

    if (cachedCompanyName) {
      // Company data exists in localStorage
      setHasCompany(true);
      setCompanyChecked(true);
    } else {
      // No company in localStorage, check API
      checkCompanyFromAPI();
    }
  };

  const checkUserTimeZone = async () => {
    const cachedTZ = localStorage.getItem("userTimeZone");
    const cachedRole = localStorage.getItem('role');

    if (cachedTZ && cachedRole) {
      setTzChecked(true);
      return;
    } 
    try {
      const res = await api.get("/api/get-user-profile/");
      if (res.data) {
        localStorage.setItem("userTimeZone", res.data.timezone);
        localStorage.setItem('role',res.data.role)
        setRole(res.data.role);
      }
    } catch (error) {
      console.error("Error checking user time zone:", error);
    }
    finally {
      setTzChecked(true);
    }
  };

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);
    try {
      const res = await api.post("/api/token/refresh/", {
        refresh: refreshToken,
      });
      if (res.status === 200) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.log(error);
      setIsAuthorized(false);
    }
  };

  const auth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      setIsAuthorized(false);
      return;
    }
    const decoded: { exp: number } = jwtDecode(token);
    const tokenExp = decoded.exp;
    const now = Date.now() / 1000;

    if (tokenExp < now) {
      await refreshToken();
    } else {
      setIsAuthorized(true);
    }
  };

  // Simplified API check for company data
  const checkCompanyFromAPI = async () => {
    try {
      const res = await api.get("/api/companySetup/");
      if (res.data && res.data.length > 0) {
        // Company exists
        setHasCompany(true);
        // Store in localStorage
        localStorage.setItem("companyName", res.data[0].companyName);
        if (res.data[0].logo) {
          localStorage.setItem("companyLogo", res.data[0].logo);
        } else {
          localStorage.removeItem("companyLogo");
        }
      } else {
        // No company found
        setHasCompany(false);
        localStorage.removeItem("companyName");
        localStorage.removeItem("companyLogo");
      }
    } catch (error) {
      console.error("Error checking company:", error);
      setHasCompany(false);
    } finally {
      setCompanyChecked(true);
    }
  };

  // Show loading while checking auth
  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  // Redirect to login if not authorized
  if (!isAuthorized) {
    return <Navigate to="/login" />;
  }

  // Show loading while checking company
  if (!companyChecked) {
    return <div>Loading company information...</div>;
  }

  // Redirect to setup if no company (except on setup page)
  if (!hasCompany && !isCompanySetupRoute) {
    return <Navigate to="/company-setup" />;
  }

  // All checks passed, render children
  if (tzChecked && companyChecked) {
    return <>{children}</>;
  }
}

export default ProtectedRoute;
