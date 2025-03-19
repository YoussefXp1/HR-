import React from "react";
import "../Style/About.css"; // Make sure to update the CSS file for new styling
import Image from "../assets/About-image.png";
interface AboutModalProps {
  showModal: boolean;
  handleCloseModal: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ showModal, handleCloseModal }) => {
  if (!showModal) return null;

  return (
    <div className="modal-overlay" onClick={handleCloseModal}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <img
            src={Image} // Add an image URL here
            alt="HR Horizon Logo"
            className="modal-image"
          />
          <h2 className="modal-title">About HR Horizon</h2>
        </div>
        <p className="modal-content">
          HR Horizon is a modern platform designed to streamline HR operations, making it
          efficient and effective. From managing employee records to generating insightful
          reports, HR Horizon empowers HR professionals to focus on what matters most —
          building a great team and company culture.
        </p>
        <button className="modal-close-button" onClick={handleCloseModal}>
          Close
        </button>
      </div>
    </div>
  );
};

export default AboutModal;
