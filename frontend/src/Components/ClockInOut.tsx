import React, { useState, useEffect } from 'react';
import "../style/ClockInOut.css"; // Import CSS for styling

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

  // Update current time every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleClockIn = () => {
    setClockInTime(new Date());
    setIsClockedIn(true);
    addLog('clocked in');
  };

  const handleClockOut = () => {
    const clockOutTime = new Date();
    if (clockInTime) {
      const duration = getWorkedHours(clockInTime, clockOutTime);
      addLog('clocked out', duration);
    }
    setIsClockedIn(false);
  };

  const getWorkedHours = (clockIn: Date, clockOut: Date) => {
    const workedDuration = clockOut.getTime() - clockIn.getTime();
    const hoursWorked = (workedDuration / (1000 * 60 * 60)).toFixed(2);
    return hoursWorked;
  };

  const addLog = (status: string, duration?: string) => {
    const newLog: LogEntry = {
      status,
      time: new Date(),
      duration,
    };
    setLogs(prevLogs => [newLog, ...prevLogs]);
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatDate = (date: Date) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    const day = days[date.getDay()];
    const month = months[date.getMonth()];
    const dayOfMonth = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}, ${month} ${dayOfMonth}, ${year}`;
  };

  return (
    <div className="clock-in-out-container">
      <h2>Employee Clock In/Out</h2>

      {/* Digital Clock */}
      <div className="digital-clock">
        <p>{formatTime(currentTime)}</p>
        <p className="current-date">{formatDate(currentTime)}</p>
      </div>

      {/* Clock In/Out Status */}
      <p className={`status ${isClockedIn ? 'clocked-in' : 'clocked-out'}`}>
        {isClockedIn ? "You are clocked in" : "You are clocked out"}
      </p>

      {/* Clock In/Out Buttons */}
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

      

      {/* Log of clock in/out times */}
      <div className="log">
        <h3>Clock In/Out Log</h3>
        <ul>
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <li key={index}>
                <p><strong>{log.status}</strong> at {formatTime(log.time)} on {formatDate(log.time)}</p>
                {log.duration && <p><strong>Duration:</strong> {log.duration} hours</p>}
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
