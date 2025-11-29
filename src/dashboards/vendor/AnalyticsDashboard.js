import React from 'react';
import {
  GoogleMap, Marker, useLoadScript
} from '@react-google-maps/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem',
};

// Mock data for registration locations
const registrationLocations = [
  { lat: 34.0522, lng: -118.2437 }, // Los Angeles, CA
  { lat: 40.7128, lng: -74.0060 },   // New York, NY
  { lat: 29.7604, lng: -95.3698 },   // Houston, TX
  { lat: 41.8781, lng: -87.6298 },   // Chicago, IL
  { lat: 39.9526, lng: -75.1652 },   // Philadelphia, PA
  { lat: 33.4484, lng: -112.0740 },  // Phoenix, AZ
  { lat: 29.4241, lng: -98.4936 },   // San Antonio, TX
  { lat: 32.7157, lng: -117.1611 },  // San Diego, CA
  { lat: 32.7767, lng: -96.7970 },   // Dallas, TX
  { lat: 37.3382, lng: -121.8863 },  // San Jose, CA
  { lat: 47.6062, lng: -122.3321 },  // Seattle, WA
  { lat: 39.7684, lng: -86.1581 },   // Indianapolis, IN
  { lat: 39.7392, lng: -104.9903 },  // Denver, CO
  { lat: 25.7617, lng: -80.1918 },   // Miami, FL
  { lat: 33.7490, lng: -84.3880 },   // Atlanta, GA
];

const AnalyticsDashboard = () => {
  const registrationData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Product Registrations',
        data: [120, 190, 300, 500, 220, 330],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const recoveryData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
    datasets: [
      {
        label: 'Item Recovery Rate (%)',
        data: [85, 88, 92, 90, 95],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyAzCNCNbdAejKSgQrUgkshTJ_gapr6aioc', // Replace with your actual API key
  });


  return (
    <div className="container-fluid">
      <h4 className="mb-4">Sales & Engagement Analytics</h4>
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Monthly Registrations</h5>
              <Bar data={registrationData} />
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Item Recovery Success</h5>
              <Line data={recoveryData} />
            </div>
          </div>
        </div>
      </div>

      {/* New Row for the Map */}
      <div className="row">
        <div className="col-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Registration Heatmap</h5>
              {loadError && <p>Error loading map.</p>}
              {!isLoaded && <p>Loading map...</p>}
              {isLoaded && (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={{ lat: 39.8283, lng: -98.5795 }} // Center of the US
                  zoom={4}
                >
                  {registrationLocations.map((loc, index) => (
                    <Marker key={index} position={loc} />
                  ))}
                </GoogleMap>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;