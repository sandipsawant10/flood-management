// client/src/pages/Admin/ManageDisasters.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageDisasters = () => {
  const [disasters, setDisasters] = useState([]);
  const [newDisasterName, setNewDisasterName] = useState('');
  const [newDisasterType, setNewDisasterType] = useState('');
  const [newDisasterLocation, setNewDisasterLocation] = useState('');
  const [newDisasterDate, setNewDisasterDate] = useState('');

  useEffect(() => {
    fetchDisasters();
  }, []);

  const fetchDisasters = async () => {
    try {
      const response = await axios.get('/api/admin/disasters');
      setDisasters(response.data);
    } catch (error) {
      console.error('Error fetching disasters:', error);
    }
  };

  const handleCreateDisaster = async () => {
    try {
      await axios.post('/api/admin/disasters', {
        name: newDisasterName,
        type: newDisasterType,
        location: newDisasterLocation,
        date: newDisasterDate,
      });
      setNewDisasterName('');
      setNewDisasterType('');
      setNewDisasterLocation('');
      setNewDisasterDate('');
      fetchDisasters();
    } catch (error) {
      console.error('Error creating disaster:', error);
    }
  };

  const handleDeleteDisaster = async (id) => {
    try {
      await axios.delete(`/api/admin/disasters/${id}`);
      fetchDisasters();
    } catch (error) {
      console.error('Error deleting disaster:', error);
    }
  };

  return (
    <div className="manage-disasters">
      <h1>Manage Disasters</h1>
      <div className="create-disaster">
        <input
          type="text"
          value={newDisasterName}
          onChange={(e) => setNewDisasterName(e.target.value)}
          placeholder="Disaster name"
        />
        <input
          type="text"
          value={newDisasterType}
          onChange={(e) => setNewDisasterType(e.target.value)}
          placeholder="Disaster type"
        />
        <input
          type="text"
          value={newDisasterLocation}
          onChange={(e) => setNewDisasterLocation(e.target.value)}
          placeholder="Disaster location"
        />
        <input
          type="date"
          value={newDisasterDate}
          onChange={(e) => setNewDisasterDate(e.target.value)}
        />
        <button onClick={handleCreateDisaster}>Create Disaster</button>
      </div>
      <div className="disasters-list">
        {disasters.map((disaster) => (
          <div key={disaster.id} className="disaster-item">
            <p>{disaster.name} ({disaster.type}) - {disaster.location} on {disaster.date}</p>
            <button onClick={() => handleDeleteDisaster(disaster.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageDisasters;