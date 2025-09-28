// Configuration for the Microgrid Dashboard
export const CONFIG = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  
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
