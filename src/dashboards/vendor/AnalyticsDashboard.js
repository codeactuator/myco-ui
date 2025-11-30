import React, { useState, useEffect } from 'react';
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
const allRegistrationLocations = [
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

const mockProducts = [
  { id: 'P01', name: 'Premium Leather Wallet' },
  { id: 'P02', name: 'City Explorer Backpack' },
  { id: 'P03', name: 'Traveler\'s Passport Holder' },
];

const qrCodeComparisonData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June'],
  datasets: [
    {
      label: 'QR Codes Created',
      data: [600, 650, 700, 720, 750, 800],
      backgroundColor: 'rgba(108, 117, 125, 0.6)',
      borderColor: 'rgba(108, 117, 125, 1)',
      borderWidth: 1,
    },
    {
      label: 'QR Codes Sold (Registered)',
      data: [120, 190, 300, 500, 220, 330],
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    },
  ],
};

const salesForecastData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July (Forecast)', 'August (Forecast)'],
  datasets: [
    {
      label: 'Actual Sales',
      data: [120, 190, 300, 500, 220, 330, null, null],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    },
    {
      label: 'Forecasted Sales',
      data: [null, null, null, null, null, 330, 380, 420],
      fill: false,
      borderColor: 'rgb(255, 99, 132)',
      borderDash: [5, 5],
      tension: 0.1,
    },
  ],
};

const AnalyticsDashboard = () => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [filteredChartData, setFilteredChartData] = useState({ qrCodeComparisonData, salesForecastData });
  const [filteredLocations, setFilteredLocations] = useState(allRegistrationLocations);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyAzCNCNbdAejKSgQrUgkshTJ_gapr6aioc', // Replace with your actual API key
  });

  useEffect(() => {
    const product = mockProducts.find(p => `${p.name} (${p.id})` === selectedProduct);

    if (product) {
      // Simulate fetching filtered data for the selected product
      // In a real app, you would make an API call with product.id
      const newQrData = { ...qrCodeComparisonData, datasets: qrCodeComparisonData.datasets.map(ds => ({ ...ds, data: ds.data.map(d => d ? Math.floor(d * 0.4) + 10 : null) })) };
      const newSalesData = { ...salesForecastData, datasets: salesForecastData.datasets.map(ds => ({ ...ds, data: ds.data.map(d => d ? Math.floor(d * 0.4) + 10 : null) })) };
      setFilteredChartData({ qrCodeComparisonData: newQrData, salesForecastData: newSalesData });
      // In a real app, you would filter locations by product ID. Here we just show a subset.
      setFilteredLocations(allRegistrationLocations.slice(0, 5));
    } else {
      // Reset to all data when filter is cleared
      setFilteredChartData({ qrCodeComparisonData, salesForecastData });
      setFilteredLocations(allRegistrationLocations);
    }
  }, [selectedProduct]);

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Sales & Engagement Analytics</h4>
        <div className="d-flex align-items-center" style={{ minWidth: '300px' }}>
          <label htmlFor="product-search" className="form-label me-2 mb-0">Product:</label>
          <input
            className="form-control"
            list="product-options"
            id="product-search"
            placeholder="Search by product..."
            onChange={(e) => setSelectedProduct(e.target.value)}
            value={selectedProduct}
          />
          <datalist id="product-options">
            {mockProducts.map(p => <option key={p.id} value={`${p.name} (${p.id})`} />)}
          </datalist>
          {selectedProduct && (
            <button
              className="btn btn-sm btn-outline-danger ms-2"
              onClick={() => setSelectedProduct('')}
              title="Clear Filter"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>
      </div>

      {/* New Row for Forecasting and QR Funnel */}
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">QR Code Funnel (Created vs. Sold)</h5>
              <Bar data={filteredChartData.qrCodeComparisonData} />
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Sales Forecasting</h5>
              <Line data={filteredChartData.salesForecastData} />
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
                  {filteredLocations.map((loc, index) => (
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