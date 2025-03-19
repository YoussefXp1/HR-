import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Image from "../assets/challenging-logo1.png";
import "../Style/LogIn.css";

const LoginPage: React.FC<{ setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>> }> = ({ setIsLoggedIn }) => {
  const [emailOrId, setEmailOrId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = "http://localhost:5122/api/auth/login";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Identifier: emailOrId, Password: password }),
      });
      const data = await response.json();
      console.log("Login Response:", data); //debuging

      if (response.ok) {
        setIsLoggedIn(true);
        localStorage.setItem("token", data.token);
        console.log("User Role:", data.role);

        if (data.role === "Employee") {
          navigate("/employee");
        } else if (data.role === "HR") {
          navigate("/hr");
        }
      } else {
        setMessage(data.message || "Login failed.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-image-container">
          <img src={Image} alt="Login" className="login-image" />
        </div>
        <h2 className="login-title">Login</h2>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="emailOrId">Business Email or Employee ID</label>
            <input
              type="text"
              id="emailOrId"
              name="emailOrId"
              placeholder="Enter your Email or Employee ID"
              value={emailOrId}
              onChange={(e) => setEmailOrId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {message && <p className="error-message">{message}</p>}

          <button type="submit" className="submit-btn">Login</button>
          
          {/* Forgot Password Link */}
          <p className="forgot-password" onClick={() => navigate("/forgotpassword")}>
            Forgot Password?
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
