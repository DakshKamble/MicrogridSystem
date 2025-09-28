// Configuration for the Microgrid Dashboard

// Auto-detect the correct API base URL
const getApiBaseUrl = () => {
  // If environment variable is set, use it
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // Auto-detect based on current hostname
  const hostname = window.location.hostname;
  
  // If accessing via localhost, use localhost for API
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  
  // If accessing via network IP, use the same IP for API
  return `http://${hostname}:8000`;
};

export const CONFIG = {
  // API Configuration - Auto-detects correct URL
  API_BASE_URL: getApiBaseUrl(),
  
  // Zone Configuration
  ZONES: [
    {
      id: 'zone1',
      name: 'Zone 1',
      endpoint: '/api/v1/node1/zone1',
      color: '#1f77b4'
    },
    {
      id: 'zone2', 
      name: 'Zone 2',
      endpoint: '/api/v1/node1/zone2',
      color: '#ff7f0e'
    },
    {
      id: 'zone3',
      name: 'Zone 3', 
      endpoint: '/api/v1/node1/zone3',
      color: '#2ca02c'
    }
  ],
  
  // Refresh Configuration
  REFRESH_INTERVAL: 5000, // 5 seconds in milliseconds
  
  // Request Configuration
  REQUEST_TIMEOUT: 10000, // 10 seconds
  
  // Display Configuration
  DECIMAL_PLACES: {
    current: 1,
    voltage: 3,
    power: 1
  },
  
  // Status Configuration
  STATUS_COLORS: {
    online: '#28a745',
    offline: '#dc3545',
    partial: '#ffc107'
  }
};

// Zone endpoints for easy access
export const ZONE_ENDPOINTS = CONFIG.ZONES.reduce((acc, zone) => {
  acc[zone.name] = `${CONFIG.API_BASE_URL}${zone.endpoint}`;
  return acc;
}, {});

export default CONFIG;
