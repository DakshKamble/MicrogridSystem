# Renewable Energy Monitoring System - Streamlit Dashboard

A real-time web dashboard for monitoring and controlling your microgrid system via MQTT. This dashboard transforms your ESP8266 sensor data into an intuitive web interface.

## 🚀 Quick Start

### Option 1: Automatic Setup
```bash
python run_dashboard.py
```

### Option 2: Manual Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Launch dashboard
streamlit run streamlit_dashboard.py
```

## 📡 MQTT Configuration

Make sure your MQTT broker is running and accessible. The dashboard connects to:
- **Broker**: `localhost` (change in `streamlit_dashboard.py` if needed)
- **Port**: `1883`
- **Topics**: 
  - Sensor data: `microgrid/sensor/*`
  - Zone control: `control/zone/*`

## 🔧 ESP8266 Setup

Your ESP8266 should be running the provided code that publishes to these topics:
- `microgrid/sensor/bus_voltage`
- `microgrid/sensor/shunt_voltage`
- `microgrid/sensor/load_voltage`
- `microgrid/sensor/current`
- `microgrid/sensor/power`
- `microgrid/sensor/status`

## 🎛️ Dashboard Features

### 📊 Real-time Monitoring
- **Bus Voltage**: Direct voltage from power source
- **Load Voltage**: Voltage available to loads
- **Current**: Current consumption in mA
- **Power**: Power generation/consumption in mW
- **Efficiency**: Calculated system efficiency

### 🏠 Zone Control
- **Three Distribution Zones**: Residential, Commercial, Industrial
- **ON/OFF Control**: Send MQTT commands to control zones
- **Status Display**: Real-time zone status monitoring

### 📈 System Overview
- **Generation Status**: High/Medium/Low power indicators
- **Active Zones**: Count of online distribution zones
- **Connection Status**: MQTT and sensor connectivity

## 🛠️ Customization

### Changing MQTT Broker
Edit `streamlit_dashboard.py` line 23:
```python
MQTT_BROKER = "your-broker-ip"  # Change this
```

### Adding More Zones
1. Update `CONTROL_TOPICS` dictionary
2. Add entries to `zone_states` in session state
3. Modify `render_zone_control_section()` function

### Custom Sensor Topics
Update the `SENSOR_TOPICS` dictionary to match your ESP8266 topics.

## 🔍 Troubleshooting

### Dashboard won't connect to MQTT
1. Check if MQTT broker is running: `systemctl status mosquitto`
2. Verify broker IP address in configuration
3. Check firewall settings

### No sensor data appearing
1. Verify ESP8266 is connected and publishing
2. Check MQTT topic names match exactly
3. Monitor MQTT traffic: `mosquitto_sub -h localhost -t "microgrid/#"`

### Dashboard auto-refresh issues
The dashboard automatically refreshes every 3 seconds when connected. If this causes issues, modify the `time.sleep(3)` and `st.rerun()` calls in the main function.

## 📝 Development Notes

- **Threading**: MQTT client runs in background thread using `client.loop_start()`
- **State Management**: All data stored in `st.session_state` for persistence
- **QoS**: Zone control commands use QoS level 1 for delivery guarantee
- **Error Handling**: Comprehensive error handling for MQTT operations

## 🌱 System Architecture

```
ESP8266 Sensors → MQTT Broker → Streamlit Dashboard
                     ↓
              Zone Control Commands
```

The dashboard both consumes sensor data and publishes control commands, creating a complete monitoring and control system for your renewable energy microgrid.
