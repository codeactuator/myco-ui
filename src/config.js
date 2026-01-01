// src/config.js
// With an Ingress, the frontend can use a relative path for all API calls.
// The browser resolves this against the current host, and the Ingress routes it.

//const API_BASE_URL = "/api";
export const GOOGLE_MAPS_API_KEY = "AIzaSyAzCNCNbdAejKSgQrUgkshTJ_gapr6aioc";
const API_BASE_URL = "http://localhost:8081/api";

export default API_BASE_URL;
