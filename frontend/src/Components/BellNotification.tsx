import React, { useState } from 'react';
import "../style/BellNotification.css";

type Notification = {
  id: number;
  title: string;
  message: string;
};

const BellNotification: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState<Notification[]>([
    { id: 1, title: 'New task assigned', message: 'You have a new task assigned.' },
    { id: 2, title: 'Meeting at 3 PM', message: 'Don’t forget about your 3 PM meeting.' },
    { id: 3, title: 'Project update', message: 'There is a new update on the project.' },
  ]);

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="notification-container">
      <button className="bell-icon" onClick={handleBellClick}>
        🔔
      </button>
      {showNotifications && (
        <div className="notifications-dropdown">
          <ul>
            {notifications.map((notification) => (
              <li key={notification.id}>
                <span className="notification-title">{notification.title}</span>
                <div className="notification-text">{notification.message}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BellNotification;
