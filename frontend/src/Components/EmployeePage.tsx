import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SidePanel from "./SidePanel";
import Profile from "./Profile";
import UploadDocuments from "./Documents";
import ViewEvents from "./ViewEvents";
import ClockInOut from "./ClockInOut";
import ViewAttendance from "./ViewAttendance";
import ViewLeaderboard from "./ViewLeaderboard";
import ViewSalary from "./ViewSalary";
import Chat from "./Chat";
import RequestLeave from "./RequestLeave";



const EmployeePage: React.FC = () => {
  return (
    <div style={{ display: "flex", height: "151vh" }}>
      {/* Side Panel */}
      <SidePanel />

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px", backgroundColor: "#EFF3EA" }}>
        <Routes>
          <Route path="profile" element={<Profile />} />
          <Route path="upload-documents" element={<UploadDocuments />} />
          <Route path="view-events" element={<ViewEvents />} />
          <Route path="clock-in-out" element={<ClockInOut />} />
          <Route path="view-attendance" element={<ViewAttendance />} />
          <Route path="request-leave-vacation" element={<RequestLeave />} />
          <Route path="view-leaderboard" element={<ViewLeaderboard />} />
          <Route path="view-salary" element={<ViewSalary />} />
          <Route path="chat" element={<Chat />} />


          
          
          {/* Default Route */}
          <Route path="*" element={<Navigate to="profile" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default EmployeePage;
