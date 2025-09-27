# Microgrid MQTT FastAPI Server

A simple Python server that receives sensor data via MQTT and exposes it through a REST API using FastAPI. Designed for Raspberry Pi microgrid monitoring systems.

## Features

- 🔌 Connects to local MQTT broker (localhost:1883)
- 📡 Subscribes to `/node1/zone1` topic
- 💾 Stores latest sensor data in memory
- 🌐 Exposes REST API endpoints
- 🐛 Console logging for debugging
- 📊 Built-in API documentation

## Requirements

- Python 3.7+
- MQTT broker running on localhost:1883 (e.g., Mosquitto)
- Network access to publish MQTT messages

## Installation

1. **Clone or download the files:**
   ```bash
   # Ensure you have these files:
   # - mqtt_fastapi_server.py
   # - requirements.txt
   # - README.md
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Ensure MQTT broker is running:**
   ```bash
   # Install Mosquitto on Raspberry Pi (if not already installed)
   sudo apt update
   sudo apt install mosquitto mosquitto-clients
   
   # Start Mosquitto broker
   sudo systemctl start mosquitto
   sudo systemctl enable mosquitto  # Start on boot
   
   # Test broker is running
   mosquitto_pub -h localhost -t test -m "hello"
   ```

## Usage

### Starting the Server

```bash
python mqtt_fastapi_server.py
```

The server will:
- Start on `http://0.0.0.0:8000` (accessible from any network interface)
- Connect to MQTT broker at `localhost:1883`
- Subscribe to topic `/node1/zone1`
- Display connection status and incoming messages in console

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Root endpoint with API information |
| `/api/v1/node1/zone1` | GET | Latest sensor data from node1/zone1 |
| `/api/v1/status` | GET | API status and statistics |
| `/docs` | GET | Interactive API documentation (Swagger UI) |
| `/redoc` | GET | Alternative API documentation |

### Testing the API

1. **Check server status:**
   ```bash
   curl http://localhost:8000/api/v1/status
   ```

2. **Get sensor data:**
   ```bash
   curl http://localhost:8000/api/v1/node1/zone1
   ```

3. **View interactive docs:**
   Open `http://localhost:8000/docs` in your browser

### Sending Test MQTT Messages

To test the system, publish a sample message:

```bash
# Install mosquitto-clients if not already installed
sudo apt install mosquitto-clients

# Send test message
mosquitto_pub -h localhost -t "/node1/zone1" -m '{
    "node_id": "node1",
    "zone_id": "zone1",
    "timestamp": 560625,
    "current_mA": 6.3,
    "voltage_V": 3.308,
    "power_mW": 20
}'
```

You should see:
1. Message logged in the server console
2. Data available via REST API at `/api/v1/node1/zone1`

## Expected JSON Payload Format

The server expects JSON messages in this format:

```json
{
    "node_id": "node1",
    "zone_id": "zone1",
    "timestamp": 560625,
    "current_mA": 6.3,
    "voltage_V": 3.308,
    "power_mW": 20
}
```

All fields are required. Missing fields will trigger a warning in the console.

## Running as a Service (Optional)

To run the server as a systemd service on Raspberry Pi:

1. **Create service file:**
   ```bash
   sudo nano /etc/systemd/system/microgrid-api.service
   ```

2. **Add service configuration:**
   ```ini
   [Unit]
   Description=Microgrid MQTT FastAPI Server
   After=network.target mosquitto.service
   Requires=mosquitto.service

   [Service]
   Type=simple
   User=pi
   WorkingDirectory=/home/pi/microgrid
   ExecStart=/usr/bin/python3 /home/pi/microgrid/mqtt_fastapi_server.py
   Restart=always
   RestartSec=5

   [Install]
   WantedBy=multi-user.target
   ```

3. **Enable and start service:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable microgrid-api.service
   sudo systemctl start microgrid-api.service
   
   # Check status
   sudo systemctl status microgrid-api.service
   ```

## Troubleshooting

### MQTT Connection Issues
- Verify MQTT broker is running: `sudo systemctl status mosquitto`
- Check if port 1883 is open: `netstat -ln | grep 1883`
- Test MQTT connectivity: `mosquitto_sub -h localhost -t "#"`

### FastAPI Server Issues
- Check if port 8000 is available: `netstat -ln | grep 8000`
- View server logs for error messages
- Ensure all dependencies are installed: `pip list`

### No Data Available
- Verify MQTT messages are being published to the correct topic
- Check message format matches expected JSON schema
- Monitor console output for parsing errors

## Development

For development with auto-reload:

```bash
uvicorn mqtt_fastapi_server:app --host 0.0.0.0 --port 8000 --reload
```

## License

This project is designed for educational and research purposes as part of a microgrid monitoring system.
