import React, { useEffect, useState } from "react";
import axios from "axios";
import "../style/BellNotification.css";

type Notification = {
  id: number;
  senderId: number;
  senderRole: string;
  content: string;
  timestamp: string;
};

const BellNotification: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasNew, setHasNew] = useState(false);

  const fetchUnseenMessages = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5122/api/chat/unseen-messages",
        {
          withCredentials: true,
        }
      );
      setNotifications(response.data);
      setHasNew(response.data.length > 0);
    } catch (error) {
      console.error("Failed to fetch unseen messages", error);
    }
  };

  const markMessagesAsSeen = async () => {
    try {
      await axios.post(
        "http://localhost:5122/api/chat/mark-seen",
        {},
        {
          withCredentials: true,
        }
      );
      setHasNew(false);
    } catch (error) {
      console.error("Failed to mark messages as seen", error);
    }
  };

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
  };

  // When dropdown is shown and has notifications, mark them as seen
  useEffect(() => {
    if (showNotifications && notifications.length > 0) {
      markMessagesAsSeen();
    }
  }, [showNotifications, notifications]);

  useEffect(() => {
    fetchUnseenMessages();
    const interval = setInterval(fetchUnseenMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="notification-container">
      <button className="bell-icon" onClick={handleBellClick}>
        🔔
        {hasNew && <span className="notification-badge"></span>}
      </button>
      {showNotifications && (
        <div className="notifications-dropdown">
          {notifications.length === 0 ? (
            <div className="notification-empty">No new messages</div>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li key={n.id}>
                  <strong>From {n.senderRole}</strong>: {n.content}
                  <div className="timestamp">{n.timestamp}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default BellNotification;
