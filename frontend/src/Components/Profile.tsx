import React, { useState } from "react";
import { FaEdit } from "react-icons/fa"; // Font Awesome edit icon (requires react-icons)
import "../style/Profile.css"; // Import CSS for styling
import Image from '../assets/employee-picture.png';

const ViewProfile: React.FC = () => {
  const [isEditingName, setIsEditingName] = useState(false); // State to toggle edit mode for name
  const [isEditingEmail, setIsEditingEmail] = useState(false); // State to toggle edit mode for email
  const [isEditingPhone, setIsEditingPhone] = useState(false); // State to toggle edit mode for phone number
  const [isEditingExperience, setIsEditingExperience] = useState(false); // State for work experience edit toggle

  const [fullName, setFullName] = useState("Youssef Fareed Sari"); // State for the full name
  const [email, setEmail] = useState("Youssef@example.com"); // State for the email
  const [phoneNumber, setPhoneNumber] = useState("123-456-7890"); // State for the phone number
  const [workExperience, setWorkExperience] = useState("Previous work experience goes here...");

  const position = "Software Engineer"; // Position is read-only

  // Toggle edit mode for full name
  

  // Toggle edit mode for email
  const toggleEditEmail = () => {
    setIsEditingEmail((prev) => !prev);
  };

  // Toggle edit mode for phone number
  const toggleEditPhone = () => {
    setIsEditingPhone((prev) => !prev);
  };

  const toggleEditExperience = () => {
    setIsEditingExperience((prev) => !prev);
  };

  // Update full name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
  };

  // Update email
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  // Update phone number
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  const handleExperienceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWorkExperience(e.target.value);
  };

  // Save changes function (for now just logging to the console)
  const handleSaveChanges = () => {
    console.log("Changes saved!");
  };

  return (
    <div className="view-profile-container">
      {/* Employee Picture */}
      <div className="profile-picture">
        <img
          src={Image}
          alt="Employee"
        />
      </div>

      {/* Employee ID */}
      <p className="employee-id">ID: 12786</p> {/* Replace with dynamic ID */}

      {/* Full Name Section */}
      <div className="name-section">
        <h3 className="name-title">
          Full Name{" "}
        </h3>
        <input
          type="text"
          value={fullName}
          onChange={handleNameChange}
          disabled={!isEditingName}
          className={`name-input ${isEditingName ? "editable" : ""}`}
        />
      </div>

      {/* Email Section */}
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

      {/* Phone Number Section */}
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
          className={`name-input ${isEditingPhone ? "editable" : ""}`}
        />
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
      
      {/* Work Experience Section */}
      <div className="work-experience-section">
        <h3 className="name-title">
          Work Experience{" "}
          <FaEdit
            className={`edit-icon ${isEditingExperience ? "active" : ""}`}
            onClick={toggleEditExperience}
            title="Edit"
          />
        </h3>
        <textarea
          value={workExperience}
          onChange={handleExperienceChange}
          disabled={!isEditingExperience}
          className={`work-experience-textarea ${isEditingExperience ? "editable" : ""}`}
        />
      </div>

      {/* Save Changes Button */}
      <button
        className="save-changes-button"
        onClick={handleSaveChanges}
        disabled={!isEditingName && !isEditingEmail && !isEditingPhone && !isEditingExperience}
      >
        Save Changes
      </button>
    </div>
  );
};

export default ViewProfile;
