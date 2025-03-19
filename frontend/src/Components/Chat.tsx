import React, { useState, useEffect, useRef } from "react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import "../style/Chat.css";

const ChatComponent = () => {
  const [messages, setMessages] = useState<
    { text: string; type: "sent" | "received"; timestamp: string }[]
  >([]);
  const [newMessage, setNewMessage] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const timestamp = new Date().toLocaleString();

    // Add the user's message immediately
    setMessages([
      ...messages,
      { text: newMessage, type: "sent", timestamp },
      { text: "HR is writing...", type: "received", timestamp },
    ]);
    setNewMessage("");

    // Simulate HR response after a delay
    setTimeout(() => {
      setMessages((prevMessages) =>
        prevMessages.map((msg, index) =>
          index === prevMessages.length - 1
            ? { ...msg, text: "I will text you as soon as I can" } // Update the "HR is writing..." message
            : msg
        )
      );
    }, 2000); // Adjust delay as needed (2 seconds here)
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const timestamp = new Date().toLocaleString();
      setMessages([
        ...messages,
        {
          text: `📎 Attached file: ${file.name}`,
          type: "sent",
          timestamp,
        },
      ]);
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(newMessage + emojiData.emoji);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <h4>Chat with HR</h4>
        <button onClick={toggleTheme} className="theme-toggle-button">
          {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
      </div>

      {/* Message List */}
      <div ref={messageListRef} className="message-list">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            {message.text}
            <span className="timestamp">{message.timestamp}</span>
          </div>
        ))}
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && <EmojiPicker onEmojiClick={handleEmojiClick} />}

      {/* Message Input */}
      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message here..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
        />
        <label className="attach-button">
          📎
          <input
            type="file"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
        </label>
        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>😀</button>
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatComponent;
