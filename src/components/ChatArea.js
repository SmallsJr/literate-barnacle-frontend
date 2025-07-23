import React, { useState, useRef, useEffect } from "react";

const ChatArea = ({ messages, onSend }) => {
  const [inputValue, setInputValue] = useState("");
  const chatEndRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend(inputValue);
    setInputValue("");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-area">
      <div className="chat-history">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}-message`}>
            {msg.content}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="input-container">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask something..."
          className="user-input"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatArea;
