import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; //Redirect after signup
import "../style/SignUp.css";
import Image from "../assets/challenging-logo1.png";
import WhySignU from "../Components/WhySignUp";
import { FaEye, FaEyeSlash } from "react-icons/fa"; //Importing icons(password eye)

const SignUp: React.FC = () => {
  const navigate = useNavigate(); //React Router for navigation

  const [formData, setFormData] = useState({
    businessEmail: "",
    password: "",
    companyName: "",
    companyAddress: "",
    numberOfEmployees: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null); //Store errors
  const [showPassword, setShowPassword] = useState(false); //Toggling on and off password visibility

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      //This code will Register the company
      const registerResponse = await fetch("http://localhost:5122/api/company/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!registerResponse.ok) {
        if (registerResponse.status === 409) {
          throw new Error("This business email is already registered. Try logging in.");
        }
        throw new Error(`Registration failed! Status: ${registerResponse.status}`);
      }

      // Step 2: Send verification email
      const verifyResponse = await fetch("http://localhost:5122/api/company/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.businessEmail }),
      });

      if (!verifyResponse.ok) {
          const text = await verifyResponse.text(); // Read as plain text
          console.error("Raw response:", text);
    
          let errorMessage = "Failed to send verification email, but registration succeeded.";
          if(text){
          try {
                const errorData = JSON.parse(text); // Attempt to parse JSON
                errorMessage = errorData.message || errorMessage;
            } catch (error) {
              console.error("Error parsing JSON:", error);
            }
          }
        throw new Error(errorMessage);
      }

      setIsSubmitted(true);
      setTimeout(() => {
        navigate("/login"); //Redirect the user to the LoginPage after successful signup
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="signup-container">
        <div className="signup-image-container">
          <img src={Image} alt="Sign Up" className="signup-image" />
        </div>
        <h2>Sign Up</h2>

        {error && <p className="error-message">{error}</p>} {/* Show errors */}

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="businessEmail">Business Email</label>
            <input
              type="email"
              id="businessEmail"
              name="businessEmail"
              value={formData.businessEmail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Create Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8} //Ensure The password is at least 8 characters
              />
              <button type="button" onClick={togglePasswordVisibility} className="eye-button">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="companyName">Company Name</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="companyAddress">Company Address</label>
            <input
              type="text"
              id="companyAddress"
              name="companyAddress"
              value={formData.companyAddress}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="numberOfEmployees">Number of Employees</label>
            <input
              type="number"
              id="numberOfEmployees"
              name="numberOfEmployees"
              value={formData.numberOfEmployees}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn">Sign Up</button>
        </form>
      </div>
      <WhySignU />
    </>
  );
};

export default SignUp;
