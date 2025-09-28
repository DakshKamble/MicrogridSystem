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
  current: response.current_mA / 1000, // Convert mA to A
  voltage: response.voltage_V,
  power: response.power_mW / 1000 // Convert mW to W
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

// Check server status and get detailed information
const checkServerStatus = async (): Promise<{isOnline: boolean, lastUpdate: string | null}> => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/status`);
    if (response.ok) {
      const data = await response.json();
      return {
        isOnline: true,
        lastUpdate: data.last_update
      };
    }
    return { isOnline: false, lastUpdate: null };
  } catch (error) {
    console.error('Error checking server status:', error);
    return { isOnline: false, lastUpdate: null };
  }
};

// Check if data is stale (no updates for more than 15 seconds)
const isDataStale = (lastUpdateTime: string | null): boolean => {
  if (!lastUpdateTime) return true;
  const lastUpdate = new Date(lastUpdateTime);
  const now = new Date();
  const diffSeconds = (now.getTime() - lastUpdate.getTime()) / 1000;
  return diffSeconds > 15; // Consider stale after 15 seconds
};

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
    isConnected: false
  }));

  useEffect(() => {
    let isActive = true;

    // Function to fetch and update data
    const updateData = async () => {
      if (!isActive) return;

      try {
        // Check server status and get last update info
        const serverStatus = await checkServerStatus();
        
        // Fetch zone data
        const zoneResponse = await fetchZoneData();
        
        if (zoneResponse && isActive) {
          const newDataPoint = convertMQTTResponse(zoneResponse);
          
          // Check if the data is stale
          const dataIsStale = isDataStale(zoneResponse.received_at);
          
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
            
            // Zone is online if we got fresh data and it's not stale
            newData.status[1] = serverStatus.isOnline && !dataIsStale;
            newData.lastUpdate = new Date(zoneResponse.received_at);
            newData.isConnected = serverStatus.isOnline;
            
            return newData;
          });
        } else if (isActive) {
          // No data available from NodeMCU
          setData(prevData => ({
            ...prevData,
            status: { 1: false }, // NodeMCU is offline
            isConnected: serverStatus.isOnline // Server might still be online
          }));
        }
      } catch (error) {
        console.error('Error updating data:', error);
        if (isActive) {
          setData(prevData => ({
            ...prevData,
            status: { 1: false }, // NodeMCU is offline
            isConnected: false // Server is also offline
          }));
        }
      }
    };

    // Initial fetch
    updateData();

    // Set up interval for real-time updates every 3 seconds
    const interval = setInterval(updateData, 3000);

    return () => {
      isActive = false;
      clearInterval(interval);
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