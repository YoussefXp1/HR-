import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import "../style/ViewAttendance.css";

interface LogEntry {
  status: string;
  clockInTime: Date;
  clockOutTime?: Date | null;
}

const ViewAttendance: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [todayLog, setTodayLog] = useState<LogEntry | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [employeeFoundMessage, setEmployeeFoundMessage] = useState<string>("");

  const fetchLogs = async () => {
    if (!searchTerm) return;
    setLoading(true);
    setError("");
    setTodayLog(null);
    setLogs([]);

    try {
      const response = await fetch(
        `http://localhost:5122/api/attendance/attendance/${searchTerm}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to find attendance logs");
      }

      const data = await response.json();

      const parsedLogs: LogEntry[] = data.map((log: any) => ({
        status: log.status,
        clockInTime: log.clockInTime ? new Date(log.clockInTime) : new Date(),
        clockOutTime: log.clockOutTime ? new Date(log.clockOutTime) : null,
      }));

      setLogs(parsedLogs);
      setEmployeeFoundMessage("Employee found");

      // Fetch today's log
      await fetchTodayLog(searchTerm);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayLog = async (employeeId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5122/api/attendance/today-log/${employeeId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) return;

      const data = await response.json();
      setTodayLog({
        status: data.status,
        clockInTime: new Date(data.clockInTime),
        clockOutTime: data.clockOutTime ? new Date(data.clockOutTime) : null,
      });
    } catch (err) {
      console.error("Failed to fetch today log");
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
      <h2>View Employee Attendance</h2>

      {employeeFoundMessage && (
        <p className="employee-found-message">{employeeFoundMessage}</p>
      )}

      <div className="search-box">
        <input
          type="text"
          placeholder="Search by Employee ID or Email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={fetchLogs}>Search</button>
      </div>

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

      {todayLog && (
        <div className="today-log">
          <h3>Today's Log</h3>
          <div className="log-row">
            <span className="log-label">Status:</span>
            <span className="log-value">{todayLog.status}</span>
          </div>
          <div className="log-row">
            <span className="log-label">Clock In:</span>
            <span className="log-value">
              {new Date(todayLog.clockInTime).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                timeZone: "Asia/Riyadh",
              })}
            </span>
          </div>
          <div className="log-row">
            <span className="log-label">Clock Out:</span>
            <span className="log-value">
              {todayLog.clockOutTime
                ? new Date(todayLog.clockOutTime).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "Asia/Riyadh",
                  })
                : "N/A"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAttendance;
