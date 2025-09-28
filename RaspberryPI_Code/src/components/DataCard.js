import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { CONFIG } from '../config/config';

/**
 * DataCard component for displaying individual sensor metrics
 * Replicates the display_data_card function from Streamlit
 */
const DataCard = ({ title, value, unit, icon, color = '#1f77b4' }) => {
  return (
    <Card 
      sx={{ 
        height: '100%',
        background: 'linear-gradient(135deg, #f0f2f6 0%, #ffffff 100%)',
        borderLeft: `4px solid ${color}`,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
        }
      }}
    >
      <CardContent sx={{ padding: '16px !important' }}>
        <Box display="flex" alignItems="center" mb={1}>
          <Typography 
            variant="h6" 
            component="span" 
            sx={{ 
              fontSize: '1rem',
              fontWeight: 500,
              color: '#333',
              mr: 1
            }}
          >
            {icon}
          </Typography>
          <Typography 
            variant="h6" 
            component="span"
            sx={{ 
              fontSize: '1rem',
              fontWeight: 500,
              color: '#333'
            }}
          >
            {title}
          </Typography>
        </Box>
        
        <Typography 
          variant="h4" 
          component="div"
          sx={{ 
            fontSize: '1.75rem',
            fontWeight: 600,
            color: color,
            lineHeight: 1.2,
            mt: 0.5
          }}
        >
          {value} {unit}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default DataCard;
