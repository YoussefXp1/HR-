import React, { useEffect, useState } from "react";
import "../Style/LeaderBoard.css";

interface LeaderboardEntry {
  id: number;
  fullName: string;
  position: string;
  points: number;
  perfectStreak: number;
  lastClockIn: string;
  lastClockOut: string;
}

const Leaderboard: React.FC = () => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchLeaderboard = () => {
      fetch("http://localhost:5122/api/leaderboard/view", {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => setLeaders(data))
        .catch((err) => console.error("Failed to load leaderboard", err));
    };

    fetchLeaderboard(); // initial load
    const interval = setInterval(fetchLeaderboard, 1000); // every second

    return () => clearInterval(interval); // cleanup
  }, []);

  return (
    <div className="leaderboard-container">
      <h2>🏆 Employee Leaderboard 🏆</h2>
      {leaders.length === 0 ? (
        <p>No leaderboard data available.</p>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Position</th>
              <th>Points</th>
              <th>Streak</th>
              <th>Last Clock In</th>
              <th>Last Clock Out</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((entry, index) => (
              <tr key={entry.id}>
                <td>{index + 1}</td>
                <td>{entry.fullName}</td>
                <td>{entry.position}</td>
                <td>{entry.points}</td>
                <td>{entry.perfectStreak} days</td>
                <td>{entry.lastClockIn ? new Date(entry.lastClockIn).toLocaleString() : "-"}</td>
                <td>{entry.lastClockOut ? new Date(entry.lastClockOut).toLocaleString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Leaderboard;
