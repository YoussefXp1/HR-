import React, { useEffect, useState } from "react";
import "../style/Documents.css";

const EnhancedUploadDocuments: React.FC = () => {
  const [documentRequests, setDocumentRequests] = useState<any[]>([]);
  const [suppressRefresh, setSuppressRefresh] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedFilesMap, setSelectedFilesMap] = useState<{
    [key: number]: File;
  }>({});

  const allowedFormats = ["application/pdf", "image/png", "image/jpeg"];
  const maxSize = 5 * 1024 * 1024; // 5 MB

  const fetchDocumentRequests = async () => {
    try {
      const response = await fetch(
        "http://localhost:5122/api/employee/my-document-requests",
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setDocumentRequests(data);
      } else {
        console.error("Failed to fetch document requests");
      }
    } catch (error) {
      console.error("Error fetching document requests:", error);
    }
  };

  useEffect(() => {
    fetchDocumentRequests();

    const interval = setInterval(() => {
      if (!suppressRefresh) {
        fetchDocumentRequests();
      }
    }, 3000); // every 3 seconds

    return () => clearInterval(interval);
  }, [suppressRefresh]);

  const handleFileSelection = (
    e: React.ChangeEvent<HTMLInputElement>,
    requestId: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!allowedFormats.includes(file.type)) {
      setErrorMessage("Only PDF, PNG, or JPEG files are allowed.");
      setSuccessMessage(null);
      return;
    }

    if (file.size > maxSize) {
      setErrorMessage("File size exceeds 5MB limit.");
      setSuccessMessage(null);
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setSelectedFilesMap((prev) => ({ ...prev, [requestId]: file }));
  };

  const handleFileUpload = async (requestId: number) => {
    const file = selectedFilesMap[requestId];
    if (!file) {
      setErrorMessage("No file selected.");
      setSuccessMessage(null);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `http://localhost:5122/api/employee/upload-document/${requestId}`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      if (response.ok) {
        setSuccessMessage("File uploaded successfully!");
        setErrorMessage(null);

        setDocumentRequests((prev) =>
          prev.filter((req) => req.id !== requestId)
        );

        setSuppressRefresh(true);
        setTimeout(() => {
          setSuppressRefresh(false);
          fetchDocumentRequests();
        }, 5000);
      } else {
        const errorText = await response.text();
        setErrorMessage(errorText || "Upload failed.");
        setSuccessMessage(null);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setErrorMessage("An error occurred during upload.");
      setSuccessMessage(null);
    }
  };

  return (
    <div className="upload-documents-container">
      <h2>Upload Requested Documents</h2>

      {successMessage && (
        <p className="success-message" style={{ color: "green" }}>
          {successMessage}
        </p>
      )}
      {errorMessage && (
        <p className="error-message" style={{ color: "red" }}>
          {errorMessage}
        </p>
      )}

      {documentRequests.length === 0 ? (
        <p>No document requests found.</p>
      ) : (
        <table className="document-request-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Details</th>
              <th>Requested At</th>
              <th>Status</th>
              <th>Upload / View</th>
            </tr>
          </thead>
          <tbody>
            {documentRequests.map((req: any) => (
              <tr key={req.id}>
                <td>{req.requestedDocuments}</td>
                <td>{req.additionalDetails || "-"}</td>
                <td>
                  {new Date(req.requestedAt).toLocaleString("en-GB", {
                    timeZone: "Asia/Riyadh",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour12: true,
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td>{req.isCompleted ? "Completed" : "Pending"}</td>
                <td>
                  {req.uploadedDocumentPath ? (
                    <a
                      href={`http://localhost:5122/${req.uploadedDocumentPath}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View File
                    </a>
                  ) : (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="file"
                        accept=".pdf,.jpeg,.jpg,.png"
                        onChange={(e) => handleFileSelection(e, req.id)}
                      />
                      <button
                        className="upload-button"
                        onClick={() => handleFileUpload(req.id)}
                      >
                        Upload
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EnhancedUploadDocuments;
