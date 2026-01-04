import API_BASE_URL from '../config';

export const apiFetch = async (endpoint, options = {}) => {
  // Construct full URL
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = { ...options.headers };
  
  // Set Content-Type to application/json unless body is FormData (which sets its own boundary)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Error ${response.status}`;
        try {
            const errorJson = JSON.parse(errorText);
            // Support common Spring Boot/Backend error fields
            errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch (e) {
            if (errorText && errorText.length < 300) errorMessage = errorText;
        }
        throw new Error(errorMessage);
    }

    // Return JSON if content-type is json, else text
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) return await response.json();
    if (response.status === 204) return null;
    return await response.text();

  } catch (error) {
    throw error;
  }
};