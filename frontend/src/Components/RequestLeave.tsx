import React, { useState } from "react";
import "../style/RequestLeave.css";

interface LeaveRequest {
  id: number;
  reason: string;
  startDate: string;
  endDate: string;
}

const RequestLeave: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");


  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const newRequest: LeaveRequest = {
      id: leaveRequests.length + 1, // Temporary ID
      reason,
      startDate,
      endDate,
    };

    setLeaveRequests([...leaveRequests, newRequest]);
    setReason("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Request Leave/Vacation</h1>
        <form className="form" onSubmit={handleSubmit}>
          <label className="label">Reason</label>
          <textarea
            className="input"
            placeholder="Enter reason for leave"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          ></textarea>

          <label className="label">Start Date</label>
          <input type="date" className="input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

          <label className="label">End Date</label>
          <input type="date" className="input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

          <button type="submit" className="button">Submit Request</button>
        </form>

        <h2>Previous Leave Requests</h2>
        <ul>
          {leaveRequests.map((request) => (
            <li key={request.id}>
              {request.reason} - {request.startDate} to {request.endDate}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RequestLeave;
