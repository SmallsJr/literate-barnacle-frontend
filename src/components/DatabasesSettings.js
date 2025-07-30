import React, { useState, useEffect } from "react";
import StorageLocationForm from "./StorageLocationForm";
import ProgressBattery from "./ProgressBattery";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <p>{message}</p>
        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-danger">
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

const DatabasesSettings = () => {
  const [locations, setLocations] = useState([]);
  const [crawlerStatus, setCrawlerStatus] = useState({});
  const [loading, setLoading] = useState({
    locations: true,
    status: true,
  });
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // State for delete confirmation modal
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    name: "",
  });

  const API_BASE = "http://127.0.0.1:8001";

  // Fetch storage locations
  const fetchLocations = async () => {
    setLoading((prev) => ({ ...prev, locations: true }));
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
      setLoading((prev) => ({ ...prev, locations: false }));
    }
  };

  // Fetch crawler status for all locations
  const fetchCrawlerStatus = async () => {
    setLoading((prev) => ({ ...prev, status: true }));
    try {
      const statuses = {};

      // Fetch status for each location
      for (const location of locations) {
        try {
          const response = await fetch(
            `${API_BASE}/crawl-status/crawl-status/${location.id}`
          );

          if (response.ok) {
            const data = await response.json();
            statuses[location.id] = data.status;
          } else {
            console.warn(`Failed to fetch status for location ${location.id}`);
            statuses[location.id] = -1; // Error state
          }
        } catch (err) {
          console.error(`Status fetch error for location ${location.id}:`, err);
          statuses[location.id] = -1; // Error state
        }
      }

      setCrawlerStatus(statuses);
    } catch (err) {
      console.error("Crawler status fetch error:", err);
    } finally {
      setLoading((prev) => ({ ...prev, status: false }));
    }
  };

  // Refresh crawler status periodically
  const startStatusPolling = () => {
    const interval = setInterval(() => {
      if (locations.length > 0) {
        fetchCrawlerStatus();
      }
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (locations.length > 0) {
      fetchCrawlerStatus();
      return startStatusPolling();
    }
  }, [locations]);

  const handleCreate = () => {
    setEditingLocation(null);
    setShowForm(true);
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setShowForm(true);
  };

  // Open delete confirmation modal
  const handleDeleteClick = (location) => {
    setDeleteModal({
      open: true,
      id: location.id,
      name: location.name,
    });
  };

  // Actual delete operation
  const handleDeleteConfirm = async () => {
    const id = deleteModal.id;

    try {
      const response = await fetch(`${API_BASE}/storage-locations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setLocations(locations.filter((loc) => loc.id !== id));
        setSuccess(`"${deleteModal.name}" deleted successfully`);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        throw new Error("Failed to delete storage location");
      }
    } catch (err) {
      setError(`Failed to delete "${deleteModal.name}"`);
      console.error("Delete error:", err);
    } finally {
      // Close modal regardless of outcome
      setDeleteModal({ open: false, id: null, name: "" });
    }
  };

  // Cancel delete operation
  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, id: null, name: "" });
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
          setSuccess(`"${editingLocation.name}" updated successfully`);
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
          setSuccess(`"${result.name}" created successfully`);
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
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        message={`Are you sure you want to delete "${deleteModal.name}"?`}
      />

      <div className="section-header">
        <h2>Storage Locations</h2>
        <button className="create-btn" onClick={handleCreate}>
          + Create Location
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {loading.locations ? (
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
                <th>Crawler Status</th>
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
                  <td>
                    {loading.status ? (
                      <div className="status-loading">Loading...</div>
                    ) : (
                      <ProgressBattery
                        percentage={crawlerStatus[location.id] || 0}
                      />
                    )}
                  </td>
                  <td className="actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(location)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteClick(location)}
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
