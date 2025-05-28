import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HrSidePanel from "./HrSidePanel";
import HrProfile from "./HrProfile";
import ClockInOut from "./ClockInOut";
import ViewAttendance from "./ViewAttendance";
import ViewLeaderboard from "./ViewLeaderboard";
import ViewSalary from "./ViewSalary";
import Chat from "./Chat";
import RequestLeave from "./RequestLeave";
import RequestDocuments from "./RequestDocuments";
import AddModifyEmployee from "./AddEmployee";
import PostEvent from "./PostEvents";
import ViewLeaveRequests from "./ViewLeaveRequest";

const HrPage: React.FC = () => {
  return (
    <div style={{ display: "flex", height: "151vh" }}>
      {/* Side Panel */}
      <HrSidePanel />

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px", backgroundColor: "#EFF3EA" }}>
        <Routes>
          <Route path="profile" element={<HrProfile />} />
          <Route path="request-documents" element={<RequestDocuments />} />
          <Route path="add-modify" element={<AddModifyEmployee />} />
          <Route path="post-events" element={<PostEvent />} />
          <Route path="clock-in-out" element={<ClockInOut />} />
          <Route path="view-attendance" element={<ViewAttendance />} />
          <Route path="View-leave-vacation-requests" element={<ViewLeaveRequests />} />
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

export default HrPage;
