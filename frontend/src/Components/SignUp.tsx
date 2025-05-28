import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/SignUp.css";
import Image from "../assets/challenging-logo1.png";
import WhySignU from "../Components/WhySignUp";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const SignUp: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    businessEmail: "",
    password: "",
    companyName: "",
    companyAddress: "",
    numberOfEmployees: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const isPasswordStrong = (password: string): boolean => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d|.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return strongPasswordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordStrong(formData.password)) {
      setError(
        "Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, and one number or special character."
      );
      return;
    }

    try {
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

      setIsSubmitted(true);
      setTimeout(() => {
        navigate("/login");
      }, 4000);
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

        {error && <p className="error-message">{error}</p>}

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
              />
              <button type="button" onClick={togglePasswordVisibility} className="eye-button">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {formData.password && !isPasswordStrong(formData.password) && (
              <p style={{ color: "red", fontSize: "0.85rem" }}>
                Password must have 8+ characters, one uppercase, one lowercase, and one number or special character.
              </p>
            )}
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

        {isSubmitted && (
          <div className="success-message" style={{ color: "green", marginTop: "1rem", textAlign: "center" }}>
            Company registered successfully! Please check your email to verify. Redirecting to login...
          </div>
        )}
      </div>
      <WhySignU />
    </>
  );
};

export default SignUp;
