import React, { useState, useEffect } from "react";
import "../style/ClockInOut.css";

interface LogEntry {
  status: string;
  time: Date;
  duration?: string;
}

const ClockInOut: React.FC = () => {
  const [isClockedIn, setIsClockedIn] = useState<boolean>(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  // Load saved state from localStorage
  useEffect(() => {
    const savedIsClockedIn = localStorage.getItem("isClockedIn");
    const savedClockInTime = localStorage.getItem("clockInTime");
    const savedLogs = localStorage.getItem("clockLogs");

    const now = new Date();

  if (savedIsClockedIn === "true" && savedClockInTime) {
    const savedDate = new Date(savedClockInTime);

    const isSameDay =
      savedDate.getFullYear() === now.getFullYear() &&
      savedDate.getMonth() === now.getMonth() &&
      savedDate.getDate() === now.getDate();

    if (isSameDay) {
      setIsClockedIn(true);
      setClockInTime(savedDate);
    } else {
      // If it's a different day, remove outdated localStorage data
      localStorage.removeItem("isClockedIn");
      localStorage.removeItem("clockInTime");
      localStorage.removeItem("clockLogs");
    }
  }

  // Only load logs if they exist and are from today
  if (savedLogs) {
    try {
      const parsedLogs = JSON.parse(savedLogs);
      const todayLogs = parsedLogs.filter((log: any) => {
        const logDate = new Date(log.time);
        return (
          logDate.getFullYear() === now.getFullYear() &&
          logDate.getMonth() === now.getMonth() &&
          logDate.getDate() === now.getDate()
        );
      });

      const formattedSavedLogs = todayLogs.map((log: any) => ({
        ...log,
        time: new Date(log.time),
      }));
      setLogs(formattedSavedLogs);
    } catch (e) {
      console.error("Failed to parse saved logs:", e);
    }
  }

    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Fetch today's logs from the backend
  useEffect(() => {
    const fetchTodayLogs = async () => {
      try {
        const response = await fetch(
          "http://localhost:5122/api/attendance/today-log",
          {
            credentials: "include",
          }
        );
        const data = await response.json();

        if (Array.isArray(data)) {
          const formattedLogs: LogEntry[] = data
            .map((log: any) => {
              const logTime =
                log.status === "clocked-in"
                  ? log.clockInTime
                  : log.clockOutTime;

              if (!logTime) return null;

              return {
                status: log.status,
                time: new Date(logTime),
                duration: log.duration,
              };
            })
            .filter((log) => log !== null) as LogEntry[];

          setLogs(formattedLogs);
          localStorage.setItem("clockLogs", JSON.stringify(formattedLogs));
        } else {
          console.error("Unexpected response format:", data);
        }
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };

    fetchTodayLogs();
  }, []);

  const handleClockIn = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        const response = await fetch(
          "http://localhost:5122/api/attendance/clock-in",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ latitude, longitude }),
            credentials: "include",
          }
        );

        if (response.ok) {
          const now = new Date();
          setIsClockedIn(true);
          setClockInTime(now);
          localStorage.setItem("isClockedIn", "true");
          localStorage.setItem("clockInTime", now.toISOString());
          setMessage("Clocked in successfully.");
          addLog("clocked in");
        } else {
          const result = await response.text();
          console.error("Failed to clock in:", result);
          setMessage("Already clocked out.");
        }
      });
    }
  };

  const handleClockOut = async () => {
    try {
      const response = await fetch(
        "http://localhost:5122/api/attendance/clock-out",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({}),
        }
      );

      if (response.ok) {
        const clockOutTime = new Date();
        if (clockInTime) {
          const duration = getWorkedHours(clockInTime, clockOutTime);
          addLog("clocked out", duration);
        }
        setIsClockedIn(false);
        setClockInTime(null);
        localStorage.removeItem("isClockedIn");
        localStorage.removeItem("clockInTime");
      } else {
        alert("Failed to clock out.");
      }
    } catch (error) {
      console.error("Error clocking out:", error);
      alert("An error occurred while clocking out.");
    }
  };

  const getWorkedHours = (clockIn: Date, clockOut: Date) => {
    const workedDuration = clockOut.getTime() - clockIn.getTime();
    return (workedDuration / (1000 * 60 * 60)).toFixed(2);
  };

  const addLog = (status: string, duration?: string) => {
    const newLog: LogEntry = {
      status,
      time: new Date(),
      duration,
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem("clockLogs", JSON.stringify(updatedLogs));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: true,
      timeZone: "Asia/Riyadh",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const day = days[date.getDay()];
    const month = months[date.getMonth()];
    const dayOfMonth = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}, ${month} ${dayOfMonth}, ${year}`;
  };

  return (
    <div className="clock-in-out-container">
      <h2>Employee Clock In/Out</h2>

      {message && (
        <div className="info-message">
          <p>{message}</p>
        </div>
      )}

      <div className="digital-clock">
        <p>{formatTime(currentTime)}</p>
        <p className="current-date">{formatDate(currentTime)}</p>
      </div>

      <p className={`status ${isClockedIn ? "clocked-in" : "clocked-out"}`}>
        {isClockedIn ? "You are clocked in" : "You are clocked out"}
      </p>

      <div className="buttons">
        {!isClockedIn ? (
          <button className="clock-in-btn" onClick={handleClockIn}>
            Clock In
          </button>
        ) : (
          <button className="clock-out-btn" onClick={handleClockOut}>
            Clock Out
          </button>
        )}
      </div>

      {isClockedIn && clockInTime && (
        <p className="worked-hours">
          Total Worked Hours: {getWorkedHours(clockInTime, new Date())} hours
        </p>
      )}

      <div className="log">
        <h3>Clock In/Out Log</h3>
        <ul>
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <li key={index}>
                <p>
                  <strong>{log.status}</strong> at {formatTime(log.time)} on{" "}
                  {formatDate(log.time)}
                </p>
                {log.duration && (
                  <p>
                    <strong>Duration:</strong> {log.duration} hours
                  </p>
                )}
              </li>
            ))
          ) : (
            <p>No logs available yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ClockInOut;
