import axios from 'axios';
import { CONFIG } from '../config/config';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: CONFIG.REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

/**
 * Fetch data from a specific zone endpoint
 * @param {string} endpoint - The API endpoint for the zone
 * @returns {Promise<Object|null>} Zone data or null if error
 */
export const fetchZoneData = async (endpoint) => {
  try {
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    // Don't throw error for individual zones, just return null
    // This allows other zones to continue working
    console.warn(`Failed to fetch data from ${endpoint}:`, error.message);
    return null;
  }
};

/**
 * Fetch data from all zones
 * @returns {Promise<Object>} Object with zone names as keys and data as values
 */
export const fetchAllZonesData = async () => {
  const promises = CONFIG.ZONES.map(async (zone) => {
    const data = await fetchZoneData(zone.endpoint);
    return { [zone.name]: data };
  });

  try {
    const results = await Promise.all(promises);
    return results.reduce((acc, result) => ({ ...acc, ...result }), {});
  } catch (error) {
    console.error('Error fetching all zones data:', error);
    return {};
  }
};

/**
 * Fetch system status from the API
 * @returns {Promise<Object|null>} Status data or null if error
 */
export const fetchSystemStatus = async () => {
  try {
    const response = await apiClient.get('/api/v1/status');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch system status:', error);
    return null;
  }
};

/**
 * Format timestamp to human-readable string
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted date string
 */
export const formatTimestamp = (timestamp) => {
  try {
    if (!timestamp) return 'No timestamp';
    const date = new Date(timestamp * 1000); // Convert to milliseconds
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Invalid timestamp';
  }
};

/**
 * Calculate system summary from all zones data
 * @param {Object} allData - Object with zone data
 * @returns {Object} Summary statistics
 */
export const calculateSystemSummary = (allData) => {
  const zones = Object.values(allData).filter(data => data !== null);
  const onlineZones = zones.length;
  const totalZones = CONFIG.ZONES.length;

  if (onlineZones === 0) {
    return {
      onlineZones,
      totalZones,
      totalCurrent: 0,
      averageVoltage: 0,
      totalPower: 0,
      status: 'offline'
    };
  }

  const totalCurrent = zones.reduce((sum, data) => sum + (data.current_mA || 0), 0);
  const totalPower = zones.reduce((sum, data) => sum + (data.power_mW || 0), 0);
  
  const voltages = zones.map(data => data.voltage_V || 0).filter(v => v > 0);
  const averageVoltage = voltages.length > 0 
    ? voltages.reduce((sum, v) => sum + v, 0) / voltages.length 
    : 0;

  const status = onlineZones === totalZones ? 'online' : 'partial';

  return {
    onlineZones,
    totalZones,
    totalCurrent,
    averageVoltage,
    totalPower,
    status
  };
};

export default {
  fetchZoneData,
  fetchAllZonesData,
  fetchSystemStatus,
  formatTimestamp,
  calculateSystemSummary
};
