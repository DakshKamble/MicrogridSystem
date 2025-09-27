'use client'

import { useState, useEffect } from 'react'

// TypeScript interface for sensor data
interface SensorData {
  node_id: string
  zone_id: string
  timestamp: number
  current_mA: number
  voltage_V: number
  power_mW: number
  received_at?: string
}

// Dynamic API configuration - Detects if accessing locally or remotely
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // If accessing via localhost or 127.0.0.1, use localhost for API
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8000'
    }
    // If accessing via IP address (from another device), use same IP for API
    return `http://${window.location.hostname}:8000`
  }
  // Fallback for server-side rendering
  return 'http://localhost:8000'
}

export default function Dashboard() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isOnline, setIsOnline] = useState<boolean>(false)
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('http://localhost:8000')

  // Function to fetch data from FastAPI backend
  const fetchData = async () => {
    try {
      setError(null)
      const response = await fetch(`${apiBaseUrl}/api/v1/node1/zone1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(5000)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: SensorData = await response.json()
      setSensorData(data)
      setLastUpdated(new Date())
      setIsOnline(true)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setIsOnline(false)
      setLoading(false)
    }
  }

  // Manual refresh function
  const handleRefresh = () => {
    setLoading(true)
    fetchData()
  }

  // Set API base URL based on current hostname
  useEffect(() => {
    setApiBaseUrl(getApiBaseUrl())
  }, [])

  // Auto-refresh effect - fetch data every 5 seconds
  useEffect(() => {
    // Only start fetching after API URL is set
    if (apiBaseUrl) {
      // Initial fetch
      fetchData()

      // Set up interval for auto-refresh
      const interval = setInterval(fetchData, 5000) // 5 seconds

      // Cleanup interval on component unmount
      return () => clearInterval(interval)
    }
  }, [apiBaseUrl])

  // Format timestamp for display
  const formatTimestamp = (timestamp: number): string => {
    try {
      // Assuming timestamp is Unix timestamp in seconds
      const date = new Date(timestamp * 1000)
      return date.toLocaleString()
    } catch {
      return timestamp.toString()
    }
  }

  // Format time for last updated
  const formatLastUpdated = (date: Date): string => {
    return date.toLocaleTimeString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Microgrid Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Real-time sensor monitoring for Node 1, Zone 1
          </p>
          
          {/* Status indicator */}
          <div className="flex items-center justify-center mt-4 space-x-2">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse-green' : 'bg-red-500'}`}></div>
            <span className={`text-sm font-medium ${isOnline ? 'text-green-700' : 'text-red-700'}`}>
              {isOnline ? 'Connected' : 'Disconnected'}
            </span>
            {lastUpdated && (
              <span className="text-gray-500 text-sm">
                • Last updated: {formatLastUpdated(lastUpdated)}
              </span>
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <svg 
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 font-medium">Connection Error</p>
            </div>
            <p className="text-red-600 mt-1 text-sm">{error}</p>
            <p className="text-red-600 mt-1 text-xs">
              Make sure the FastAPI server is running on {apiBaseUrl}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && !sensorData && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sensor data...</p>
          </div>
        )}

        {/* Main Data Display */}
        {sensorData && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Mobile Card Layout */}
            <div className="sm:hidden">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b pb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Sensor Data</h2>
                  <span className="text-sm text-gray-500">
                    {sensorData.node_id} / {sensorData.zone_id}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Current</div>
                    <div className="text-2xl font-bold text-blue-900">{sensorData.current_mA} mA</div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Voltage</div>
                    <div className="text-2xl font-bold text-green-900">{sensorData.voltage_V} V</div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Power</div>
                    <div className="text-2xl font-bold text-purple-900">{sensorData.power_mW} mW</div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium">Timestamp</div>
                    <div className="text-lg font-bold text-gray-900">{formatTimestamp(sensorData.timestamp)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden sm:block">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Real-time Sensor Data</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Node ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Zone ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current (mA)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Voltage (V)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Power (mW)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {sensorData.node_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {sensorData.zone_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {sensorData.current_mA}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {sensorData.voltage_V}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          {sensorData.power_mW}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTimestamp(sensorData.timestamp)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* API Configuration Info */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-yellow-800 font-medium text-sm">API Configuration</p>
              <p className="text-yellow-700 text-sm mt-1">
                Currently connecting to: <code className="bg-yellow-100 px-1 rounded">{apiBaseUrl}</code>
              </p>
              <p className="text-yellow-700 text-sm">
                Data refreshes automatically every 5 seconds
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
