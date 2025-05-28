import React, { useEffect, useRef, useState, useCallback } from "react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import axios from "axios";
import "../style/EmployeeChat.css";

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  senderRole: "HR" | "Employee";
}

const EmployeeChatComponent = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const [hrId, setHrId] = useState<number | null>(null);


  useEffect(() => {
    fetchMessages(); // Initial load

    // Start polling every 5 seconds
    pollingRef.current = setInterval(() => {
      fetchMessages();
    }, 2000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

    const fetchMessages = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5122/api/chat/conversation-with-hr", {
        withCredentials: true,
      });
      setMessages(res.data); // Always replace
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  }, []);

  useEffect(() => {
    fetchMessages(); // Initial

    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => {
      fetchMessages();
    }, 2000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [fetchMessages]);


  const handleSendMessage = async () => {
  if (!newMessage.trim()) return;

  try {
    await axios.post(
      "http://localhost:5122/api/chat/employee-send",
      { content: newMessage },
      { withCredentials: true }
    );
    setNewMessage("");
    fetchMessages(); // Refresh after sending
  } catch (err) {
    console.error("Failed to send message", err);
  }
};


  const handleEmojiClick = (emoji: EmojiClickData) => {
    setNewMessage((prev) => prev + emoji.emoji);
  };

  return (
    <div className="chat-containerr">
      <div className="chat-header">
        <h4>Chat with HR</h4>
      </div>

      <div ref={messageListRef} className="message-list">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.senderRole === "Employee" ? "sent" : "received"}`}>
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

      {showEmojiPicker && <EmojiPicker onEmojiClick={handleEmojiClick} />}

      <div className="message-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button onClick={() => setShowEmojiPicker((prev) => !prev)}>😀</button>
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default EmployeeChatComponent;
