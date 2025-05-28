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
import "../style/EmployeeCalendar.css";

interface LogEntry {
  status: string;
  clockInTime: Date;
  clockOutTime?: Date | null;
}

const MyAttendance: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5122/api/attendance/my-attendance", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch attendance");

      const data = await res.json();

      const parsedLogs: LogEntry[] = data.map((log: any) => ({
        status: log.status,
        clockInTime: new Date(log.clockInTime),
        clockOutTime: log.clockOutTime ? new Date(log.clockOutTime) : null,
      }));

      setLogs(parsedLogs);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return eachDayOfInterval({ start, end });
  };

  const getLogForDay = (day: Date): LogEntry | undefined => {
    return logs.find((log) => isSameDay(log.clockInTime, day));
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const daysInMonth = getDaysInMonth(currentMonth);

  return (
    <div className="attendance-container">
      <h2>My Attendance</h2>

      {loading && <p>Loading logs...</p>}
      {error && <p className="error">{error}</p>}

      <div className="calendar-nav">
        <button onClick={handlePrevMonth}>Prev</button>
        <span>{format(currentMonth, "MMMM yyyy")}</span>
        <button onClick={handleNextMonth}>Next</button>
      </div>

      <div className="calendar-grid">
        {daysInMonth.map((day, index) => {
          const log = getLogForDay(day);

          const clockIn = log?.clockInTime
            ? new Date(log.clockInTime).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                timeZone: "Asia/Riyadh",
              })
            : null;

          const clockOut = log?.clockOutTime
            ? new Date(log.clockOutTime).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                timeZone: "Asia/Riyadh",
              })
            : "N/A";

          const tooltipText = log
            ? `Clocked In: ${clockIn}\nClocked Out: ${clockOut}`
            : "Not Clocked In";

          return (
            <div
              key={index}
              className={`calendar-day ${log ? "clocked-in" : "not-clocked-in"}`}
              title={tooltipText}
            >
              <span>{format(day, "d")}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyAttendance;
