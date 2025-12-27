import React, { useState, useEffect } from 'react';
import {
  GoogleMap, Marker, InfoWindow, useLoadScript
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
import VendorService from '../../VendorService';
import { useAuth } from '../../AuthContext';

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
  { id: 'loc1', name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437, count: 52 },
  { id: 'loc2', name: 'New York, NY', lat: 40.7128, lng: -74.0060, count: 88 },
  { id: 'loc3', name: 'Houston, TX', lat: 29.7604, lng: -95.3698, count: 34 },
  { id: 'loc4', name: 'Chicago, IL', lat: 41.8781, lng: -87.6298, count: 61 },
  { id: 'loc5', name: 'Philadelphia, PA', lat: 39.9526, lng: -75.1652, count: 25 },
  { id: 'loc6', name: 'Phoenix, AZ', lat: 33.4484, lng: -112.0740, count: 45 },
  { id: 'loc7', name: 'San Antonio, TX', lat: 29.4241, lng: -98.4936, count: 19 },
  { id: 'loc8', name: 'San Diego, CA', lat: 32.7157, lng: -117.1611, count: 38 },
  { id: 'loc9', name: 'Dallas, TX', lat: 32.7767, lng: -96.7970, count: 41 },
  { id: 'loc10', name: 'San Jose, CA', lat: 37.3382, lng: -121.8863, count: 30 },
  { id: 'loc11', name: 'Seattle, WA', lat: 47.6062, lng: -122.3321, count: 55 },
  { id: 'loc12', name: 'Indianapolis, IN', lat: 39.7684, lng: -86.1581, count: 22 },
  { id: 'loc13', name: 'Denver, CO', lat: 39.7392, lng: -104.9903, count: 29 },
  { id: 'loc14', name: 'Miami, FL', lat: 25.7617, lng: -80.1918, count: 48 },
  { id: 'loc15', name: 'Atlanta, GA', lat: 33.7490, lng: -84.3880, count: 37 },
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

// Calculate the initial total sales count from the mock data.
const initialTotalSales = allRegistrationLocations.reduce((sum, loc) => sum + loc.count, 0);

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [analytics, setAnalytics] = useState({
      totalPromotions: 0,
      activePromotions: 0,
      totalViews: 0,
      totalLikes: 0
  });
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [filteredChartData, setFilteredChartData] = useState({ qrCodeComparisonData, salesForecastData });
  const [filteredLocations, setFilteredLocations] = useState(allRegistrationLocations);
  const [liveSalesCount, setLiveSalesCount] = useState(initialTotalSales); // Initial sales count for today
  const [selectedMarker, setSelectedMarker] = useState(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyAzCNCNbdAejKSgQrUgkshTJ_gapr6aioc', // Replace with your actual API key
  });

  useEffect(() => {
      if (user && user.vendorId) {
          VendorService.getVendor(user.vendorId)
              .then(res => setVendor(res.data))
              .catch(err => console.error("Failed to fetch vendor", err));
          VendorService.getVendorAnalytics(user.vendorId)
              .then(res => setAnalytics(res.data))
              .catch(err => console.error("Failed to fetch analytics", err));
          VendorService.getVendorProducts(user.vendorId)
              .then(res => setProducts(res.data))
              .catch(err => console.error("Failed to fetch products", err));
      }
  }, [user]);

  useEffect(() => {
    const product = products.find(p => `${p.name} (${p.id})` === selectedProduct);

    if (product) {
      // Simulate fetching filtered data for the selected product
      // In a real app, you would make an API call with product.id
      const newQrData = { ...qrCodeComparisonData, datasets: qrCodeComparisonData.datasets.map(ds => ({ ...ds, data: ds.data.map(d => d ? Math.floor(d * 0.4) + 10 : null) })) };
      const newSalesData = { ...salesForecastData, datasets: salesForecastData.datasets.map(ds => ({ ...ds, data: ds.data.map(d => d ? Math.floor(d * 0.4) + 10 : null) })) };
      setFilteredChartData({ qrCodeComparisonData: newQrData, salesForecastData: newSalesData });

      // Simulate filtering locations by product ID.
      // For this mock, we'll show the first 7 locations for P01, and the next 8 for others.
      const locationSlice = product.id === 'P01' ? allRegistrationLocations.slice(0, 7) : allRegistrationLocations.slice(7);
      const productFilteredLocations = locationSlice.map(loc => ({
        ...loc,
        // Simulate different counts for a product filter
        count: Math.floor(loc.count * 0.4) + 5,
      }));

      setFilteredLocations(productFilteredLocations);
      // Update the global count to reflect the filtered locations
      setLiveSalesCount(productFilteredLocations.reduce((sum, loc) => sum + loc.count, 0));
    } else {
      // Reset to all data when filter is cleared
      setFilteredChartData({ qrCodeComparisonData, salesForecastData });
      setFilteredLocations(allRegistrationLocations);
      setLiveSalesCount(initialTotalSales);
    }
  }, [selectedProduct, products]);

  useEffect(() => {
    // Simulate live sales data coming in for each location
    const interval = setInterval(() => {
      setFilteredLocations(currentLocations => {
        let totalSales = 0;
        const newLocations = currentLocations.map(loc => {
          const newCount = loc.count + Math.floor(Math.random() * 2) + 1; // Increment by 1 or 2
          totalSales += newCount;
          return { ...loc, count: newCount };
        });
        setLiveSalesCount(totalSales); // Update the total count
        return newLocations; // Return the new locations array
      });
    }, 3000); // Update every 3 seconds

    // Cleanup interval on component unmount or when product filter changes
    return () => clearInterval(interval);
  }, []); // Rerun simulation if the product filter changes

  return (
    <div className="container-fluid">
      {/* The 'sticky-top' class makes this header stay at the top during scroll. 
          'py-3' adds padding, and 'bg-light' ensures content doesn't show through. */}
      <div className="d-flex justify-content-between align-items-center mb-4 sticky-top bg-light py-3" style={{ zIndex: 1020 }}>
        <h4 className="mb-0">{vendor ? `${vendor.name} - ` : ''}Sales & Engagement Analytics</h4>
        <div className="d-flex align-items-center" style={{ minWidth: '300px' }}>
          <label htmlFor="product-search" className="form-label me-2 mb-0">Product:</label>
          <select
            className="form-control"
            id="product-search"
            onChange={(e) => setSelectedProduct(e.target.value)}
            value={selectedProduct}
          >
            <option value="">All Products</option>
            {products.map(p => (
              <option key={p.id} value={`${p.name} (${p.id})`}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Real Data Summary Row */}
      <div className="row mb-4">
          <div className="col-md-3">
              <div className="card text-white bg-primary h-100 shadow-sm">
                  <div className="card-body d-flex flex-column justify-content-between">
                      <h6 className="card-title"><i className="bi bi-tags-fill me-2"></i>Total Promotions</h6>
                      <p className="display-6 fw-bold mb-0">{analytics.totalPromotions}</p>
                  </div>
              </div>
          </div>
          <div className="col-md-3">
              <div className="card text-white bg-success h-100 shadow-sm">
                  <div className="card-body d-flex flex-column justify-content-between">
                      <h6 className="card-title"><i className="bi bi-check-circle-fill me-2"></i>Active</h6>
                      <p className="display-6 fw-bold mb-0">{analytics.activePromotions}</p>
                  </div>
              </div>
          </div>
          <div className="col-md-3">
              <div className="card text-white bg-info h-100 shadow-sm">
                  <div className="card-body d-flex flex-column justify-content-between">
                      <h6 className="card-title"><i className="bi bi-eye-fill me-2"></i>Total Views</h6>
                      <p className="display-6 fw-bold mb-0">{analytics.totalViews}</p>
                  </div>
              </div>
          </div>
          <div className="col-md-3">
              <div className="card text-white bg-warning h-100 shadow-sm">
                  <div className="card-body d-flex flex-column justify-content-between">
                      <h6 className="card-title"><i className="bi bi-heart-fill me-2"></i>Total Likes</h6>
                      <p className="display-6 fw-bold mb-0">{analytics.totalLikes}</p>
                  </div>
              </div>
          </div>
      </div>

      {/* KPI and Map Row */}
      <div className="row">
        <div className="col-md-8 mb-4">
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
                  options={{ clickableIcons: false }}
                >
                  {filteredLocations.map(loc => (
                    <Marker
                      key={loc.id}
                      position={{ lat: loc.lat, lng: loc.lng }}
                      onClick={() => setSelectedMarker(loc)}
                    />
                  ))}

                </GoogleMap>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <h6 className="card-title text-muted">GLOBAL LIVE COUNT</h6>
              <p className="card-text fs-2 fw-bold text-success mb-0">{liveSalesCount.toLocaleString()}</p>
              <small className="text-muted">Total units registered</small>
              <hr />
              <h6 className="card-title text-muted mt-3">SELECTED LOCATION</h6>
              {selectedMarker ? (
                <>
                  <p className="card-text fs-4 fw-bold text-primary mb-0">{selectedMarker.count.toLocaleString()}</p>
                  <small className="text-muted">{selectedMarker.name}</small>
                </>
              ) : (
                <p className="card-text text-muted fst-italic mt-3">Click a map marker to see its count</p>
              )}
            </div>
          </div>
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

    </div>
  );
};

export default AnalyticsDashboard;