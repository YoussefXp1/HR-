import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Image from "../assets/challenging-logo1.png";
import "../Style/LogIn.css";
import {jwtDecode} from "jwt-decode"; // Correct import for jwt-decode

// Define the structure of the decoded JWT token
interface DecodedToken {
  hrId: number;  // Assuming hrId is a number
  exp: number;   // Expiration time (JWT standard)
}

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
        credentials: "include", // this will allow cookies to be stored 
      });
      
      const data = await response.json();
      console.log("Login error response:", data);

      if (response.ok) {
      
       
        //const decodedToken: any = jwtDecode(data.token); // Decode token to extract hrId
        //const hrIdFromToken = decodedToken.hrId;
        //const currentTime = Date.now() / 1000;
        
        // Check if hrId is found in the token
        //if (hrIdFromToken) {
         // localStorage.setItem("hrId", hrIdFromToken.toString()); // Store hrId in localStorage
        //} else {
         // console.error("hrId NOT FOUND IN THE TOKEN");
        //}
        //check if the token is expired
        //if (decodedToken.exp < currentTime){
         // alert("Session expired. Please log in again");
          //navigate("/login");
          //return;
        //}

        setIsLoggedIn(true);
        //localStorage.setItem("token", data.token); // saving the token
        console.log("User Role:", data.role);

        // Redirect based on user role
        if (data.role === "Employee") {
          navigate("/employee");
        } else if (data.role === "HR") {
          navigate("/hr");
        }
      } else {
        setMessage(data.message || "Login failed.");
      }
    } catch (error) {
      console.error("Login error", error);
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
            <label htmlFor="emailOrId">Email</label>
            <input
              type="text"
              id="emailOrId"
              name="emailOrId"
              placeholder="Enter your Email"
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
          <p className="forgot-password" onClick={() => navigate("/forgot-password")}>
            Forgot Password?
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
