import React, { useState } from "react";
import "../Style/RequestDocuments.css" // Import CSS for styling

const RequestDocuments = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [requestedDocuments, setRequestedDocuments] = useState("");
  const [message, setMessage] = useState("");

  const handleSearch = () => {
    if (employeeId || employeeName) {
      setMessage(`Employee ${employeeName || employeeId} found!`);
    } else {
      setMessage("Please enter an ID or Name to search.");
    }
  };

  const handleSendRequest = () => {
    if (employeeId && requestedDocuments) {
      setMessage(
        `Request sent for ${requestedDocuments} to Employee ID: ${employeeId}`
      );
      setRequestedDocuments(""); // Reset the document input field
    } else {
      setMessage("Please fill all required fields.");
    }
  };

  return (
    <div className="request-documents-container">
      <h2 className="request-documents-header">Request Documents</h2>

      {/* Search Section */}
      <input
        type="text"
        className="request-documents-input"
        placeholder="Employee ID"
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
      />
      <input
        type="text"
        className="request-documents-input"
        placeholder="Employee Name"
        value={employeeName}
        onChange={(e) => setEmployeeName(e.target.value)}
      />
      <button className="request-documents-button" onClick={handleSearch}>
        Search
      </button>

      {/* Requested Documents Section */}
      <textarea
        className="request-documents-textarea"
        placeholder="Enter requested documents here"
        value={requestedDocuments}
        onChange={(e) => setRequestedDocuments(e.target.value)}
        rows={4}
      />

      {/* Send Button */}
      <button className="request-documents-button" onClick={handleSendRequest}>
        Send Request
      </button>

      {/* Message */}
      {message && <p className="request-documents-message">{message}</p>}
    </div>
  );
};

export default RequestDocuments;
