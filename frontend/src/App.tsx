import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import LoginPage from "./Components/LoginPage";
import Intro from "./Components/Intro";
import Features from "./Components/Features";
import EmployeePage from "./Components/EmployeePage";
import SignUp from "./Components/SignUp";
import HrPage from "./Components/HrPage";
import ForgotPassword from "./Components/ForgotPassword";
import EmailVerified from "./Components/EmailVerified";
import PasswordReset from "./Components/PasswordReset";
import AuthChecker from "./AuthChecker";

const AUTO_LOGOUT_TIME = 10 * 60 * 1000; // 10 minutes

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Authentication check logic (Verify if user is logged in)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:5122/api/auth/verify-token", {
          method: "GET",
          credentials: "include", //Send cookies with the request
        });

        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  // Auto logout after inactivity (based on AUTO_LOGOUT_TIME)
  useEffect(() => {
    let logoutTimer: NodeJS.Timeout;

    const resetTimer = () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => handleLogout(), AUTO_LOGOUT_TIME);
    };

    const handleLogout = async () => {
      try {
        await fetch("http://localhost:5122/api/auth/logout", {
          method: "POST",
          credentials: "include", // Ensure cookies are included
        });
        setIsLoggedIn(false);
        window.location.href = "/login"; // Redirect to login page
      } catch (error) {
        console.error("Logout failed:", error);
      }
    };

    // Listen for user activity (mouse, keyboard, click)
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    // Start the inactivity timer
    resetTimer();

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      if (logoutTimer) clearTimeout(logoutTimer);
    };
  }, []);

  return (
    <Router>
      <AuthChecker setIsLoggedIn={setIsLoggedIn} />
      <div className="app-container">
        <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Intro />
                <Features />
                <Footer />
              </>
            }
          />
          <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/email-verified" element={<EmailVerified />} />
          <Route path="/reset-password" element={<PasswordReset />} />

          {/* Protected Routes: Only accessible if logged in */}
          <Route
            path="/employee/*"
            element={
              isLoggedIn ? <EmployeePage /> : <RedirectToLogin />
            }
          />
          <Route
            path="/hr/*"
            element={
              isLoggedIn ? <HrPage /> : <RedirectToLogin />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

// Component to handle redirection
const RedirectToLogin = () => {
  const navigate = useNavigate(); // useNavigate hook should be used here

  useEffect(() => {
    navigate("/login"); // Redirect to login page
  }, [navigate]);

  return null; // This component does not render anything
};

export default App;
