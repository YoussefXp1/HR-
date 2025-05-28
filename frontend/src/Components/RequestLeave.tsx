import React, { useState } from "react";
import "../Style/RequestLeave.css";

const RequestLeave: React.FC = () => {
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!leaveType || !startDate || !endDate || !reason) {
      setMessage("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5122/api/employee/request-leave", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaveType, startDate, endDate, reason }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        setMessage(errorText || "Request failed. Please check your input.");
        return;
      }

      const data = await res.json();
      setMessage(data.message);

      // Clear form on success
      setLeaveType("");
      setStartDate("");
      setEndDate("");
      setReason("");
    } catch (err) {
      console.error(err);
      setMessage("Network error. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="request-leave-container">
      <h2>Request Vacation</h2>

      <label htmlFor="leaveType">Vacation Type</label>
      <select
        id="leaveType"
        value={leaveType}
        onChange={(e) => setLeaveType(e.target.value)}
      >
        <option value="">Select Vacation Type</option>
        <option value="Annual">Annual</option>
        <option value="Sick">Sick</option>
      </select>

      <label htmlFor="startDate">Start Date</label>
      <input
        id="startDate"
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />

      <label htmlFor="endDate">End Date</label>
      <input
        id="endDate"
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />

      <label htmlFor="reason">Reason</label>
      <textarea
        id="reason"
        placeholder="Reason..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />

      <button onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Request"}
      </button>

      {message && (
        <p
          className="feedback-message"
          style={{ color: message.includes("success") ? "green" : "red" }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default RequestLeave;
