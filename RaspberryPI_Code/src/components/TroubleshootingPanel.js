import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Divider
} from '@mui/material';
import {
  Build as BuildIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { ZONE_ENDPOINTS } from '../config/config';

/**
 * TroubleshootingPanel component for displaying help when zones are offline
 * Replicates the troubleshooting section from Streamlit
 */
const TroubleshootingPanel = ({ summary, allData }) => {
  const offlineZones = summary.totalZones - summary.onlineZones;
  
  if (offlineZones === 0) {
    return null; // Don't show if all zones are online
  }

  const troubleshootingSteps = [
    'FastAPI server is running on port 8000',
    'MQTT broker is running and accessible', 
    'NodeMCU is powered on and connected to WiFi',
    'All INA219 sensors are properly connected',
    'Check NodeMCU serial output for error messages'
  ];

  return (
    <Card sx={{ mt: 3, border: '1px solid #ffcc02', backgroundColor: '#fffbf0' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <BuildIcon sx={{ color: '#ef6c00', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#ef6c00' }}>
            Troubleshooting
          </Typography>
        </Box>

        <Alert 
          severity="warning" 
          sx={{ mb: 2, backgroundColor: '#fff3e0' }}
          icon={<WarningIcon />}
        >
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {offlineZones === summary.totalZones 
              ? 'All zones are offline' 
              : `${offlineZones} zone${offlineZones > 1 ? 's are' : ' is'} offline`
            }. Please check:
          </Typography>
        </Alert>

        <List dense>
          {troubleshootingSteps.map((step, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <ErrorIcon sx={{ color: '#f44336', fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText 
                primary={step}
                primaryTypographyProps={{ 
                  fontSize: '0.875rem',
                  color: '#333'
                }}
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* API Endpoints Status */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#333' }}>
          API Endpoints Status:
        </Typography>
        
        <List dense>
          {Object.entries(ZONE_ENDPOINTS).map(([zoneName, endpoint]) => {
            const isOnline = allData[zoneName] !== null;
            return (
              <ListItem key={zoneName} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {isOnline ? (
                    <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                  ) : (
                    <ErrorIcon sx={{ color: '#f44336', fontSize: 20 }} />
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Box component="span">
                      <Typography component="span" sx={{ fontWeight: 500 }}>
                        {zoneName}:
                      </Typography>
                      <Typography 
                        component="span" 
                        sx={{ 
                          ml: 1, 
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                          color: '#666',
                          backgroundColor: '#f5f5f5',
                          padding: '2px 6px',
                          borderRadius: 1
                        }}
                      >
                        {endpoint}
                      </Typography>
                    </Box>
                  }
                  primaryTypographyProps={{ 
                    fontSize: '0.875rem'
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
};

export default TroubleshootingPanel;
