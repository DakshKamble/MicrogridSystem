import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Divider,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Alert,
  Snackbar
} from '@mui/material';
import {
  ElectricBolt as ElectricBoltIcon
} from '@mui/icons-material';

// Import components
import ZoneCard from './components/ZoneCard';
import SystemSummary from './components/SystemSummary';
import TroubleshootingPanel from './components/TroubleshootingPanel';
import RefreshIndicator from './components/RefreshIndicator';

// Import services and config
import { fetchAllZonesData, calculateSystemSummary } from './services/apiService';
import { CONFIG } from './config/config';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1f77b4',
    },
    secondary: {
      main: '#ff7f0e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
  },
});

/**
 * Main App component - Microgrid Node 1 Multi-Zone Dashboard
 * Replicates all functionality from the Streamlit dashboard
 */
function App() {
  // State management
  const [allData, setAllData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);

  // Calculate system summary
  const summary = calculateSystemSummary(allData);

  /**
   * Fetch data from all zones
   */
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchAllZonesData();
      setAllData(data);
      setLastUpdate(new Date());
      
      // Log successful fetch
      const onlineCount = Object.values(data).filter(d => d !== null).length;
      console.log(`Data fetched: ${onlineCount}/${CONFIG.ZONES.length} zones online`);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch data from API. Please check if the FastAPI server is running.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Set up auto-refresh interval
   */
  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up interval for auto-refresh
    const interval = setInterval(fetchData, CONFIG.REFRESH_INTERVAL);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [fetchData]);

  /**
   * Handle error snackbar close
   */
  const handleErrorClose = () => {
    setError(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="dashboard-container">
        <Container maxWidth="xl">
          {/* Dashboard Header */}
          <Box textAlign="center" mb={4}>
            <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
              <ElectricBoltIcon sx={{ fontSize: 40, color: '#1f77b4', mr: 1 }} />
              <Typography 
                variant="h4" 
                component="h1"
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #1f77b4 30%, #ff7f0e 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Microgrid Node 1 Multi-Zone Dashboard
              </Typography>
            </Box>
            <Typography 
              variant="h6" 
              color="textSecondary"
              sx={{ fontWeight: 500 }}
            >
              Real-time sensor data from all 3 zones
            </Typography>
          </Box>

          {/* System Summary */}
          <SystemSummary summary={summary} />

          <Divider sx={{ my: 4 }} />

          {/* Zone Cards */}
          <Box mb={4}>
            {CONFIG.ZONES.map((zoneConfig, index) => {
              const zoneName = zoneConfig.name;
              const zoneData = allData[zoneName];
              
              return (
                <ZoneCard
                  key={zoneConfig.id}
                  zoneName={zoneName}
                  data={zoneData}
                  zoneConfig={zoneConfig}
                />
              );
            })}
          </Box>

          {/* Troubleshooting Panel */}
          <TroubleshootingPanel summary={summary} allData={allData} />

          {/* Footer Information */}
          <Box mt={4} mb={2} textAlign="center">
            <Typography variant="body2" color="textSecondary">
              Dashboard refreshes every {CONFIG.REFRESH_INTERVAL / 1000} seconds
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Built with React • FastAPI Backend • MQTT Integration
            </Typography>
          </Box>
        </Container>

        {/* Refresh Indicator */}
        <RefreshIndicator isLoading={isLoading} lastUpdate={lastUpdate} />

        {/* Error Snackbar */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleErrorClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleErrorClose} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </div>
    </ThemeProvider>
  );
}

export default App;
