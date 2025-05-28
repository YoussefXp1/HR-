import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../Style/PasswordReset.css";

const PasswordReset: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const isPasswordStrong = (password: string): boolean => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d|.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return strongPasswordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!isPasswordStrong(newPassword)) {
      setError("Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, and one number or special character.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5122/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          window.close();
          setTimeout(() => {
            navigate("/login");
          }, 1000);
        }, 3000);
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch {
      setError("Failed to connect to the server.");
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Password</h2>
      <p>Enter your new password below.</p>

      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        {newPassword && !isPasswordStrong(newPassword) && (
          <p style={{ color: "red", fontSize: "0.85rem" }}>
            Password must have 8+ characters, one uppercase, one lowercase, and one number or special character.
          </p>
        )}

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default PasswordReset;
