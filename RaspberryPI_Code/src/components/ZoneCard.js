import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  Alert,
  Collapse,
  IconButton,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ElectricBolt as ElectricBoltIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import DataCard from './DataCard';
import { formatTimestamp } from '../services/apiService';
import { CONFIG } from '../config/config';

/**
 * ZoneCard component for displaying complete zone information
 * Replicates the display_zone_card function from Streamlit
 */
const ZoneCard = ({ zoneName, data, zoneConfig }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Determine zone status
  const isOnline = data !== null;
  const statusColor = isOnline ? CONFIG.STATUS_COLORS.online : CONFIG.STATUS_COLORS.offline;
  const statusIcon = isOnline ? '🟢' : '🔴';
  const statusText = isOnline ? 'Online' : 'Offline';

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card 
      className="zone-card"
      sx={{ 
        border: `2px solid ${statusColor}`,
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        background: 'white',
        overflow: 'visible'
      }}
    >
      <CardContent sx={{ padding: '24px !important' }}>
        {/* Zone Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <ElectricBoltIcon sx={{ color: zoneConfig?.color || '#1f77b4', fontSize: 28 }} />
            <Typography variant="h5" component="h3" sx={{ fontWeight: 600, color: '#333' }}>
              {zoneName}
            </Typography>
            <Chip
              label={`${statusIcon} ${statusText}`}
              className={`status-indicator ${isOnline ? 'status-online' : 'status-offline'}`}
              size="small"
              sx={{ ml: 1 }}
            />
          </Box>
          
          {data && (
            <IconButton
              onClick={handleExpandClick}
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease',
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          )}
        </Box>

        {isOnline ? (
          <>
            {/* Sensor Data Grid */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} sm={4}>
                <DataCard
                  title="Current"
                  value={data && data.current_mA !== undefined ? data.current_mA.toFixed(CONFIG.DECIMAL_PLACES.current) : '0.0'}
                  unit="mA"
                  icon="🔌"
                  color={zoneConfig?.color || '#1f77b4'}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <DataCard
                  title="Voltage"
                  value={data && data.voltage_V !== undefined ? data.voltage_V.toFixed(CONFIG.DECIMAL_PLACES.voltage) : '0.000'}
                  unit="V"
                  icon="⚡"
                  color={zoneConfig?.color || '#1f77b4'}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <DataCard
                  title="Power"
                  value={data && data.power_mW !== undefined ? data.power_mW.toFixed(CONFIG.DECIMAL_PLACES.power) : '0.0'}
                  unit="mW"
                  icon="⚙️"
                  color={zoneConfig?.color || '#1f77b4'}
                />
              </Grid>
            </Grid>

            {/* Zone Information */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Alert 
                  severity="info" 
                  sx={{ 
                    backgroundColor: '#e3f2fd',
                    '& .MuiAlert-message': { fontWeight: 500 }
                  }}
                >
                  <strong>Node ID:</strong> {data.node_id || 'N/A'}
                </Alert>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Alert 
                  severity="info"
                  sx={{ 
                    backgroundColor: '#e3f2fd',
                    '& .MuiAlert-message': { fontWeight: 500 }
                  }}
                >
                  <strong>Last Update:</strong> {formatTimestamp(data.timestamp)}
                </Alert>
              </Grid>
            </Grid>

            {/* Expandable Raw Data Section */}
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SettingsIcon fontSize="small" />
                Raw JSON Data
              </Typography>
              <Box
                component="pre"
                sx={{
                  backgroundColor: '#f5f5f5',
                  padding: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  border: '1px solid #e0e0e0'
                }}
              >
                {JSON.stringify(data, null, 2)}
              </Box>
            </Collapse>
          </>
        ) : (
          /* Offline State */
          <Alert 
            severity="warning" 
            sx={{ 
              backgroundColor: '#fff3e0',
              border: '1px solid #ffcc02'
            }}
          >
            <Typography variant="body1">
              <strong>No data available for {zoneName}.</strong>
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Check if the NodeMCU is sending data to this zone.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ZoneCard;
