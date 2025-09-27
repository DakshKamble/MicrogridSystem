# Microgrid Dashboard - Next.js Web Application

A responsive web dashboard that displays real-time sensor data from your FastAPI backend running on Raspberry Pi. The dashboard automatically refreshes data every 5 seconds and can be accessed from any device on your local network.

## Features

- 🔄 **Auto-refresh**: Data updates every 5 seconds automatically
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 🎯 **Real-time Data**: Displays current, voltage, power, and timestamp
- 🔧 **Manual Refresh**: Click button to manually reload data
- 🌐 **Network Access**: Accessible from any device on the same WiFi network
- ⚡ **Fast Loading**: Built with Next.js for optimal performance
- 🎨 **Clean UI**: Minimal design with Tailwind CSS

## Prerequisites

- Node.js 18+ installed
- FastAPI backend running on Raspberry Pi (port 8000)
- Both devices on the same WiFi network

## Installation

1. **Navigate to the project directory:**
   ```bash
   cd /path/to/dashboard/project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API endpoint (Important!):**
   
   Edit `app/page.tsx` and update the `API_BASE_URL`:
   ```typescript
   const API_BASE_URL = process.env.NODE_ENV === 'production' 
     ? 'http://192.168.1.100:8000' // Change this to your Pi's IP
     : 'http://localhost:8000'
   ```
   
   **Find your Raspberry Pi's IP address:**
   ```bash
   # On Raspberry Pi, run:
   hostname -I
   # Or:
   ip addr show | grep "inet " | grep -v 127.0.0.1
   ```

## Running the Dashboard

### Development Mode (with hot reload)
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

The dashboard will be available at:
- **Local access**: `http://localhost:3000`
- **Network access**: `http://[YOUR_COMPUTER_IP]:3000`

## Network Access Setup

To access the dashboard from other devices on your network:

1. **Find your computer's IP address:**
   
   **Windows:**
   ```cmd
   ipconfig | findstr "IPv4"
   ```
   
   **macOS/Linux:**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. **Access from other devices:**
   ```
   http://[YOUR_COMPUTER_IP]:3000
   ```
   
   Example: `http://192.168.1.50:3000`

3. **Firewall Configuration (if needed):**
   
   **Windows:** Allow port 3000 through Windows Firewall
   **macOS:** System Preferences > Security & Privacy > Firewall
   **Linux:** `sudo ufw allow 3000`

## Project Structure

```
microgrid-dashboard/
├── app/
│   ├── globals.css          # Global styles and Tailwind CSS
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main dashboard component
├── package.json             # Dependencies and scripts
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
└── README_DASHBOARD.md      # This file
```

## Dashboard Features Explained

### 1. **Real-time Data Display**
- Shows Node ID, Zone ID, Current (mA), Voltage (V), Power (mW), and Timestamp
- Data automatically updates every 5 seconds
- Connection status indicator (green = connected, red = disconnected)

### 2. **Responsive Layout**
- **Mobile**: Card-based layout with large, easy-to-read values
- **Desktop**: Table layout with all data in a structured format
- **Tablet**: Adapts between mobile and desktop layouts

### 3. **Manual Refresh**
- Blue "Refresh Data" button to manually reload data
- Shows spinning animation while loading
- Button is disabled during refresh to prevent multiple requests

### 4. **Error Handling**
- Displays clear error messages when API is unreachable
- Shows connection status and last update time
- Provides troubleshooting information

## API Integration

The dashboard connects to your FastAPI backend at:
```
GET /api/v1/node1/zone1
```

Expected JSON response format:
```json
{
    "node_id": "node1",
    "zone_id": "zone1",
    "timestamp": 560625,
    "current_mA": 6.3,
    "voltage_V": 3.308,
    "power_mW": 20,
    "received_at": "2024-01-01T12:00:00.000Z"
}
```

## Troubleshooting

### Common Issues

1. **"Connection Error" message:**
   - Verify FastAPI server is running on Raspberry Pi
   - Check IP address configuration in `app/page.tsx`
   - Ensure both devices are on the same network
   - Test API directly: `curl http://[PI_IP]:8000/api/v1/node1/zone1`

2. **Dashboard not accessible from other devices:**
   - Check firewall settings on host computer
   - Verify computer's IP address is correct
   - Ensure Next.js is running with `-H 0.0.0.0` flag (included in scripts)

3. **Data not updating:**
   - Check browser console for JavaScript errors
   - Verify MQTT messages are being received by FastAPI server
   - Check network connectivity between devices

### Testing the Complete System

1. **Start FastAPI server on Raspberry Pi:**
   ```bash
   # On Raspberry Pi
   source venv/bin/activate
   uvicorn mqtt_fastapi_server:app --host 0.0.0.0 --port 8000
   ```

2. **Start Dashboard on your computer:**
   ```bash
   # On your computer
   npm run dev
   ```

3. **Send test MQTT message:**
   ```bash
   # On Raspberry Pi
   mosquitto_pub -h localhost -t "/node1/zone1" -m '{
       "node_id": "node1",
       "zone_id": "zone1",
       "timestamp": 560625,
       "current_mA": 6.3,
       "voltage_V": 3.308,
       "power_mW": 20
   }'
   ```

4. **Access dashboard from any device:**
   ```
   http://[YOUR_COMPUTER_IP]:3000
   ```

## Customization

### Changing Refresh Interval
Edit `app/page.tsx`, line ~65:
```typescript
const interval = setInterval(fetchData, 5000) // Change 5000 to desired milliseconds
```

### Adding More Nodes/Zones
To support multiple nodes, you can:
1. Create additional API endpoints in FastAPI
2. Add tabs or dropdown selection in the dashboard
3. Modify the fetch function to accept different endpoints

### Styling Modifications
- Edit `app/globals.css` for global styles
- Modify `tailwind.config.js` for custom colors/themes
- Update component classes in `app/page.tsx` for layout changes

## Production Deployment

For production deployment on a server:

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

3. **Use PM2 for process management (optional):**
   ```bash
   npm install -g pm2
   pm2 start "npm start" --name microgrid-dashboard
   pm2 startup
   pm2 save
   ```

## License

This dashboard is designed for educational and research purposes as part of a microgrid monitoring system.
