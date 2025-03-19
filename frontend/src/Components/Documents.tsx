import React, { useState } from "react";
import "../style/Documents.css";

const EnhancedUploadDocuments: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);

  const allowedFormats = ["application/pdf", "image/png", "image/jpeg"];
  const maxSize = 5 * 1024 * 1024; // 5 MB
  const uploadLimit = 5;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    const validFiles: File[] = [];
    let hasError = false;

    if (files.length + selectedFiles.length > uploadLimit) {
      setErrorMessage(`You can only upload up to ${uploadLimit} documents.`);
      hasError = true;
      return;
    }

    selectedFiles.forEach((file) => {
      if (!allowedFormats.includes(file.type)) {
        setErrorMessage(`Invalid file type: ${file.name}`);
        hasError = true;
      } else if (file.size > maxSize) {
        setErrorMessage(`File size exceeds limit: ${file.name}`);
        hasError = true;
      } else {
        validFiles.push(file);
      }
    });

    if (!hasError) setErrorMessage(null);
    setFiles((prevFiles) => [...prevFiles, ...validFiles]);
    setUploadProgress((prevProgress) => [
      ...prevProgress,
      ...Array(validFiles.length).fill(0),
    ]);
  };

  const handleFileDelete = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setUploadProgress((prevProgress) => prevProgress.filter((_, i) => i !== index));
  };

  const simulateUpload = () => {
    const progress = [...uploadProgress];
    files.forEach((_, index) => {
      const interval = setInterval(() => {
        if (progress[index] < 100) {
          progress[index] += 10;
          setUploadProgress([...progress]);
        } else {
          clearInterval(interval);
        }
      }, 200);
    });
  };

  const handleUpload = () => {
    if (files.length === 0) {
      setErrorMessage("Please select files to upload.");
      return;
    }

    setErrorMessage(null);
    simulateUpload();
  };

  const renderPreview = (file: File) => {
    if (file.type.startsWith("image/")) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="file-preview"
        />
      );
    }
    return <span className="file-placeholder">Preview not available</span>;
  };

  return (
    <div className="upload-documents-container">
      <h2>Upload Documents</h2>

      <div className="file-upload-area">
        <input
          type="file"
          id="fileInput"
          multiple
          onChange={handleFileChange}
          className="file-input"
        />
        <label htmlFor="fileInput" className="file-upload-label">
          Drag and drop files here or click to select
        </label>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>

      <ol className="upload-guide">
        <li>Select files (up to {uploadLimit} at a time).</li>
        <li>Ensure each file is under 5MB and in PNG, JPEG, or PDF format.</li>
        <li>Click "Upload Files" to start uploading.</li>
      </ol>

      <div className="uploaded-files-list">
        {files.map((file, index) => (
          <div key={index} className="file-item">
            {renderPreview(file)}
            <div className="file-details">
              <span className="file-name">{file.name}</span>
              <span className="file-size">
                ({(file.size / 1024).toFixed(2)} KB)
              </span>
              <div className="progress-bar">
                <div
                  className="progress"
                  style={{ width: `${uploadProgress[index]}%` }}
                ></div>
              </div>
              <button
                className="delete-button"
                onClick={() => handleFileDelete(index)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        className="upload-button"
        onClick={handleUpload}
        disabled={files.length === 0}
      >
        Upload Files
      </button>
    </div>
  );
};

export default EnhancedUploadDocuments;
