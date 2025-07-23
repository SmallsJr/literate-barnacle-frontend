import React, { useState } from "react";
import "./App.css";
import VisualizationPanel from "./components/VisualizationPanel";
import ThoughtProcess from "./components/ThoughtProcess";
import FileCount from "./components/FileCount";
import ChatArea from "./components/ChatArea";
import SettingsModal from "./components/SettingsModal";

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [fileCount, setFileCount] = useState(12);
  const [messages, setMessages] = useState([
    { content: "Hello! How can I assist you today?", sender: "ai" },
  ]);
  const [thoughtSteps, setThoughtSteps] = useState([
    "1. User asked about product features",
    "2. Retrieved product docs from database",
    "3. Generated feature comparison table",
    "4. Added pricing information",
  ]);

  const handleSend = (message) => {
    if (!message.trim()) return;

    // Add user message
    const newMessages = [...messages, { content: message, sender: "user" }];
    setMessages(newMessages);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        `I understand your question about "${message.substring(
          0,
          20
        )}...". Here's the information you requested.`,
        `Based on our documentation, ${message} can be implemented using our API endpoints.`,
        "I've analyzed your request and found 3 potential solutions...",
        "The system processed your input and generated the following recommendations:",
      ];
      setMessages([
        ...newMessages,
        {
          content: aiResponses[newMessages.length % aiResponses.length],
          sender: "ai",
        },
      ]);
      updateThoughtProcess();
    }, 1000);
  };

  const updateThoughtProcess = () => {
    const steps = [
      "Analyzing user intent",
      "Querying knowledge base",
      "Generating response candidates",
      "Applying safety filters",
      "Formatting final response",
    ];

    setThoughtSteps([]);
    steps.forEach((step, i) => {
      setTimeout(() => {
        setThoughtSteps((prev) => [...prev, `${i + 1}. ${step}`]);
      }, i * 800);
    });
  };

  const handleAddFile = () => {
    setFileCount((prev) => prev + Math.floor(Math.random() * 3) + 1);
  };

  return (
    <div className="app-container">
      <VisualizationPanel />

      <div className="left-panel">
        <ThoughtProcess steps={thoughtSteps} />
        <FileCount count={fileCount} onAddFile={handleAddFile} />
      </div>

      <div className="main-panel">
        <ChatArea messages={messages} onSend={handleSend} />
      </div>

      <button className="settings-btn" onClick={() => setShowSettings(true)}>
        ⚙️
      </button>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;
