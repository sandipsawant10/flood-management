// client/src/pages/Admin/ManageAlerts.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [newAlertContent, setNewAlertContent] = useState('');
  const [newAlertSeverity, setNewAlertSeverity] = useState('low');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await axios.get('/api/admin/alerts');
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleCreateAlert = async () => {
    try {
      await axios.post('/api/admin/alerts', { content: newAlertContent, severity: newAlertSeverity });
      setNewAlertContent('');
      setNewAlertSeverity('low');
      fetchAlerts();
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await axios.delete(`/api/admin/alerts/${id}`);
      fetchAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  return (
    <div className="manage-alerts">
      <h1>Manage Alerts</h1>
      <div className="create-alert">
        <input
          type="text"
          value={newAlertContent}
          onChange={(e) => setNewAlertContent(e.target.value)}
          placeholder="New alert content"
        />
        <select value={newAlertSeverity} onChange={(e) => setNewAlertSeverity(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button onClick={handleCreateAlert}>Create Alert</button>
      </div>
      <div className="alerts-list">
        {alerts.map((alert) => (
          <div key={alert.id} className="alert-item">
            <p>{alert.content} (Severity: {alert.severity})</p>
            <button onClick={() => handleDeleteAlert(alert.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageAlerts;