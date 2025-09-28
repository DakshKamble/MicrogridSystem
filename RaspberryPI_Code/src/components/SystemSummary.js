import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ElectricBolt as ElectricBoltIcon,
  Power as PowerIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { CONFIG } from '../config/config';

/**
 * SystemSummary component for displaying aggregated metrics
 * Replicates the system summary section from Streamlit
 */
const SystemSummary = ({ summary }) => {
  const getStatusConfig = () => {
    switch (summary.status) {
      case 'online':
        return {
          color: CONFIG.STATUS_COLORS.online,
          icon: '🟢',
          text: `All ${summary.totalZones} zones online`,
          severity: 'success'
        };
      case 'partial':
        return {
          color: CONFIG.STATUS_COLORS.partial,
          icon: '🟡',
          text: `${summary.onlineZones}/${summary.totalZones} zones online`,
          severity: 'warning'
        };
      default:
        return {
          color: CONFIG.STATUS_COLORS.offline,
          icon: '🔴',
          text: `No zones online (${summary.onlineZones}/${summary.totalZones})`,
          severity: 'error'
        };
    }
  };

  const statusConfig = getStatusConfig();

  const MetricCard = ({ title, value, unit, icon: Icon, color }) => (
    <Card 
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}30`,
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
        }
      }}
    >
      <CardContent sx={{ textAlign: 'center', padding: '20px !important' }}>
        <Box display="flex" justifyContent="center" mb={1}>
          <Icon sx={{ fontSize: 32, color: color }} />
        </Box>
        <Typography 
          variant="h4" 
          component="div"
          sx={{ 
            fontWeight: 700,
            color: color,
            mb: 0.5,
            fontSize: '1.75rem'
          }}
        >
          {value}
          {unit && (
            <Typography 
              component="span" 
              sx={{ 
                fontSize: '1rem', 
                fontWeight: 400,
                ml: 0.5,
                color: '#666'
              }}
            >
              {unit}
            </Typography>
          )}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#666',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* System Status Header */}
      <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
        <Chip
          label={`${statusConfig.icon} ${statusConfig.text}`}
          className={`status-indicator status-${summary.status}`}
          sx={{ 
            fontSize: '1rem',
            padding: '8px 16px',
            height: 'auto',
            '& .MuiChip-label': {
              padding: '8px 12px'
            }
          }}
        />
      </Box>

      {/* Metrics Grid */}
      {summary.onlineZones > 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Online Zones"
              value={`${summary.onlineZones}/${summary.totalZones}`}
              icon={DashboardIcon}
              color="#2196f3"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total Current"
              value={summary.totalCurrent.toFixed(CONFIG.DECIMAL_PLACES.current)}
              unit="mA"
              icon={ElectricBoltIcon}
              color="#ff9800"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Average Voltage"
              value={summary.averageVoltage.toFixed(CONFIG.DECIMAL_PLACES.voltage)}
              unit="V"
              icon={SpeedIcon}
              color="#4caf50"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total Power"
              value={summary.totalPower.toFixed(CONFIG.DECIMAL_PLACES.power)}
              unit="mW"
              icon={PowerIcon}
              color="#9c27b0"
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default SystemSummary;
