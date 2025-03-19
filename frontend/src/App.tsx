import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import LoginPage from "./Components/LoginPage";
import Intro from "./Components/Intro";
import Features from "./Components/Features";
import EmployeePage from "./Components/EmployeePage";
import SignUp from "./Components/SignUp";
import HrPage from "./Components/HrPage";
import AboutModal from "./Components/AboutPage";
import ForgotPassword from "./Components/ForgotPassword";
import EmailVerified from "./Components/EmailVerified";


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
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
          <Route
            path="/login"
            element={<LoginPage setIsLoggedIn={setIsLoggedIn} />}
          />
          <Route path="/employee/*" element={<EmployeePage />} />
          <Route path="/hr/*" element={<HrPage />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/signup" element={<SignUp />} />{" "}
          <Route path="/email-verified" element={<EmailVerified />} />{" "}
          {/* Google email-verification done */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
