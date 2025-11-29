// src/config.js
// With an Ingress, the frontend can use a relative path for all API calls.
// The browser resolves this against the current host, and the Ingress routes it.

//const API_BASE_URL = "/api";
const API_BASE_URL = "http://localhost:8080/api";

export default API_BASE_URL;
