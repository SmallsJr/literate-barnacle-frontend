import React, { useState, useEffect } from "react";
import "./App.css";
import VisualizationPanel from "./components/VisualizationPanel";
import FileCount from "./components/FileCount";
import ChatArea from "./components/ChatArea";
import SettingsModal from "./components/SettingsModal";
import FileListModal from "./components/FileListModal";

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [fileCount, setFileCount] = useState(0);
  const [messages, setMessages] = useState([
    { content: "Hello! How can I assist you today?", sender: "ai" },
  ]);
  const [thoughtSteps, setThoughtSteps] = useState([
    "1. Analyzing user intent",
    "2. Querying knowledge base",
    "3. Generating response candidates",
    "4. Applying safety filters",
    "5. Formatting final response",
  ]);
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [retrievedFiles, setRetrievedFiles] = useState([]); // Single declaration here
  const [loadingFiles, setLoadingFiles] = useState(false);

  const API_BASE = "http://127.0.0.1:8001";

  // Fetch initial file count
  const fetchFileCount = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/crawl-status/crawl-status/68668d885ee0897c8c638cf2`
      );
      const data = await response.json();
      setFileCount(data.total_files);
    } catch (error) {
      console.error("Error fetching file count:", error);
    }
  };

  // Fetch retrieved files
  const fetchRetrievedFiles = async () => {
    setLoadingFiles(true);
    try {
      const response = await fetch(
        `${API_BASE}/crawl-status/crawl-status/68668d885ee0897c8c638cf2`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }

      const data = await response.json();
      // Ensure we always set an array
      setRetrievedFiles(Array.isArray(data?.files) ? data.files : []);
    } catch (error) {
      console.error("Error fetching files:", error);
      setRetrievedFiles([]); // Reset to empty array on error
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchFileCount();
  }, []);

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
    }, 1000);
  };

  const handleShowFiles = async () => {
    await fetchRetrievedFiles();
    setShowFilesModal(true);
  };

  return (
    <div className="app-container">
      <VisualizationPanel />

      <div className="thought-process">
        <h3>Reasoning Steps</h3>
        {thoughtSteps.map((step, index) => (
          <div key={index} className="reasoning-step">
            {step}
          </div>
        ))}
        <FileCount count={fileCount} onShowFiles={handleShowFiles} />
      </div>

      <ChatArea messages={messages} onSend={handleSend} />

      <button className="settings-btn" onClick={() => setShowSettings(true)}>
        ⚙️
      </button>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {showFilesModal && (
        <FileListModal
          files={retrievedFiles}
          loading={loadingFiles}
          onClose={() => setShowFilesModal(false)}
        />
      )}
    </div>
  );
}

export default App;
