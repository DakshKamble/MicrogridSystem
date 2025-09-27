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
  // Individual zone data states
  const [sensorData, setSensorData] = useState<SensorData | null>(null) // Zone 1 (existing)
  const [zone2Data, setZone2Data] = useState<SensorData | null>(null)
  const [zone3Data, setZone3Data] = useState<SensorData | null>(null)
  
  // Total power calculation state - Sum of power_mW from all three zones
  const [totalPower, setTotalPower] = useState<number>(0)
  
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isOnline, setIsOnline] = useState<boolean>(false)
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('http://localhost:8000')

  // Function to fetch data from all three zones and calculate total power
  const fetchData = async () => {
    try {
      setError(null)
      
      // Fetch data from all three zones simultaneously using Promise.all
      const [zone1Response, zone2Response, zone3Response] = await Promise.all([
        fetch(`${apiBaseUrl}/api/v1/node1/zone1`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000)
        }),
        fetch(`${apiBaseUrl}/api/v1/node1/zone2`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000)
        }),
        fetch(`${apiBaseUrl}/api/v1/node1/zone3`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000)
        })
      ])

      // Check if all responses are OK
      if (!zone1Response.ok || !zone2Response.ok || !zone3Response.ok) {
        const failedZones = []
        if (!zone1Response.ok) failedZones.push('Zone 1')
        if (!zone2Response.ok) failedZones.push('Zone 2')
        if (!zone3Response.ok) failedZones.push('Zone 3')
        throw new Error(`HTTP error in ${failedZones.join(', ')}`)
      }

      // Parse JSON data from all zones
      const [zone1Data, zone2Data, zone3Data] = await Promise.all([
        zone1Response.json(),
        zone2Response.json(),
        zone3Response.json()
      ])

      // Update individual zone states
      setSensorData(zone1Data) // Zone 1 (maintaining existing variable name)
      setZone2Data(zone2Data)
      setZone3Data(zone3Data)

      // Calculate total power - Sum of power_mW from all three zones
      const calculatedTotalPower = (zone1Data.power_mW || 0) + (zone2Data.power_mW || 0) + (zone3Data.power_mW || 0)
      setTotalPower(calculatedTotalPower)

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
            Real-time sensor monitoring for Node 1, All Zones
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

        {/* Total Power Section - Displayed prominently at the top */}
        {/* This section shows the sum of power draw from all three zones */}
        {(sensorData || zone2Data || zone3Data) && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg p-6 text-white">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                  Total Power Consumption
                </h2>
                <div className="text-4xl sm:text-6xl font-extrabold mb-2">
                  {totalPower.toFixed(1)} <span className="text-2xl sm:text-3xl font-semibold">mW</span>
                </div>
                <p className="text-orange-100 text-sm sm:text-base">
                  Combined power draw from all zones • Updates every 5 seconds
                </p>
                
                {/* Individual zone breakdown - responsive layout */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white bg-opacity-20 rounded-lg p-3">
                    <div className="text-sm font-medium text-orange-100">Zone 1</div>
                    <div className="text-xl font-bold">
                      {sensorData ? `${sensorData.power_mW} mW` : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-3">
                    <div className="text-sm font-medium text-orange-100">Zone 2</div>
                    <div className="text-xl font-bold">
                      {zone2Data ? `${zone2Data.power_mW} mW` : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-3">
                    <div className="text-sm font-medium text-orange-100">Zone 3</div>
                    <div className="text-xl font-bold">
                      {zone3Data ? `${zone3Data.power_mW} mW` : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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

        {/* Individual Zone Data Display - Shows detailed data for all three zones */}
        {(sensorData || zone2Data || zone3Data) && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Mobile Card Layout */}
            <div className="sm:hidden">
              <div className="p-6 space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Individual Zone Data</h2>
                  <p className="text-sm text-gray-500">Detailed sensor readings per zone</p>
                </div>
                
                {/* Zone 1 Mobile Cards */}
                {sensorData && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-l-4 border-blue-500 pl-3">Zone 1</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-blue-600 font-medium">Current</div>
                        <div className="text-xl font-bold text-blue-900">{sensorData.current_mA} mA</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm text-green-600 font-medium">Voltage</div>
                        <div className="text-xl font-bold text-green-900">{sensorData.voltage_V} V</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-sm text-purple-600 font-medium">Power</div>
                        <div className="text-xl font-bold text-purple-900">{sensorData.power_mW} mW</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 font-medium">Timestamp</div>
                        <div className="text-sm font-bold text-gray-900">{formatTimestamp(sensorData.timestamp)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Zone 2 Mobile Cards */}
                {zone2Data && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-l-4 border-orange-500 pl-3">Zone 2</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-blue-600 font-medium">Current</div>
                        <div className="text-xl font-bold text-blue-900">{zone2Data.current_mA} mA</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm text-green-600 font-medium">Voltage</div>
                        <div className="text-xl font-bold text-green-900">{zone2Data.voltage_V} V</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-sm text-purple-600 font-medium">Power</div>
                        <div className="text-xl font-bold text-purple-900">{zone2Data.power_mW} mW</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 font-medium">Timestamp</div>
                        <div className="text-sm font-bold text-gray-900">{formatTimestamp(zone2Data.timestamp)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Zone 3 Mobile Cards */}
                {zone3Data && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-l-4 border-teal-500 pl-3">Zone 3</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-blue-600 font-medium">Current</div>
                        <div className="text-xl font-bold text-blue-900">{zone3Data.current_mA} mA</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm text-green-600 font-medium">Voltage</div>
                        <div className="text-xl font-bold text-green-900">{zone3Data.voltage_V} V</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-sm text-purple-600 font-medium">Power</div>
                        <div className="text-xl font-bold text-purple-900">{zone3Data.power_mW} mW</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 font-medium">Timestamp</div>
                        <div className="text-sm font-bold text-gray-900">{formatTimestamp(zone3Data.timestamp)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Table Layout - Shows all zones in a table */}
            <div className="hidden sm:block">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Individual Zone Sensor Data</h2>
                <p className="text-sm text-gray-500 mt-1">Detailed readings from all zones</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Zone
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
                        Last Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Zone 1 Row */}
                    {sensorData && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                            <span className="text-sm font-medium text-gray-900">Zone 1</span>
                          </div>
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
                    )}
                    
                    {/* Zone 2 Row */}
                    {zone2Data && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                            <span className="text-sm font-medium text-gray-900">Zone 2</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {zone2Data.current_mA}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            {zone2Data.voltage_V}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                            {zone2Data.power_mW}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTimestamp(zone2Data.timestamp)}
                        </td>
                      </tr>
                    )}
                    
                    {/* Zone 3 Row */}
                    {zone3Data && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-teal-500 rounded-full mr-3"></div>
                            <span className="text-sm font-medium text-gray-900">Zone 3</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {zone3Data.current_mA}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            {zone3Data.voltage_V}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                            {zone3Data.power_mW}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTimestamp(zone3Data.timestamp)}
                        </td>
                      </tr>
                    )}
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
