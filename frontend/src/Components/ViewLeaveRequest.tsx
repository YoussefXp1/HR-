import React, { useEffect, useState } from "react";
import "../Style/ViewLeaveRequests.css";

interface LeaveRequest {
  id: number;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  requestDate: string;
}

const ViewLeaveRequests: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRequests = async (query: string = "") => {
    try {
      const url = query
        ? `http://localhost:5122/api/hr/search-leave-requests?query=${encodeURIComponent(query)}`
        : "http://localhost:5122/api/hr/leave-requests";

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      // Fetch only once when searching
      fetchRequests(searchQuery);
      return;
    }

    // Initial fetch + polling if no search query
    fetchRequests();
    const interval = setInterval(() => {
      fetchRequests();
    }, 2000);

    return () => clearInterval(interval);
  }, [searchQuery]);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    const res = await fetch(`http://localhost:5122/api/hr/${action}-leave/${id}`, {
      method: "POST",
      credentials: "include",
    });
    const text = await res.text();
    setMessage(text);

    // Update request status in UI
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: action === "approve" ? "Approved" : "Rejected" } : r
      )
    );
  };

  const handleSearch = () => {
    fetchRequests(searchQuery);
  };

  return (
    <div className="view-requests-container">
      <h2>Leave Requests</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by employee name or ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {message && <div className="confirmation-message">{message}</div>}

      <div className="requests-table">
        {requests.length === 0 ? (
          <p>No leave requests available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td>{req.employeeName}</td>
                  <td>{req.leaveType}</td>
                  <td>{req.startDate.slice(0, 10)}</td>
                  <td>{req.endDate.slice(0, 10)}</td>
                  <td>{req.reason}</td>
                  <td>{req.status}</td>
                  <td>
                    {req.status === "Pending" ? (
                      <>
                        <button
                          className="approve-btn"
                          onClick={() => handleAction(req.id, "approve")}
                        >
                          Approve
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => handleAction(req.id, "reject")}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span>{req.status}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ViewLeaveRequests;
