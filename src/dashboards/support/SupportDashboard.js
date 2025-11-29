import React from 'react';
import { useNavigate } from 'react-router-dom';

// Mock data for emergency requests
const mockRequests = [
  {
    id: 'ER-12345',
    requesterName: 'John Doe',
    ownerName: 'Jane Smith',
    location: 'Central Park, New York',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(), // 15 minutes ago
    status: 'Active',
  },
  {
    id: 'ER-67890',
    requesterName: 'Peter Jones',
    ownerName: 'Mark Allen',
    location: 'Union Station, Chicago',
    timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(), // 2 hours ago
    status: 'Resolved',
  },
];

const SupportDashboard = () => {
  const navigate = useNavigate();

  const handleViewDetails = (requestId) => {
    navigate(`/dashboard/support/request/${requestId}`);
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header">
        <h4 className="mb-0">Emergency Requests</h4>
      </div>
      <div className="list-group list-group-flush">
        {mockRequests.map((req) => (
          <div key={req.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1">Request: {req.id}</h5>
              <p className="mb-1">Requester: <strong>{req.requesterName}</strong> | Owner: <strong>{req.ownerName}</strong></p>
              <small className="text-muted">Location: {req.location} - {new Date(req.timestamp).toLocaleTimeString()}</small>
            </div>
            <button className="btn btn-primary" onClick={() => handleViewDetails(req.id)}>View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupportDashboard;