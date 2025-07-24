import React, { useState } from "react";

const StorageLocationForm = ({ location, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    provider: "",
    bucket: "",
    access_key: "",
    secret_key: "",
    endpoint: "",
    region: "",
    ...location,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const storageTypes = [
    "Amazon S3",
    "Google Cloud Storage",
    "Azure Blob Storage",
    "Wasabi",
    "Backblaze B2",
    "DigitalOcean Spaces",
  ];

  return (
    <div className="storage-form">
      <h3>
        {location ? "Edit Storage Location" : "Create New Storage Location"}
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Provider *</label>
          <select
            name="provider"
            value={formData.provider}
            onChange={handleChange}
            required
          >
            <option value="">Select a provider</option>
            {storageTypes.map((provider) => (
              <option key={provider} value={provider}>
                {provider}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Bucket/Container Name *</label>
          <input
            type="text"
            name="bucket"
            value={formData.bucket}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Access Key *</label>
          <input
            type="password"
            name="access_key"
            value={formData.access_key}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Secret Key *</label>
          <input
            type="password"
            name="secret_key"
            value={formData.secret_key}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Endpoint URL</label>
          <input
            type="url"
            name="endpoint"
            value={formData.endpoint}
            onChange={handleChange}
            placeholder="https://"
          />
        </div>

        <div className="form-group">
          <label>Crawler Status</label>
          <ProgressBattery percentage={editingLocation.crawler_status || 0} />
        </div>

        <div className="form-group">
          <label>Region</label>
          <input
            type="text"
            name="region"
            value={formData.region}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className={`save-btn ${location ? "update-btn" : "create-btn"}`}
          >
            {location ? "Update Location" : "Create Location"}
          </button>
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default StorageLocationForm;
