import React, { useState } from "react";
import "../Style/ForgotPassword.css"
const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Reset password for:", email);
    // Add API call for password reset here
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      <p>Enter your email to reset your password.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
