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

// Fetch data from FastAPI server for a specific zone
const fetchZoneData = async (zoneId: number): Promise<MQTTServerResponse | null> => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/node1/zone${zoneId}`);
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`No data available for zone ${zoneId} from MQTT server yet`);
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching zone ${zoneId} data:`, error);
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
      },
      2: {
        current: 0,
        voltage: 0,
        power: 0,
        history: []
      },
      3: {
        current: 0,
        voltage: 0,
        power: 0,
        history: []
      }
    },
    status: {
      1: false, // Start as offline until we get data
      2: false,
      3: false
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
        
        // Fetch data for all zones
        const zonePromises = [1, 2, 3].map(zoneId => fetchZoneData(zoneId));
        const zoneResponses = await Promise.all(zonePromises);
        
        if (isActive) {
          setData(prevData => {
            const newData = { ...prevData };
            let hasAnyUpdate = false;
            let latestUpdateTime = prevData.lastUpdate;
            
            // Process each zone
            [1, 2, 3].forEach((zoneId, index) => {
              const zoneResponse = zoneResponses[index];
              
              if (zoneResponse) {
                const newDataPoint = convertMQTTResponse(zoneResponse);
                const dataIsStale = isDataStale(zoneResponse.received_at);
                
                // Update zone data
                newData.zones[zoneId] = {
                  ...newDataPoint,
                  history: [
                    ...prevData.zones[zoneId].history.slice(-14), // Keep last 14 points
                    newDataPoint // Add newest
                  ]
                };
                
                // Zone is online if we got fresh data and it's not stale
                newData.status[zoneId] = serverStatus.isOnline && !dataIsStale;
                
                // Track latest update time
                const updateTime = new Date(zoneResponse.received_at);
                if (updateTime > latestUpdateTime) {
                  latestUpdateTime = updateTime;
                }
                hasAnyUpdate = true;
              } else {
                // No data for this zone
                newData.status[zoneId] = false;
              }
            });
            
            newData.isConnected = serverStatus.isOnline;
            if (hasAnyUpdate) {
              newData.lastUpdate = latestUpdateTime;
            }
            
            return newData;
          });
        }
      } catch (error) {
        console.error('Error updating data:', error);
        if (isActive) {
          setData(prevData => ({
            ...prevData,
            status: { 1: false, 2: false, 3: false }, // All zones offline
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

  // Calculate aggregate statistics for all zones
  const zones = [data.zones[1], data.zones[2], data.zones[3]];
  const totalPower = zones.reduce((sum, zone) => sum + zone.power, 0);
  const averageVoltage = zones.reduce((sum, zone) => sum + zone.voltage, 0) / zones.length;
  
  // Find highest load zone
  let highestLoadZone = 1;
  let highestPower = data.zones[1].power;
  for (let i = 2; i <= 3; i++) {
    if (data.zones[i].power > highestPower) {
      highestPower = data.zones[i].power;
      highestLoadZone = i;
    }
  }

  const hasAlerts = !data.status[1] || !data.status[2] || !data.status[3] || !data.isConnected;

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