import { useState, useEffect } from "react";

export interface EnergyDataPoint {
  timestamp: Date;
  current: number;
  voltage: number;
  power: number;
}

export interface ZoneData {
  current: number;
  voltage: number;
  power: number;
  history: EnergyDataPoint[];
}

export interface MicrogridData {
  zones: {
    [key: number]: ZoneData;
  };
  status: {
    [key: number]: boolean;
  };
  lastUpdate: Date;
  lastDataReceived: Date | null;
  isConnected: boolean;
}

// Interface matching the MQTT FastAPI server response
export interface MQTTServerResponse {
  node_id: string;
  zone_id: string;
  timestamp: string;
  current_mA: number;
  voltage_V: number;
  power_mW: number;
  received_at: string;
}

// API configuration - will work both in development and production
const getApiBaseUrl = () => {
  // In development, use the proxy configured in vite.config.ts
  // In production, use the current host (RPi IP)
  if (import.meta.env.DEV) {
    return '/api/v1';
  }
  // In production, the frontend and backend run on the same RPi
  return `${window.location.protocol}//${window.location.hostname}:8000/api/v1`;
};

// Convert MQTT server response to our internal format
const convertMQTTResponse = (response: MQTTServerResponse): EnergyDataPoint => ({
  timestamp: new Date(response.timestamp),
  current: response.current_mA,
  voltage: response.voltage_V,
  power: response.power_mW
});

// Fetch data from FastAPI server
const fetchZoneData = async (): Promise<MQTTServerResponse | null> => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/node1/zone1`);
    if (!response.ok) {
      if (response.status === 404) {
        console.warn('No data available from MQTT server yet');
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching zone data:', error);
    return null;
  }
};

// Check server status
const checkServerStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/status`);
    return response.ok;
  } catch (error) {
    console.error('Error checking server status:', error);
    return false;
  }
};

// Configuration constants
const DATA_TIMEOUT_MS = 15000; // 15 seconds - consider offline if no data received
const POLL_INTERVAL_MS = 3000; // 3 seconds - how often to check for new data

export function useEnergyData() {
  const [data, setData] = useState<MicrogridData>(() => ({
    zones: {
      1: {
        current: 0,
        voltage: 0,
        power: 0,
        history: []
      }
    },
    status: {
      1: false // Start as offline until we get data
    },
    lastUpdate: new Date(),
    lastDataReceived: null,
    isConnected: false
  }));

  useEffect(() => {
    let isActive = true;

    // Function to check if data is stale (timeout detection)
    const checkDataTimeout = (lastDataReceived: Date | null): boolean => {
      if (!lastDataReceived) return true; // No data received yet
      const now = new Date();
      const timeSinceLastData = now.getTime() - lastDataReceived.getTime();
      return timeSinceLastData > DATA_TIMEOUT_MS;
    };

    // Function to fetch and update data
    const updateData = async () => {
      if (!isActive) return;

      try {
        // Check server status
        const serverOnline = await checkServerStatus();
        
        // Fetch zone data
        const zoneResponse = await fetchZoneData();
        
        if (zoneResponse && isActive) {
          const newDataPoint = convertMQTTResponse(zoneResponse);
          const dataReceivedAt = new Date(zoneResponse.received_at);
          
          setData(prevData => {
            const newData = { ...prevData };
            
            // Update Zone 1 with real data
            newData.zones[1] = {
              ...newDataPoint,
              history: [
                ...prevData.zones[1].history.slice(-14), // Keep last 14 points
                newDataPoint // Add newest
              ]
            };
            
            newData.status[1] = true; // Zone is online if we got fresh data
            newData.lastUpdate = new Date();
            newData.lastDataReceived = dataReceivedAt;
            newData.isConnected = serverOnline;
            
            return newData;
          });
        } else if (isActive) {
          // No new data available - check if existing data is stale
          setData(prevData => {
            const isDataStale = checkDataTimeout(prevData.lastDataReceived);
            
            return {
              ...prevData,
              status: { 1: !isDataStale }, // Only online if data isn't stale
              lastUpdate: new Date(),
              isConnected: serverOnline
            };
          });
        }
      } catch (error) {
        console.error('Error updating data:', error);
        if (isActive) {
          setData(prevData => ({
            ...prevData,
            status: { 1: false },
            lastUpdate: new Date(),
            isConnected: false
          }));
        }
      }
    };

    // Function to periodically check for stale data (even without new requests)
    const checkStaleData = () => {
      if (!isActive) return;
      
      setData(prevData => {
        const isDataStale = checkDataTimeout(prevData.lastDataReceived);
        
        // Only update if status needs to change
        if (prevData.status[1] && isDataStale) {
          console.warn('ESP32 data timeout detected - marking as offline');
          return {
            ...prevData,
            status: { 1: false },
            lastUpdate: new Date()
          };
        }
        
        return prevData;
      });
    };

    // Initial fetch
    updateData();

    // Set up interval for real-time updates
    const updateInterval = setInterval(updateData, POLL_INTERVAL_MS);
    
    // Set up interval for timeout checks (more frequent to be responsive)
    const timeoutCheckInterval = setInterval(checkStaleData, 2000);

    return () => {
      isActive = false;
      clearInterval(updateInterval);
      clearInterval(timeoutCheckInterval);
    };
  }, []);

  // Calculate aggregate statistics (only for Zone 1 now)
  const zone1Data = data.zones[1];
  const totalPower = zone1Data.power;
  const averageVoltage = zone1Data.voltage;
  const highestLoadZone = 1; // Only one zone

  const hasAlerts = !data.status[1] || !data.isConnected;

  return {
    data,
    aggregateStats: {
      totalPower,
      averageVoltage,
      highestLoadZone
    },
    hasAlerts
  };
}