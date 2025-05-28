import React, { useState, useEffect } from "react";
import "../Style/RequestDocuments.css";

const availableDocuments = [
  "Identity Verification",
  "Proof of Work Eligibility",
  "Professional Background",
  "Proof of Address",
  "Health & Safety",
  "Tax/Financial",
  "Other",

];

const RequestDocuments = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [message, setMessage] = useState("");
  const [latestRequests, setLatestRequests] = useState<any[]>([]);

  // Fetch latest requests
  const fetchLatestRequests = async () => {
    try {
      const response = await fetch(
        "http://localhost:5122/api/hr/latest-requests",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLatestRequests(data);
      } else {
        console.error("Failed to fetch latest document requests.");
      }
    } catch (error) {
      console.error("Error fetching latest document requests:", error);
    }
  };

  useEffect(() => {
    fetchLatestRequests();

    const interval = setInterval(fetchLatestRequests, 1000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleDocumentSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSelectedDocuments((prev) =>
      checked ? [...prev, value] : prev.filter((doc) => doc !== value)
    );
  };

  const handleSendRequest = async () => {
    if ((employeeId || employeeEmail) && selectedDocuments.length > 0) {
      try {
        const payload = {
          employeeId: employeeId ? parseInt(employeeId) : null,
          employeeEmail: employeeEmail.trim(),
          documents: selectedDocuments,
          additionalDetails: additionalDetails.trim(),
        };

        const response = await fetch(
          "http://localhost:5122/api/hr/request-documents",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          }
        );

        const responseData = await response.json();

        if (response.ok) {
          setMessage("✅ Document request sent successfully!");
          setEmployeeId("");
          setEmployeeEmail("");
          setSelectedDocuments([]);
          setAdditionalDetails("");
          fetchLatestRequests(); // Refresh latest requests
        } else {
          setMessage(
            `❌ Failed: ${responseData.message || "Unknown server error."}`
          );
        }
      } catch (error) {
        console.error("Request error:", error);
        setMessage("❌ Network error occurred while sending the request.");
      }
    } else {
      setMessage(
        "⚠️ Please provide either Employee ID or Email, and select documents."
      );
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    try {
      const response = await fetch(
        `http://localhost:5122/api/hr/cancel-request/${requestId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (response.ok) {
        setMessage("✅ Document request canceled successfully.");
        setLatestRequests(latestRequests.filter((r) => r.id !== requestId));
      } else {
        setMessage("❌ Failed to cancel the document request.");
      }
    } catch (error) {
      console.error("Cancel error:", error);
      setMessage("❌ Network error occurred while canceling the request.");
    }
  };

  return (
    <div className="request-documents-container">
      <h2 className="request-documents-header">Request Documents</h2>

      <input
        type="text"
        className="request-documents-input"
        placeholder="Employee ID (optional)"
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
      />
      <input
        type="text"
        className="request-documents-input"
        placeholder="Employee Email (optional)"
        value={employeeEmail}
        onChange={(e) => setEmployeeEmail(e.target.value)}
      />

      <h3 className="request-documents-subheader">
        Select Documents to Request
      </h3>
      <div className="documents-checkboxes">
        {availableDocuments.map((doc) => (
          <label key={doc} className="document-checkbox">
            <input
              type="checkbox"
              value={doc}
              checked={selectedDocuments.includes(doc)}
              onChange={handleDocumentSelection}
            />
            {doc}
          </label>
        ))}
      </div>

      <h3 className="request-documents-subheader">
        Additional Details (Optional)
      </h3>
      <textarea
        className="request-documents-textarea"
        placeholder="Enter any specific instructions or custom document requests"
        value={additionalDetails}
        onChange={(e) => setAdditionalDetails(e.target.value)}
        rows={4}
      />

      <button className="request-documents-button" onClick={handleSendRequest}>
        Send Document Request
      </button>

      {message && <p className="request-documents-message">{message}</p>}

      {/* Latest Requests Section */}
      <h3 className="request-documents-subheader">Latest Document Requests</h3>
      {latestRequests.length > 0 ? (
        <div className="latest-requests-list">
          {latestRequests.map((req) => (
            <div key={req.id} className="request-item">
              <span>
                <strong>Sent to:</strong>
                <strong> {req.employeeEmail}</strong>
              </span>
              <span>
                <strong>Requested:</strong>{" "}
                {new Date(req.createdAt).toLocaleString("en-GB", {
                  timeZone: "Asia/Riyadh",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour12: true,
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span>
                <strong>Status:</strong>{" "}
                {req.isCompleted ? (
                  <>
                    ✅ Completed{" "}
                    {req.uploadedDocumentPath && (
                      <a
                        href={`http://localhost:5122/api/hr/download-document/${req.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Download File"
                        className="download-link"
                      >
                                📥Download
                      </a>
                    )}
                  </>
                ) : (
                  "⌛ Pending"
                )}
              </span>

              <button
                className="cancel-request-button"
                onClick={() => handleCancelRequest(req.id)}
              >
                Cancel
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No recent document requests.</p>
      )}
    </div>
  );
};

export default RequestDocuments;
