import React, { useState } from "react";
import DatabasesSettings from "./DatabasesSettings";

const SettingsModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("databases"); // Default to Databases tab
  const [formData, setFormData] = useState({
    modelVersion: "gpt-4",
    temperature: 0.7,
    safeMode: true,
    responseStyle: "concise",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Configuration saved!");
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="settings-modal">
        <div className="modal-header">
          <h2>System Configuration</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === "databases" ? "active" : ""}`}
            onClick={() => setActiveTab("databases")}
          >
            Databases
          </button>
          <button
            className={`tab-btn ${activeTab === "llm-config" ? "active" : ""}`}
            onClick={() => setActiveTab("llm-config")}
          >
            LLM Config
          </button>
          <button
            className={`tab-btn ${activeTab === "account" ? "active" : ""}`}
            onClick={() => setActiveTab("account")}
          >
            Account
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "databases" && <DatabasesSettings />}

          {activeTab === "llm-config" && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>
                  Model Version
                  <span className="tooltip">
                    ℹ️
                    <span className="tooltip-text">
                      Select LLM version for processing
                    </span>
                  </span>
                </label>
                <select
                  name="modelVersion"
                  value={formData.modelVersion}
                  onChange={handleChange}
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="llama-2">Llama 2</option>
                  <option value="claude">Claude</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  Temperature
                  <span className="tooltip">
                    ℹ️
                    <span className="tooltip-text">
                      Control response creativity (0=strict, 1=creative)
                    </span>
                  </span>
                </label>
                <input
                  type="range"
                  name="temperature"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.temperature}
                  onChange={handleChange}
                />
                <span>{formData.temperature}</span>
              </div>

              <div className="form-group">
                <label>Response Style</label>
                <select
                  name="responseStyle"
                  value={formData.responseStyle}
                  onChange={handleChange}
                >
                  <option value="concise">Concise</option>
                  <option value="detailed">Detailed</option>
                  <option value="technical">Technical</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="safeMode"
                    checked={formData.safeMode}
                    onChange={handleChange}
                  />
                  Safe Content Filtering
                </label>
              </div>

              <button type="submit" className="save-btn">
                Save Configuration
              </button>
            </form>
          )}

          {activeTab === "account" && (
            <div className="account-settings">
              <h3>Account Settings</h3>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value="user@example.com" disabled />
              </div>
              <div className="form-group">
                <label>Subscription Plan</label>
                <select>
                  <option>Free Tier</option>
                  <option>Professional</option>
                  <option>Enterprise</option>
                </select>
              </div>
              <button className="save-btn">Update Account</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
