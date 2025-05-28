import React, { useEffect, useState, useRef } from "react";
import { FaEdit, FaPlus } from "react-icons/fa";
import "../style/Profile.css";
import defaultImage from "../assets/No-Profile-Pic.png";

const ViewProfile: React.FC = () => {
  const [profilePic, setProfilePic] = useState<string>(defaultImage);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [position, setPosition] = useState("Employee");
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [updateMessage, setUpdateMessage] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:5122/api/employee/profile", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) throw new Error("Unauthorized or profile fetch failed");

        const data = await response.json();
        setFullName(data.fullName || "");
        setEmail(data.email || "");
        setPhoneNumber(data.phoneNumber || "");
        setPosition(data.position || "Employee");
        setEmployeeId(data.employeeId);
        if (data.profilePictureUrl) {
          setProfilePic(`http://localhost:5122${data.profilePictureUrl}`);
        }
      } catch (error) {
        console.error("Error fetching employee profile:", error);
        alert("Session expired. Please login again.");
      }
    };

    fetchProfile();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please upload a valid image file.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("http://localhost:5122/api/employee/upload-profile-picture", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to upload profile picture");

    const data = await response.json();
    setProfilePic(`http://localhost:5122${data.profilePictureUrl}`);
    setUpdateMessage("Profile picture updated successfully.");
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    setUpdateMessage("Failed to upload profile picture.");
  }
};



  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const toggleEditEmail = () => {
    setIsEditingEmail((prev) => !prev);
    setUpdateMessage("");
  };

  const toggleEditPhone = () => {
    setIsEditingPhone((prev) => !prev);
    setUpdateMessage("");
    setPhoneError("");
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setUpdateMessage("");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setPhoneNumber(val);
      setUpdateMessage("");
      if (val.length !== 10) {
        setPhoneError("Phone number must be exactly 10 digits");
      } else {
        setPhoneError("");
      }
    }
  };

  const handleSaveChanges = async () => {
    if (phoneError) return;

    try {
      const response = await fetch("http://localhost:5122/api/employee/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          phoneNumber,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const data = await response.json();
      setUpdateMessage(data.message || "Profile updated successfully.");
      setIsEditingEmail(false);
      setIsEditingPhone(false);
    } catch (error) {
      console.error("Error saving changes:", error);
      setUpdateMessage("Failed to update profile.");
    }
  };

  return (
    <div className="view-profile-container">
      <div className="profile-picture-wrapper" onClick={openFileDialog} title="Click to upload new picture">
        <img src={profilePic} alt="Employee" className="profile-picture" />
        <div className="overlay">
          <FaPlus className="plus-icon" />
        </div>
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <p className="employee-id">ID: {employeeId !== null ? employeeId : "Loading.."}</p>
      {updateMessage && (
        <p style={{ color: updateMessage.includes("success") ? "green" : "red", marginTop: "5px" }}>
          {updateMessage}
        </p>
      )}

      <div className="name-section">
        <h3 className="name-title">Full Name</h3>
        <input type="text" value={fullName} disabled className="name-input read-only" />
      </div>

      <div className="name-section">
        <h3 className="name-title">
          Email{" "}
          <FaEdit
            className={`edit-icon ${isEditingEmail ? "active" : ""}`}
            onClick={toggleEditEmail}
            title="Edit"
          />
        </h3>
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          disabled={!isEditingEmail}
          className={`name-input ${isEditingEmail ? "editable" : ""}`}
        />
      </div>

      <div className="name-section">
        <h3 className="name-title">
          Phone Number{" "}
          <FaEdit
            className={`edit-icon ${isEditingPhone ? "active" : ""}`}
            onClick={toggleEditPhone}
            title="Edit"
          />
        </h3>
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          disabled={!isEditingPhone}
          maxLength={10}
          className={`name-input ${isEditingPhone ? "editable" : ""}`}
        />
        {phoneError && (
          <p style={{ color: "red", marginTop: "3px", fontSize: "0.85em" }}>{phoneError}</p>
        )}
      </div>

      <div className="name-section">
        <h3 className="name-title">Position</h3>
        <input type="text" value={position} disabled className="name-input read-only" />
      </div>

      <button
        className="save-changes-button"
        onClick={handleSaveChanges}
        disabled={
          (!isEditingEmail && !isEditingPhone) || 
          (isEditingPhone && phoneError !== "")
        }
      >
        Save Changes
      </button>
    </div>
  );
};

export default ViewProfile;
