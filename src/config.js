// src/config.js
let API_BASE_URL;

if (process.env.NODE_ENV === 'production') {
  // For cloud builds, this variable is baked in.
  API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
} else {
  // For local development, point directly to the backend server.
  // This requires the backend to have CORS configured to allow requests from localhost:3000.
  API_BASE_URL = "http://localhost:8080";
}

export default API_BASE_URL;
