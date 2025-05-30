import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../style/Profile.css";
import Image from "../assets/Hr-Image.png";

const HrProfile: React.FC = () => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
  const [hrId, setHrId] = useState<number | null>(null);
  const [position, setPosition] = useState("HR Manager");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHrProfile = async () => {
      try {
        const response = await fetch("http://localhost:5122/api/hr/profile", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Unauthorized. Please login again.");
        }

        const data = await response.json();
        setFullName(data.fullName || "");
        setEmail(data.email);
        setPhoneNumber(data.phoneNumber || "");
        setPosition(data.position || "HR Manager");
        setHrId(data.hrId);
      } catch (error) {
        console.error("Error fetching HR profile:", error);
        alert("Unauthorized. Please login again.");
        navigate("/login");
      }
    };

    fetchHrProfile();
  }, [navigate]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
    setUpdateMessage("");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setPhoneNumber(value);
      setUpdateMessage("");
      if (value.length !== 10 && value.length > 0) {
        setPhoneError("Phone number must be exactly 10 digits.");
      } else {
        setPhoneError("");
      }
    }
  };

  const toggleEditName = () => {
    setIsEditingName((prev) => !prev);
    setUpdateMessage("");
  };

  const toggleEditPhone = () => {
    setIsEditingPhone((prev) => !prev);
    setUpdateMessage("");
  };

  const handleSaveChanges = async () => {
    if (!hrId) {
      setUpdateMessage("HR ID not found!");
      return;
    }

    if (phoneNumber.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5122/api/hr/update-profile/${hrId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName,
            phoneNumber,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile.");
      }

      setUpdateMessage("Profile updated successfully!");
      setIsEditingName(false);
      setIsEditingPhone(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setUpdateMessage("Failed to update profile.");
    }
  };

  return (
    <div className="view-profile-container">
      <div className="profile-picture">
        <img src={Image} alt="HR Profile" />
        <p className="hr-id">ID: {hrId !== null ? hrId : "Loading.."}</p>
        {updateMessage && (
          <p style={{ color: updateMessage.includes("success") ? "green" : "red", marginTop: "5px" }}>
            {updateMessage}
          </p>
        )}
      </div>

      {/* Full Name Section */}
      <div className="name-section">
        <h3 className="name-title">
          Full Name{" "}
          <FaEdit className="edit-icon" onClick={toggleEditName} title="Edit" />
        </h3>
        <input
          type="text"
          value={fullName}
          onChange={handleNameChange}
          disabled={!isEditingName}
          className={`name-input ${isEditingName ? "editable" : ""}`}
        />
      </div>

      {/* Email Section (Read-only) */}
      <div className="name-section">
        <h3 className="name-title">Email</h3>
        <input
          type="email"
          value={email}
          disabled
          className="name-input read-only"
        />
      </div>

      {/* Phone Number Section */}
      <div className="name-section">
        <h3 className="name-title">
          Phone Number{" "}
          <FaEdit className="edit-icon" onClick={toggleEditPhone} title="Edit" />
        </h3>
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          disabled={!isEditingPhone}
          className={`name-input ${isEditingPhone ? "editable" : ""}`}
        />
        {phoneError && (
          <p style={{ color: "red", marginTop: "5px" }}>{phoneError}</p>
        )}
      </div>

      {/* Position Section */}
      <div className="name-section">
        <h3 className="name-title">Position</h3>
        <input
          type="text"
          value={position}
          disabled
          className="name-input read-only"
        />
      </div>

      {/* Save Changes Button */}
      <button
        className="save-changes-button"
        onClick={handleSaveChanges}
        disabled={!isEditingName && !isEditingPhone}
      >
        Save Changes
      </button>
    </div>
  );
};

export default HrProfile;
