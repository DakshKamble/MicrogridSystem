# 🌐 Network Access Setup Guide

## Problem Fixed ✅

The main issue was that the frontend dashboard was hardcoded to connect to `localhost:8000` instead of dynamically detecting the correct API URL. This has been **FIXED** with automatic IP detection.

## How It Works Now 🔧

The dashboard now automatically detects how it's being accessed:
- **Local access** (`http://localhost:3000`) → API calls go to `http://localhost:8000`
- **Remote access** (`http://192.168.1.100:3000`) → API calls go to `http://192.168.1.100:8000`

## Setup Instructions 📋

### 1. On Your Raspberry Pi

1. **Your Pi's IP address:**
   ```
   192.168.0.105
   ```

2. **Start both services:**
   ```bash
   # Option A: Use the automated script (recommended)
   chmod +x start_services.sh
   ./start_services.sh
   
   # Option B: Manual startup
   # Terminal 1 - FastAPI
   python3 mqtt_fastapi_server.py
   
   # Terminal 2 - Dashboard
   npm run dev
   ```

3. **Verify services are running:**
   - FastAPI: `http://localhost:8000/docs`
   - Dashboard: `http://localhost:3000`

### 2. From Your Main PC

1. **Access the dashboard using Pi's IP:**
   ```
   http://192.168.0.105:3000
   ```

2. **The dashboard will automatically connect to the correct API endpoint:**
   - It will show in the yellow info box: "Currently connecting to: http://192.168.0.105:8000"

### 3. Testing Connection

Use the updated test script:

```bash
# The test script is already configured for your Pi's IP (192.168.0.105)
# Run from your main PC:
node test_connection.js
```

## Troubleshooting 🔍

### Issue: "Connection Error" on dashboard
**Solutions:**
1. Verify FastAPI is running on Pi: `curl http://192.168.0.105:8000/api/v1/status`
2. Check firewall on Pi: `sudo ufw status`
3. Ensure both devices on same WiFi network
4. Test API directly from PC: `curl http://192.168.0.105:8000/api/v1/node1/zone1`

### Issue: Dashboard not accessible from PC
**Solutions:**
1. Check if Next.js is bound to all interfaces (uses `-H 0.0.0.0` in package.json)
2. Verify Pi's firewall allows port 3000: `sudo ufw allow 3000`
3. Test with: `telnet 192.168.0.105 3000`

### Issue: MQTT data not showing
**Solutions:**
1. Send test MQTT message on Pi:
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

## Network Architecture 🏗️

```
[Main PC Browser] 
    ↓ http://192.168.0.105:3000
[Raspberry Pi - Next.js Dashboard]
    ↓ http://192.168.0.105:8000/api/v1/node1/zone1
[Raspberry Pi - FastAPI Server]
    ↓ localhost:1883
[Raspberry Pi - MQTT Broker]
```

## What Changed 🔄

### Before (Broken):
- Dashboard always connected to `http://localhost:8000`
- Worked only when both services on same device
- Failed when accessing from remote device

### After (Fixed):
- Dashboard dynamically detects access method
- Automatically uses correct IP for API calls
- Works both locally and remotely

## Verification ✅

After starting services, you should see:
1. **Pi console**: Services starting successfully with network IP shown
2. **Dashboard**: Accessible from `http://[PI_IP]:3000`
3. **API info**: Yellow box shows correct API URL being used
4. **Data flow**: Real-time sensor data updating every 5 seconds

The fix is complete and should work immediately after restarting the dashboard!
