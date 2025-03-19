import React, { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import "../style/ViewAttendance.css"; // Import CSS for styling

interface LogEntry {
  status: string;
  time: Date;
}

const ViewAttendance: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]); // Store clock in/out logs
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date()); // Track current month

  // Mock Logs: In real scenarios, these would come from an API
  useEffect(() => {
    // Mocking logs: Add clock-in times
    setLogs([
      { status: "clocked in", time: new Date("2024-12-01T09:00:00") },
      { status: "clocked out", time: new Date("2024-12-01T17:00:00") },
      { status: "clocked in", time: new Date("2024-12-03T09:00:00") },
      // more logs...
    ]);
  }, []);

  const getDaysInMonth = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return eachDayOfInterval({ start, end });
  };

  const isClockedIn = (date: Date) => {
    return logs.some(
      (log) => isSameDay(log.time, date) && log.status === "clocked in"
    );
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const daysInMonth = getDaysInMonth(currentMonth);

  return (
    <div className="attendance-container">
      <h2>Attendance Calendar</h2>

      {/* Calendar Navigation */}
      <div className="calendar-nav">
        <button onClick={handlePrevMonth}>Prev</button>
        <span>{format(currentMonth, "MMMM yyyy")}</span>
        <button onClick={handleNextMonth}>Next</button>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {daysInMonth.map((day, index) => (
          <div
            key={index}
            className={`calendar-day ${
              isClockedIn(day) ? "clocked-in" : "not-clocked-in"
            }`}
          >
            <span>{format(day, "d")}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewAttendance;
