import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY } from '../../config';

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '0.5rem',
};

// Mock data for a single request
const mockRequestDetails = {
  id: 'ER-12345',
  requesterName: 'John Doe',
  location: { lat: 40.785091, lng: -73.968285 }, // Central Park
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
};

const EmergencyRequestDetails = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Request Details: {requestId}</h3>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>
          <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
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
                  center={mockRequestDetails.location}
                  zoom={15}
                >
                  <Marker position={mockRequestDetails.location} />
                </GoogleMap>
              )}
            </div>
          </div>

          {/* Images Section */}
          <div className="card shadow-sm">
            <div className="card-header"><h5>Uploaded Images</h5></div>
            <div className="card-body">
              <div className="d-flex flex-wrap gap-2">
                {mockRequestDetails.images.map((img, index) => (
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
              {mockRequestDetails.chat.map((msg, index) => (
                <div key={index} className="mb-3">
                  <div className="d-flex justify-content-between">
                    <strong className={msg.user.includes('Requester') ? 'text-primary' : 'text-success'}>
                      {msg.user}
                    </strong>
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
  );
};

export default EmergencyRequestDetails;