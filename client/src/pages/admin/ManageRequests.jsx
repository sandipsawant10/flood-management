// client/src/pages/Admin/ManageRequests.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageRequests = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/api/admin/requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleApproveRequest = async (id) => {
    try {
      await axios.put(`/api/admin/requests/${id}/approve`);
      fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      await axios.put(`/api/admin/requests/${id}/reject`);
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  return (
    <div className="manage-requests">
      <h1>Manage Requests</h1>
      <div className="requests-list">
        {requests.map((request) => (
          <div key={request.id} className="request-item">
            <p>{request.user} - {request.item} ({request.status})</p>
            {request.status === 'pending' && (
              <>
                <button onClick={() => handleApproveRequest(request.id)}>Approve</button>
                <button onClick={() => handleRejectRequest(request.id)}>Reject</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageRequests;