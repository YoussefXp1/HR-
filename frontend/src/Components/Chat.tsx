import React, { useState, useEffect, useRef, useCallback } from "react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import axios from "axios";
import "../style/Chat.css";
import "../Style/ChatBar.css"

interface Employee {
  id: number;
  fullName: string;
  profilePictureUrl?: string;
  position:string; // optional in case some employees don't have one

}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  senderRole: string;
}

const HRChat = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null); // For clearing interval

  useEffect(() => {
    

    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5122/api/chat/search-employees?query=${searchTerm}`,
          { withCredentials: true }
        );
        setEmployees(res.data);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      }
    };

    fetchEmployees();
  }, [searchTerm]);

    const fetchMessages = useCallback(async () => {
    if (!selectedEmployee) return;
    try {
      const res = await axios.get(
        `http://localhost:5122/api/chat/conversations/${selectedEmployee.id}`,
        { withCredentials: true }
      );
      setMessages(res.data); // Always update to keep it live
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }, [selectedEmployee]);

  useEffect(() => {
    if (!selectedEmployee) return;

    fetchMessages(); // Initial

    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => {
      fetchMessages(); // Will use latest version
    }, 2000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [fetchMessages, selectedEmployee]);


  const handleSendMessage = async () => {
  if (!selectedEmployee || newMessage.trim() === "") return;

  const messageToSend: Message = {
    id: Date.now(),
    senderId: 0, // Can be set to real HR ID
    receiverId: selectedEmployee.id,
    content: newMessage,
    timestamp: new Date().toLocaleString("sv-SE", { timeZone: "Asia/Riyadh" }).replace(" ", "T"),
    senderRole: "HR",
  };

  try {
    await axios.post(
      "http://localhost:5122/api/chat/hr-send",
      { content: newMessage, receiverId: selectedEmployee.id },
      { withCredentials: true }
    );

    setMessages((prev) => [...prev, messageToSend]);
    setNewMessage("");
    setShowEmojiPicker(false);
  } catch (error) {
    console.error("Send message failed:", error);
  }
};


  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  return (
  <div className="chat-wrapper" style={{ display: "flex", height: "100vh" }}>
    <div className="chat-container" style={{ flex: 3, display: "flex", flexDirection: "column" }}>
      <div className="chat-header" style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
        <h4>Chat with {selectedEmployee?.fullName || "..."}</h4>
      </div>

      <div
        className="message-list"
        ref={messageListRef}
        style={{ flexGrow: 1, overflowY: "auto", padding: 10 }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.senderRole === "HR" ? "sent" : "received"}`}
          >
            {msg.content}
            <span className="timestamp">
              {new Date(msg.timestamp.replace(" ", "T")).toLocaleTimeString("en-US", {
                  timeZone: "Asia/Riyadh",
                  hour: "2-digit",
                  minute: "2-digit",
            })}
          </span>
          </div>
        ))}
      </div>

      <div
        className="message-input"
        style={{ display: "flex", padding: 10, borderTop: "1px solid #ccc", gap: 8 }}
      >
        <input
          type="text"
          placeholder="Type your message here..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          style={{ flex: 1, padding: "8px", borderRadius: 4, border: "1px solid #ccc" }}
        />
        <button onClick={() => setShowEmojiPicker((prev) => !prev)}>😀</button>
        <button onClick={handleSendMessage}>Send</button>
      </div>

      {showEmojiPicker && (
        <div style={{ position: "absolute", bottom: 70, left: 10 }}>
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
    </div>

    {/* Updated Sidebar */}
    <div className="employee-sidebar">
      <input
        type="text"
        placeholder="Search employees..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <ul className="employee-list">
  {employees.map((emp) => (
    <li
      key={emp.id}
      className={`employee-item ${selectedEmployee?.id === emp.id ? "selected" : ""}`}
      onClick={() => setSelectedEmployee(emp)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px",
        cursor: "pointer",
        borderBottom: "1px solid #eee",
      }}
    >
      <img
        src={
          emp.profilePictureUrl
            ? `http://localhost:5122${emp.profilePictureUrl}`
            : "/default-profile.png"
        }
        alt={emp.fullName}
        style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
      />
      <div>
        <div style={{ fontWeight: "bold" }}>{emp.fullName}</div>
        <div style={{ fontSize: "0.85rem", color: "#555" }}>{emp.position}</div>
      </div>
    </li>
  ))}
</ul>
    </div>
  </div>
);
};

export default HRChat;
