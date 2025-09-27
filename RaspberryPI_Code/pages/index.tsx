import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/Dashboard.module.css';

interface SensorData {
  node_id: string;
  zone_id: string;
  timestamp: number;
  current_mA: number;
  voltage_V: number;
  power_mW: number;
  received_at?: string;
}

interface ApiResponse extends SensorData {
  received_at: string;
}

export default function Dashboard() {
  const [data, setData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // API endpoint - adjust the IP address to match your Raspberry Pi
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const API_ENDPOINT = `${API_BASE_URL}/api/v1/node1/zone1`;

  const fetchData = async () => {
    try {
      setError(null);
      const response = await fetch(API_ENDPOINT);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No data available yet. Make sure MQTT messages are being sent.');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result: ApiResponse = await response.json();
      setData(result);
      setLastUpdate(new Date().toLocaleTimeString());
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setLoading(false);
    }
  };

  // Auto-refresh every 5 seconds
  useEffect(() => {
    fetchData(); // Initial fetch
    
    const interval = setInterval(fetchData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setLoading(true);
    fetchData();
  };

  const formatTimestamp = (timestamp: number): string => {
    // Convert timestamp to readable format
    // Assuming timestamp is in seconds or milliseconds
    const date = new Date(timestamp > 1e10 ? timestamp : timestamp * 1000);
    return date.toLocaleString();
  };

  return (
    <>
      <Head>
        <title>Microgrid Dashboard</title>
        <meta name="description" content="Real-time microgrid sensor data dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>🔋 Microgrid Dashboard</h1>
          <p className={styles.subtitle}>Real-time sensor data monitoring</p>
        </header>

        <div className={styles.controls}>
          <button 
            onClick={handleManualRefresh} 
            className={styles.refreshButton}
            disabled={loading}
          >
            {loading ? '🔄 Loading...' : '🔄 Refresh'}
          </button>
          {lastUpdate && (
            <span className={styles.lastUpdate}>
              Last updated: {lastUpdate}
            </span>
          )}
        </div>

        <main className={styles.main}>
          {loading && !data && (
            <div className={styles.loadingCard}>
              <div className={styles.spinner}></div>
              <p>Loading sensor data...</p>
            </div>
          )}

          {error && (
            <div className={styles.errorCard}>
              <h3>⚠️ Connection Error</h3>
              <p>{error}</p>
              <div className={styles.troubleshooting}>
                <h4>Troubleshooting:</h4>
                <ul>
                  <li>Ensure FastAPI server is running on port 8000</li>
                  <li>Check if MQTT messages are being published</li>
                  <li>Verify network connectivity to Raspberry Pi</li>
                </ul>
              </div>
            </div>
          )}

          {data && !error && (
            <div className={styles.dataContainer}>
              {/* Card Layout */}
              <div className={styles.cardGrid}>
                <div className={styles.card}>
                  <h3>📡 Node Information</h3>
                  <div className={styles.cardContent}>
                    <div className={styles.dataRow}>
                      <span className={styles.label}>Node ID:</span>
                      <span className={styles.value}>{data.node_id}</span>
                    </div>
                    <div className={styles.dataRow}>
                      <span className={styles.label}>Zone ID:</span>
                      <span className={styles.value}>{data.zone_id}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.card}>
                  <h3>⚡ Electrical Measurements</h3>
                  <div className={styles.cardContent}>
                    <div className={styles.dataRow}>
                      <span className={styles.label}>Current:</span>
                      <span className={styles.value}>{data.current_mA} mA</span>
                    </div>
                    <div className={styles.dataRow}>
                      <span className={styles.label}>Voltage:</span>
                      <span className={styles.value}>{data.voltage_V} V</span>
                    </div>
                    <div className={styles.dataRow}>
                      <span className={styles.label}>Power:</span>
                      <span className={styles.value}>{data.power_mW} mW</span>
                    </div>
                  </div>
                </div>

                <div className={styles.card}>
                  <h3>🕒 Timing Information</h3>
                  <div className={styles.cardContent}>
                    <div className={styles.dataRow}>
                      <span className={styles.label}>Timestamp:</span>
                      <span className={styles.value}>{formatTimestamp(data.timestamp)}</span>
                    </div>
                    {data.received_at && (
                      <div className={styles.dataRow}>
                        <span className={styles.label}>Received:</span>
                        <span className={styles.value}>
                          {new Date(data.received_at).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Table Layout */}
              <div className={styles.tableContainer}>
                <h3>📊 Data Summary</h3>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Value</th>
                      <th>Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Node ID</td>
                      <td>{data.node_id}</td>
                      <td>-</td>
                    </tr>
                    <tr>
                      <td>Zone ID</td>
                      <td>{data.zone_id}</td>
                      <td>-</td>
                    </tr>
                    <tr>
                      <td>Current</td>
                      <td>{data.current_mA}</td>
                      <td>mA</td>
                    </tr>
                    <tr>
                      <td>Voltage</td>
                      <td>{data.voltage_V}</td>
                      <td>V</td>
                    </tr>
                    <tr>
                      <td>Power</td>
                      <td>{data.power_mW}</td>
                      <td>mW</td>
                    </tr>
                    <tr>
                      <td>Timestamp</td>
                      <td>{formatTimestamp(data.timestamp)}</td>
                      <td>-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        <footer className={styles.footer}>
          <p>
            Connected to: <code>{API_ENDPOINT}</code>
          </p>
          <p>Auto-refresh: Every 5 seconds</p>
        </footer>
      </div>
    </>
  );
}
