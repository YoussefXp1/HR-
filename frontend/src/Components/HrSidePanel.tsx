import React from "react";
import { Link } from "react-router-dom";
import "../Style/SidePanel.css";

const HrSidePanel: React.FC = () => {
  return (
    <div className="side-panel">
      <h3 className="side-panel-title">HR Dashboard</h3>
      <ul className="side-panel-list">
        <li>
          <Link to="/hr/profile" className="side-panel-link">
            View Profile
          </Link>
        </li>
        <li>
          <Link to="/hr/request-documents" className="side-panel-link">
            Request Documents
          </Link>
        </li>
        <li>
          <Link to="/hr/add-modify" className="side-panel-link">
            Add/Modify Employee
          </Link>
        </li>
        <li>
          <Link to="/hr/View-leave-vacation-requests" className="side-panel-link">
            Approve Leave/Vacation
          </Link>
        </li>
        <li>
          <Link to="/hr/post-events" className="side-panel-link">
            Post Events
          </Link>
        </li>
        <li>
          <Link to="/hr/view-attendance" className="side-panel-link">
            View Attendance
          </Link>
        </li>
        
        <li>
          <Link to="/hr/view-leaderboard" className="side-panel-link">
            View Leaderboard
          </Link>
        </li>
        
        <li>
          <Link to="/hr/chat" className="side-panel-link">
            Chat
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default HrSidePanel;
