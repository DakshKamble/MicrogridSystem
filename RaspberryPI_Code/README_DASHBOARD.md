# Node 1 Streamlit Dashboard

Simple real-time dashboard for monitoring Microgrid Node 1 sensor data.

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Make sure your FastAPI server is running:**
   ```bash
   python mqtt_fastapi_server.py
   ```

3. **Start the dashboard:**
   ```bash
   streamlit run dashboard.py
   ```

4. **Access the dashboard:**
   - Local: http://localhost:8501
   - Network: http://YOUR_RASPBERRY_PI_IP:8501

## Features

- **Real-time data display** from Node 1, Zone 1
- **Auto-refresh** every 5 seconds
- **Clean card-based layout** showing:
  - Node ID and Zone ID
  - Timestamp of last measurement
  - Current (mA)
  - Voltage (V)  
  - Power (mW)
- **Error handling** with connection status
- **Mobile-friendly** responsive design

## Network Access

To access the dashboard from other devices on your WiFi network:

1. Find your Raspberry Pi's IP address:
   ```bash
   hostname -I
   ```

2. Use that IP in the URL:
   ```
   http://192.168.1.XXX:8501
   ```

## Troubleshooting

**Dashboard shows "Unable to connect to Node 1":**
- Check if FastAPI server is running on port 8000
- Verify MQTT messages are being received
- Ensure Node 1 is sending data

**Can't access from other devices:**
- Check Raspberry Pi firewall settings
- Verify both devices are on same WiFi network
- Try accessing the FastAPI directly: http://PI_IP:8000/api/v1/node1/zone1

## Configuration

Edit `dashboard.py` to modify:
- `API_BASE_URL`: Change if FastAPI runs on different host/port
- `REFRESH_INTERVAL`: Adjust auto-refresh timing
- Layout and styling in the `display_data_card()` function
