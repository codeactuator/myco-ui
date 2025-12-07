import React, { useState } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '0.5rem',
};

// Mock data for emergency requests
const mockRequests = [
  {
    id: 'ER-12345',
    requesterName: 'John Doe',
    ownerName: 'Jane Smith',
    location: 'Central Park, New York',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    status: 'Active',
    details: {
      locationCoords: { lat: 40.785091, lng: -73.968285 }, // Central Park
      images: [
        'https://via.placeholder.com/400x300.png?text=Photo+1',
        'https://via.placeholder.com/400x300.png?text=Photo+2',
      ],
      chat: [
        { user: 'John Doe (Requester)', text: 'I found this wallet in the park.', time: '10:15 AM' },
        { user: 'Sarah Smith (Family)', text: 'Thank you so much! Is my mother okay?', time: '10:16 AM' },
        { user: 'John Doe (Requester)', text: 'Yes, she seems fine, just a bit shaken.', time: '10:17 AM' },
        { user: 'Support Team', text: 'We have dispatched local authorities to the location.', time: '10:18 AM' },
      ],
    },
  },
  {
    id: 'ER-67890',
    requesterName: 'Peter Jones',
    ownerName: 'Mark Allen',
    location: 'Union Station, Chicago',
    timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    status: 'Resolved',
    details: {
      locationCoords: { lat: 41.878876, lng: -87.635918 }, // Union Station
      images: ['https://via.placeholder.com/400x300.png?text=Photo+A'],
      chat: [
        { user: 'Peter Jones (Requester)', text: 'Found a lost backpack.', time: '08:30 AM' },
        { user: 'Support Team', text: 'Acknowledged. Contacting owner.', time: '08:31 AM' },
      ],
    },
  },
];

const SupportDashboard = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyAzCNCNbdAejKSgQrUgkshTJ_gapr6aioc', // Replace with your actual API key
  });

  const handleViewDetails = (requestId) => {
    const request = mockRequests.find(req => req.id === requestId);
    setSelectedRequest(request);
  };
  return (
    <div>
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

      {selectedRequest && (
        <div className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0">Request Details: {selectedRequest.id}</h3>
            <button className="btn btn-outline-secondary" onClick={() => setSelectedRequest(null)}>
              <i className="bi bi-x-lg me-2"></i>Close Details
            </button>
          </div>

          <div className="row">
            {/* Left Column: Map and Images */}
            <div className="col-md-6">
              {/* Map Section */}
              <div className="card shadow-sm mb-4">
                <div className="card-header"><h5>Location</h5></div>
                <div className="card-body">
                  {loadError && <p>Error loading map</p>}
                  {!isLoaded && <p>Loading map...</p>}
                  {isLoaded && (
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={selectedRequest.details.locationCoords}
                      zoom={15}
                    >
                      <Marker position={selectedRequest.details.locationCoords} />
                    </GoogleMap>
                  )}
                </div>
              </div>

              {/* Images Section */}
              <div className="card shadow-sm">
                <div className="card-header"><h5>Uploaded Images</h5></div>
                <div className="card-body">
                  <div className="d-flex flex-wrap gap-2">
                    {selectedRequest.details.images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Uploaded by requester ${index + 1}`}
                        className="img-thumbnail"
                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Chat */}
            <div className="col-md-6">
              <div className="card shadow-sm">
                <div className="card-header"><h5>Live Chat</h5></div>
                <div className="card-body" style={{ height: '600px', overflowY: 'auto' }}>
                  {selectedRequest.details.chat.map((msg, index) => (
                    <div key={index} className="mb-3">
                      <div className="d-flex justify-content-between">
                        <strong className={msg.user.includes('Requester') ? 'text-primary' : 'text-success'}>{msg.user}</strong>
                        <small className="text-muted">{msg.time}</small>
                      </div>
                      <p className="mb-0">{msg.text}</p>
                    </div>
                  ))}
                </div>
                <div className="card-footer">
                  <input type="text" className="form-control" placeholder="Type a message... (view only)" readOnly />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportDashboard;