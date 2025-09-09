#!/usr/bin/env python3
"""
Renewable Energy Monitoring System - Streamlit Dashboard
========================================================

A real-time web dashboard for monitoring microgrid sensor data via MQTT.
This application subscribes to MQTT topics from ESP8266 sensors and provides
a web interface for monitoring and controlling the renewable energy system.

Author: Generated for Microgrid System
"""

import streamlit as st
import paho.mqtt.client as mqtt
import json
import threading
import time
from datetime import datetime
import pandas as pd

# ==========================================
# CONFIGURATION SETTINGS
# ==========================================

# MQTT Broker Configuration
MQTT_BROKER = "localhost"  # Same as your ESP code
MQTT_PORT = 1883
MQTT_KEEPALIVE = 60

# MQTT Topics for sensor data (matching your ESP code)
SENSOR_TOPICS = {
    "bus_voltage": "microgrid/sensor/bus_voltage",
    "shunt_voltage": "microgrid/sensor/shunt_voltage", 
    "load_voltage": "microgrid/sensor/load_voltage",
    "current": "microgrid/sensor/current",
    "power": "microgrid/sensor/power",
    "status": "microgrid/sensor/status"
}

# Control topics for zone management
CONTROL_TOPICS = {
    "zone1": "control/zone/1",
    "zone2": "control/zone/2", 
    "zone3": "control/zone/3"
}

# ==========================================
# MQTT CLIENT SETUP AND CALLBACKS
# ==========================================

def initialize_session_state():
    """Initialize Streamlit session state with default values."""
    if 'mqtt_client' not in st.session_state:
        st.session_state.mqtt_client = None
    if 'mqtt_connected' not in st.session_state:
        st.session_state.mqtt_connected = False
    if 'sensor_data' not in st.session_state:
        st.session_state.sensor_data = {
            "bus_voltage": 0.0,
            "shunt_voltage": 0.0,
            "load_voltage": 0.0,
            "current": 0.0,
            "power": 0.0,
            "status": "offline",
            "last_update": None
        }
    if 'zone_states' not in st.session_state:
        st.session_state.zone_states = {
            "zone1": {"voltage": 0.0, "current": 0.0, "power": 0.0, "state": "OFF"},
            "zone2": {"voltage": 0.0, "current": 0.0, "power": 0.0, "state": "OFF"},
            "zone3": {"voltage": 0.0, "current": 0.0, "power": 0.0, "state": "OFF"}
        }

def on_connect(client, userdata, flags, rc, properties=None):
    """Callback for when the MQTT client connects to the broker."""
    if rc == 0:
        st.session_state.mqtt_connected = True
        print(f"✅ Connected to MQTT broker with result code {rc}")
        
        # Subscribe to all sensor topics
        for topic_name, topic in SENSOR_TOPICS.items():
            client.subscribe(topic)
            print(f"📡 Subscribed to {topic}")
    else:
        st.session_state.mqtt_connected = False
        print(f"❌ Failed to connect to MQTT broker with result code {rc}")

def on_message(client, userdata, msg):
    """Callback for when a message is received from MQTT broker."""
    try:
        topic = msg.topic
        payload = msg.payload.decode('utf-8')
        
        print(f"📨 Received: {topic} | {payload}")
        
        # Update sensor data based on topic
        if topic == SENSOR_TOPICS["bus_voltage"]:
            st.session_state.sensor_data["bus_voltage"] = float(payload)
        elif topic == SENSOR_TOPICS["shunt_voltage"]:
            st.session_state.sensor_data["shunt_voltage"] = float(payload)
        elif topic == SENSOR_TOPICS["load_voltage"]:
            st.session_state.sensor_data["load_voltage"] = float(payload)
        elif topic == SENSOR_TOPICS["current"]:
            st.session_state.sensor_data["current"] = float(payload)
        elif topic == SENSOR_TOPICS["power"]:
            st.session_state.sensor_data["power"] = float(payload)
        elif topic == SENSOR_TOPICS["status"]:
            st.session_state.sensor_data["status"] = payload
        
        # Update last update timestamp
        st.session_state.sensor_data["last_update"] = datetime.now()
        
    except Exception as e:
        print(f"❌ Error processing message: {e}")

def on_disconnect(client, userdata, rc, properties=None):
    """Callback for when the MQTT client disconnects."""
    st.session_state.mqtt_connected = False
    print(f"🔌 Disconnected from MQTT broker with result code {rc}")

def setup_mqtt_client():
    """Setup and start the MQTT client in background thread."""
    if st.session_state.mqtt_client is None:
        try:
            # Create MQTT client
            client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
            client.on_connect = on_connect
            client.on_message = on_message
            client.on_disconnect = on_disconnect
            
            # Connect to broker
            client.connect(MQTT_BROKER, MQTT_PORT, MQTT_KEEPALIVE)
            
            # Start background loop (non-blocking)
            client.loop_start()
            
            # Store client in session state
            st.session_state.mqtt_client = client
            
            print(f"🚀 MQTT client started and connecting to {MQTT_BROKER}:{MQTT_PORT}")
            
        except Exception as e:
            st.error(f"Failed to setup MQTT client: {e}")
            print(f"❌ MQTT setup error: {e}")

def publish_zone_command(zone_number, command):
    """Publish ON/OFF command to a specific zone."""
    if st.session_state.mqtt_client and st.session_state.mqtt_connected:
        try:
            topic = f"control/zone/{zone_number}"
            payload = json.dumps({"cmd": command})
            
            # Publish with QoS 1 for delivery guarantee
            result = st.session_state.mqtt_client.publish(topic, payload, qos=1)
            
            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                st.success(f"✅ Zone {zone_number} command '{command}' sent successfully!")
                print(f"📤 Published: {topic} | {payload}")
                
                # Update local zone state
                zone_key = f"zone{zone_number}"
                if zone_key in st.session_state.zone_states:
                    st.session_state.zone_states[zone_key]["state"] = command
            else:
                st.error(f"❌ Failed to send command to Zone {zone_number}")
                
        except Exception as e:
            st.error(f"Error sending command: {e}")
            print(f"❌ Command error: {e}")
    else:
        st.warning("⚠️ MQTT not connected. Cannot send command.")

# ==========================================
# STREAMLIT UI COMPONENTS
# ==========================================

def render_header():
    """Render the dashboard header with title and connection status."""
    st.set_page_config(
        page_title="Renewable Energy Monitoring System",
        page_icon="🔋",
        layout="wide",
        initial_sidebar_state="collapsed"
    )
    
    # Main title
    st.title("🔋 Renewable Energy Monitoring System")
    st.markdown("---")
    
    # Connection status
    col1, col2, col3 = st.columns([2, 1, 1])
    
    with col1:
        if st.session_state.mqtt_connected:
            st.success("🟢 MQTT Connected")
        else:
            st.error("🔴 MQTT Disconnected")
    
    with col2:
        if st.session_state.sensor_data["last_update"]:
            last_update = st.session_state.sensor_data["last_update"]
            st.info(f"🕒 Last Update: {last_update.strftime('%H:%M:%S')}")
        else:
            st.warning("⏳ Waiting for data...")
    
    with col3:
        status = st.session_state.sensor_data["status"]
        if status == "online":
            st.success(f"📡 Sensor: {status.upper()}")
        else:
            st.error(f"📡 Sensor: {status.upper()}")

def render_sensor_data_section():
    """Render the main sensor data monitoring section."""
    st.header("📊 Real-time Sensor Data")
    
    # Create metrics display
    col1, col2, col3, col4 = st.columns(4)
    
    sensor_data = st.session_state.sensor_data
    
    with col1:
        st.metric(
            label="🔌 Bus Voltage",
            value=f"{sensor_data['bus_voltage']:.3f} V",
            delta=None
        )
        
    with col2:
        st.metric(
            label="⚡ Load Voltage", 
            value=f"{sensor_data['load_voltage']:.3f} V",
            delta=None
        )
        
    with col3:
        st.metric(
            label="🔄 Current",
            value=f"{sensor_data['current']:.3f} mA",
            delta=None
        )
        
    with col4:
        st.metric(
            label="💡 Power",
            value=f"{sensor_data['power']:.3f} mW",
            delta=None
        )
    
    # Additional detailed readings
    st.subheader("🔍 Detailed Readings")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.metric(
            label="⚡ Shunt Voltage",
            value=f"{sensor_data['shunt_voltage']:.3f} mV",
            delta=None
        )
    
    with col2:
        # Calculate efficiency or other derived metrics
        if sensor_data['load_voltage'] > 0:
            efficiency = (sensor_data['power'] / (sensor_data['load_voltage'] * abs(sensor_data['current']))) * 100 if sensor_data['current'] != 0 else 0
            st.metric(
                label="⚙️ Efficiency",
                value=f"{efficiency:.1f}%",
                delta=None
            )
        else:
            st.metric(
                label="⚙️ Efficiency", 
                value="0.0%",
                delta=None
            )

def render_zone_control_section():
    """Render the zone control interface with ON/OFF buttons."""
    st.header("🏠 Distribution Zone Control")
    st.markdown("Control the power distribution to different zones of the microgrid system.")
    
    # Create three columns for three zones
    col1, col2, col3 = st.columns(3)
    
    zones = [
        {"num": 1, "name": "Zone 1 - Residential", "col": col1},
        {"num": 2, "name": "Zone 2 - Commercial", "col": col2}, 
        {"num": 3, "name": "Zone 3 - Industrial", "col": col3}
    ]
    
    for zone in zones:
        with zone["col"]:
            zone_key = f"zone{zone['num']}"
            zone_data = st.session_state.zone_states[zone_key]
            
            # Zone header
            st.subheader(f"🏢 {zone['name']}")
            
            # Current state indicator
            state = zone_data["state"]
            if state == "ON":
                st.success(f"✅ Status: {state}")
            else:
                st.error(f"⭕ Status: {state}")
            
            # Zone metrics (simulated - you can integrate real zone data)
            st.metric("🔌 Voltage", f"{zone_data['voltage']:.1f} V")
            st.metric("⚡ Current", f"{zone_data['current']:.1f} A") 
            st.metric("💡 Power", f"{zone_data['power']:.1f} W")
            
            # Control buttons
            st.markdown("**Control Actions:**")
            
            button_col1, button_col2 = st.columns(2)
            
            with button_col1:
                if st.button(f"🟢 ON", key=f"on_{zone['num']}", use_container_width=True):
                    publish_zone_command(zone['num'], "ON")
            
            with button_col2:
                if st.button(f"🔴 OFF", key=f"off_{zone['num']}", use_container_width=True):
                    publish_zone_command(zone['num'], "OFF")
            
            st.markdown("---")

def render_system_status():
    """Render overall system status and statistics."""
    st.header("📈 System Overview")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("🔋 Energy Generation")
        total_power = st.session_state.sensor_data['power']
        st.metric("Total Generation", f"{total_power:.2f} mW")
        
        # Simple power status
        if total_power > 100:
            st.success("🟢 High Generation")
        elif total_power > 50:
            st.warning("🟡 Medium Generation") 
        else:
            st.error("🔴 Low Generation")
    
    with col2:
        st.subheader("🏠 Active Zones")
        active_zones = sum(1 for zone in st.session_state.zone_states.values() if zone["state"] == "ON")
        st.metric("Zones Online", f"{active_zones}/3")
        
        if active_zones == 3:
            st.success("🟢 All Zones Active")
        elif active_zones > 0:
            st.warning(f"🟡 {active_zones} Zone(s) Active")
        else:
            st.error("🔴 No Zones Active")

# ==========================================
# MAIN APPLICATION
# ==========================================

def main():
    """Main Streamlit application entry point."""
    
    # Initialize session state
    initialize_session_state()
    
    # Setup MQTT client (only once)
    setup_mqtt_client()
    
    # Render UI components
    render_header()
    
    # Auto-refresh every 2 seconds
    if st.session_state.mqtt_connected:
        time.sleep(0.1)  # Small delay to prevent too frequent updates
    
    # Main content sections
    render_sensor_data_section()
    st.markdown("---")
    
    render_zone_control_section() 
    st.markdown("---")
    
    render_system_status()
    
    # Footer
    st.markdown("---")
    st.markdown("""
    <div style='text-align: center; color: gray;'>
    🌱 Renewable Energy Monitoring System | Built with Streamlit & MQTT
    </div>
    """, unsafe_allow_html=True)
    
    # Auto-refresh the page every 3 seconds when connected
    if st.session_state.mqtt_connected:
        time.sleep(3)
        st.rerun()

# ==========================================
# APPLICATION ENTRY POINT
# ==========================================

if __name__ == "__main__":
    main()
