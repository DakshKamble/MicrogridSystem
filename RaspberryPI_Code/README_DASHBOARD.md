# Microgrid Dashboard - Next.js Web Interface

A responsive Next.js dashboard that displays real-time sensor data from your Raspberry Pi microgrid system via the FastAPI backend.

## Features

- 🔄 **Auto-refresh** every 5 seconds
- 📱 **Responsive design** for mobile and desktop
- 🎯 **Real-time data** from MQTT sensors
- 🔘 **Manual refresh** button
- 📊 **Clean card and table layouts**
- 🌐 **Network accessible** from any device on the same WiFi

## Prerequisites

1. **FastAPI server** running on Raspberry Pi (port 8000)
2. **Node.js 16+** installed on the device running the dashboard
3. **Network connectivity** between dashboard device and Raspberry Pi

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Endpoint

Create a `.env.local` file (copy from `env.example`):

```bash
cp env.example .env.local
```

Edit `.env.local` and set your Raspberry Pi's IP address:

```env
NEXT_PUBLIC_API_URL=http://192.168.1.100:8000
```

**Replace `192.168.1.100` with your actual Raspberry Pi IP address.**

### 3. Find Your Raspberry Pi IP Address

On the Raspberry Pi, run:

```bash
hostname -I
```

Or check your router's admin panel for connected devices.

### 4. Start the Dashboard

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm run start
```

The dashboard will be available at:
- **Local access**: `http://localhost:3000`
- **Network access**: `http://YOUR_COMPUTER_IP:3000`

## Accessing from Other Devices

### Find Your Dashboard Computer's IP Address

**Windows:**
```cmd
ipconfig
```

**macOS/Linux:**
```bash
ifconfig
```

Look for your WiFi adapter's IP address (usually starts with 192.168.x.x or 10.x.x.x).

### Access from Mobile/Tablet

Once you know your computer's IP address, you can access the dashboard from any device on the same WiFi network:

```
http://YOUR_COMPUTER_IP:3000
```

For example: `http://192.168.1.150:3000`

## Project Structure

```
microgrid-dashboard/
├── pages/
│   ├── index.tsx          # Main dashboard page
│   └── _app.tsx           # Next.js app configuration
├── styles/
│   ├── globals.css        # Global styles
│   └── Dashboard.module.css # Dashboard-specific styles
├── package.json           # Dependencies and scripts
├── next.config.js         # Next.js configuration
├── env.example            # Environment variables example
└── README_DASHBOARD.md    # This file
```

## Dashboard Features

### Data Display
- **Node Information**: Node ID and Zone ID
- **Electrical Measurements**: Current (mA), Voltage (V), Power (mW)
- **Timing**: Sensor timestamp and received time
- **Connection Status**: API endpoint and refresh status

### Responsive Layout
- **Desktop**: Card grid layout with data table
- **Tablet**: Responsive card layout
- **Mobile**: Single column with optimized spacing

### Auto-Refresh
- Fetches new data every 5 seconds automatically
- Manual refresh button for immediate updates
- Shows last update timestamp
- Error handling with troubleshooting tips

## Troubleshooting

### "Connection Error" Message

1. **Check FastAPI server**: Ensure it's running on the Raspberry Pi
   ```bash
   # On Raspberry Pi
   curl http://localhost:8000/api/v1/status
   ```

2. **Verify IP address**: Make sure `.env.local` has the correct Raspberry Pi IP
   ```bash
   # Test from dashboard computer
   curl http://RASPBERRY_PI_IP:8000/api/v1/node1/zone1
   ```

3. **Check network connectivity**:
   ```bash
   ping RASPBERRY_PI_IP
   ```

4. **Firewall settings**: Ensure port 8000 is open on the Raspberry Pi
   ```bash
   # On Raspberry Pi (if using ufw)
   sudo ufw allow 8000
   ```

### "No data available yet" Message

1. **Check MQTT messages**: Ensure sensor data is being published
   ```bash
   # On Raspberry Pi
   mosquitto_sub -h localhost -t "/node1/zone1"
   ```

2. **Test MQTT publishing**:
   ```bash
   mosquitto_pub -h localhost -t "/node1/zone1" -m '{
     "node_id": "node1",
     "zone_id": "zone1",
     "timestamp": 560625,
     "current_mA": 6.3,
     "voltage_V": 3.308,
     "power_mW": 20
   }'
   ```

### Dashboard Not Accessible from Other Devices

1. **Check firewall**: Ensure port 3000 is open on the dashboard computer
2. **Verify network**: All devices must be on the same WiFi network
3. **Test with IP**: Try accessing using the computer's IP address instead of localhost

## Development

### Running in Development Mode

```bash
npm run dev
```

This starts the development server with:
- Hot reload for code changes
- Detailed error messages
- Source maps for debugging

### Building for Production

```bash
npm run build
npm run start
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | FastAPI backend URL | `http://192.168.1.100:8000` |

**Note**: Variables prefixed with `NEXT_PUBLIC_` are available in the browser.

## Customization

### Changing Refresh Interval

Edit `pages/index.tsx`, line with `setInterval(fetchData, 5000)`:

```typescript
// Change 5000 to desired milliseconds (e.g., 10000 for 10 seconds)
const interval = setInterval(fetchData, 10000);
```

### Adding New Data Fields

1. Update the `SensorData` interface in `pages/index.tsx`
2. Add new rows to the card layout and table
3. Update styling in `styles/Dashboard.module.css` if needed

### Styling

- **Global styles**: `styles/globals.css`
- **Dashboard styles**: `styles/Dashboard.module.css`
- **CSS Modules** are used for component-specific styling

## API Integration

The dashboard expects the FastAPI backend to provide:

### Endpoint: `GET /api/v1/node1/zone1`

**Response format:**
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

### Error Handling

- **404**: No data available yet
- **Network errors**: Connection issues
- **Timeout**: Request takes too long

## Performance

- **Auto-refresh**: 5-second intervals
- **Request timeout**: 30 seconds
- **Bundle size**: Optimized for fast loading
- **Mobile performance**: Responsive design with touch-friendly controls

## Security Notes

- Dashboard runs on local network only
- No authentication required (suitable for internal use)
- API endpoint configured via environment variables
- No sensitive data stored in browser

## License

This dashboard is designed for educational and research purposes as part of a microgrid monitoring system.
