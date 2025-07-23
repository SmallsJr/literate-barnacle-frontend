import React, { useState, useEffect } from "react";
import StorageLocationForm from "./StorageLocationForm";

const DatabasesSettings = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_BASE = "http://127.0.0.1:8001";

  // Fetch storage locations
  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/storage-locations/`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setLocations(data);
      setError("");
    } catch (err) {
      setError("Failed to load storage locations");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleCreate = () => {
    setEditingLocation(null);
    setShowForm(true);
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this storage location?")
    ) {
      try {
        const response = await fetch(`${API_BASE}/storage-locations/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setLocations(locations.filter((loc) => loc.id !== id));
          setSuccess("Storage location deleted successfully");
          setTimeout(() => setSuccess(""), 3000);
        } else {
          throw new Error("Failed to delete storage location");
        }
      } catch (err) {
        setError("Failed to delete storage location");
        console.error("Delete error:", err);
      }
    }
  };

  const handleSave = async (locationData) => {
    try {
      let response, result;

      if (editingLocation) {
        // Update existing location
        response = await fetch(
          `${API_BASE}/storage-locations/${editingLocation.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(locationData),
          }
        );

        if (response.ok) {
          result = await response.json();
          setLocations(
            locations.map((loc) =>
              loc.id === editingLocation.id ? result : loc
            )
          );
          setSuccess("Storage location updated successfully");
        } else {
          throw new Error("Failed to update storage location");
        }
      } else {
        // Create new location
        response = await fetch(`${API_BASE}/storage-locations/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(locationData),
        });

        if (response.ok) {
          result = await response.json();
          setLocations([...locations, result]);
          setSuccess("Storage location created successfully");
        } else {
          throw new Error("Failed to create storage location");
        }
      }

      setShowForm(false);
      setEditingLocation(null);
      setError("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMessage = editingLocation
        ? "Failed to update storage location"
        : "Failed to create storage location";

      setError(errorMessage);
      console.error("Save error:", err);
    }
  };

  if (showForm) {
    return (
      <StorageLocationForm
        location={editingLocation}
        onSave={handleSave}
        onCancel={() => {
          setShowForm(false);
          setEditingLocation(null);
        }}
      />
    );
  }

  return (
    <div className="databases-settings">
      <div className="section-header">
        <h2>Storage Locations</h2>
        <button className="create-btn" onClick={handleCreate}>
          + Create Location
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {loading ? (
        <div className="loading">Loading storage locations...</div>
      ) : locations.length === 0 ? (
        <div className="empty-state">
          <p>No storage locations found.</p>
          <button className="create-btn" onClick={handleCreate}>
            Create Your First Storage Location
          </button>
        </div>
      ) : (
        <div className="locations-table-container">
          <table className="locations-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Provider</th>
                <th>Bucket/Container</th>
                <th>Date Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <tr key={location.id}>
                  <td>{location.name}</td>
                  <td>{location.provider}</td>
                  <td>{location.bucket}</td>
                  <td>{new Date(location.created_at).toLocaleDateString()}</td>
                  <td className="actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(location)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(location.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DatabasesSettings;
