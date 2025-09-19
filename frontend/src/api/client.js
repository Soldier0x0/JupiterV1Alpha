// API Client for JupiterEmerge SIEM
class APIClient {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('JWT');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('JWT', token);
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    localStorage.removeItem('JWT');
  }

  // Get headers for API requests
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle authentication errors
      if (response.status === 401) {
        this.clearToken();
        window.location.href = '/login';
        throw new Error('Authentication required');
      }

      // Handle other HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Parse JSON response
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

// Create and export API client instance
const apiClient = new APIClient();

export default apiClient;