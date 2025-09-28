import React from 'react';
import {
  Chip,
  CircularProgress,
  Box
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { CONFIG } from '../config/config';

/**
 * RefreshIndicator component for showing auto-refresh status
 * Shows refresh interval and loading state
 */
const RefreshIndicator = ({ isLoading, lastUpdate }) => {
  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return 'Never';
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return timestamp.toLocaleTimeString();
  };

  return (
    <Box className="refresh-indicator">
      <Box display="flex" flexDirection="column" gap={1} alignItems="flex-end">
        {/* Refresh Status */}
        <Chip
          icon={isLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
          label={isLoading ? 'Refreshing...' : `Auto-refresh: ${CONFIG.REFRESH_INTERVAL / 1000}s`}
          size="small"
          color={isLoading ? "primary" : "default"}
          sx={{
            backgroundColor: isLoading ? '#e3f2fd' : '#f5f5f5',
            '& .MuiChip-icon': {
              color: isLoading ? '#1976d2' : '#666'
            }
          }}
        />
        
        {/* Last Update */}
        {lastUpdate && (
          <Chip
            icon={<AccessTimeIcon />}
            label={`Updated: ${formatLastUpdate(lastUpdate)}`}
            size="small"
            variant="outlined"
            sx={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              fontSize: '0.75rem'
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default RefreshIndicator;
