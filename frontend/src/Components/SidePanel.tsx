import React from "react";
import { Link } from "react-router-dom";
import "../Style/SidePanel.css";

const SidePanel: React.FC = () => {
  return (
    <div className="side-panel">
      <h3 className="side-panel-title">Employee Dashboard</h3>
      <ul className="side-panel-list">
        <li>
          <Link to="/employee/profile" className="side-panel-link">
            View Profile
          </Link>
        </li>
        <li>
          <Link to="/employee/upload-documents" className="side-panel-link">
            Upload Documents
          </Link>
        </li>
        <li>
          <Link to="/employee/view-events" className="side-panel-link">
            View Events
          </Link>
        </li>
        <li>
          <Link to="/employee/clock-in-out" className="side-panel-link">
            Clock In/Out
          </Link>
        </li>
        <li>
          <Link to="/employee/my-attendance" className="side-panel-link">
            View Attendance
          </Link>
        </li>
        <li>
          <Link to="/employee/request-leave-vacation" className="side-panel-link">
            Request Leave/Vacation
          </Link>
        </li>
        <li>
          <Link to="/employee/view-leaderboard" className="side-panel-link">
            View Leaderboard
          </Link>
        </li>
        {/*
        <li>
          <Link to="/employee/view-salary" className="side-panel-link">
            View Salary
          </Link>
        </li>
        */}
        <li>
          <Link to="/employee/chat" className="side-panel-link">
            Chat
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default SidePanel;
