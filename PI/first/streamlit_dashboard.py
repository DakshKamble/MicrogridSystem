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
import logging

# Configure logging for debugging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('dashboard_debug.log'),
        logging.StreamHandler()
    ]
)

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
        logging.info("🔧 Initialized MQTT client in session state")
    if 'mqtt_connected' not in st.session_state:
        st.session_state.mqtt_connected = False
        logging.info("🔧 Initialized MQTT connection status: False")
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
        logging.info("🔧 Initialized sensor data with default values")
    if 'zone_states' not in st.session_state:
        st.session_state.zone_states = {
            "zone1": {"voltage": 0.0, "current": 0.0, "power": 0.0, "state": "OFF"},
            "zone2": {"voltage": 0.0, "current": 0.0, "power": 0.0, "state": "OFF"},
            "zone3": {"voltage": 0.0, "current": 0.0, "power": 0.0, "state": "OFF"}
        }
        logging.info("🔧 Initialized zone states with default values")
    
    # Debug counters
    if 'debug_message_count' not in st.session_state:
        st.session_state.debug_message_count = 0
    if 'debug_last_messages' not in st.session_state:
        st.session_state.debug_last_messages = []

def on_connect(client, userdata, flags, rc, properties=None):
    """Callback for when the MQTT client connects to the broker."""
    logging.info(f"🔌 MQTT Connect callback triggered with result code: {rc}")
    
    if rc == 0:
        st.session_state.mqtt_connected = True
        logging.info(f"✅ Connected to MQTT broker successfully!")
        logging.info(f"🌐 Broker: {MQTT_BROKER}:{MQTT_PORT}")
        print(f"✅ Connected to MQTT broker with result code {rc}")
        
        # Subscribe to all sensor topics
        subscription_success = True
        for topic_name, topic in SENSOR_TOPICS.items():
            result, mid = client.subscribe(topic)
            if result == mqtt.MQTT_ERR_SUCCESS:
                logging.info(f"📡 Successfully subscribed to {topic} (MID: {mid})")
                print(f"📡 Subscribed to {topic}")
            else:
                logging.error(f"❌ Failed to subscribe to {topic} (Error: {result})")
                subscription_success = False
        
        if subscription_success:
            logging.info("🎯 All topic subscriptions completed successfully")
        else:
            logging.warning("⚠️ Some topic subscriptions failed")
            
    else:
        st.session_state.mqtt_connected = False
        logging.error(f"❌ Failed to connect to MQTT broker with result code {rc}")
        error_messages = {
            1: "Connection refused - incorrect protocol version",
            2: "Connection refused - invalid client identifier",
            3: "Connection refused - server unavailable", 
            4: "Connection refused - bad username or password",
            5: "Connection refused - not authorised"
        }
        error_msg = error_messages.get(rc, f"Unknown error code {rc}")
        logging.error(f"🔍 Error details: {error_msg}")
        print(f"❌ Failed to connect to MQTT broker with result code {rc}: {error_msg}")

def on_message(client, userdata, msg):
    """Callback for when a message is received from MQTT broker."""
    try:
        topic = msg.topic
        payload = msg.payload.decode('utf-8')
        timestamp = datetime.now()
        
        # Increment message counter for debugging
        st.session_state.debug_message_count += 1
        
        # Log detailed message information
        logging.info(f"📨 Message #{st.session_state.debug_message_count} received")
        logging.info(f"   Topic: {topic}")
        logging.info(f"   Payload: {payload}")
        logging.info(f"   Timestamp: {timestamp}")
        logging.info(f"   QoS: {msg.qos}")
        logging.info(f"   Retain: {msg.retain}")
        
        print(f"📨 [{st.session_state.debug_message_count}] {topic} | {payload}")
        
        # Store message in debug history (keep last 10)
        debug_msg = {
            "count": st.session_state.debug_message_count,
            "topic": topic,
            "payload": payload,
            "timestamp": timestamp
        }
        st.session_state.debug_last_messages.append(debug_msg)
        if len(st.session_state.debug_last_messages) > 10:
            st.session_state.debug_last_messages.pop(0)
        
        # Check if topic matches our expected topics
        topic_matched = False
        old_value = None
        
        # Update sensor data based on topic
        if topic == SENSOR_TOPICS["bus_voltage"]:
            old_value = st.session_state.sensor_data["bus_voltage"]
            st.session_state.sensor_data["bus_voltage"] = float(payload)
            topic_matched = True
            logging.info(f"🔋 Bus voltage updated: {old_value} → {payload} V")
            
        elif topic == SENSOR_TOPICS["shunt_voltage"]:
            old_value = st.session_state.sensor_data["shunt_voltage"]
            st.session_state.sensor_data["shunt_voltage"] = float(payload)
            topic_matched = True
            logging.info(f"⚡ Shunt voltage updated: {old_value} → {payload} mV")
            
        elif topic == SENSOR_TOPICS["load_voltage"]:
            old_value = st.session_state.sensor_data["load_voltage"]
            st.session_state.sensor_data["load_voltage"] = float(payload)
            topic_matched = True
            logging.info(f"🔌 Load voltage updated: {old_value} → {payload} V")
            
        elif topic == SENSOR_TOPICS["current"]:
            old_value = st.session_state.sensor_data["current"]
            st.session_state.sensor_data["current"] = float(payload)
            topic_matched = True
            logging.info(f"🔄 Current updated: {old_value} → {payload} mA")
            
        elif topic == SENSOR_TOPICS["power"]:
            old_value = st.session_state.sensor_data["power"]
            st.session_state.sensor_data["power"] = float(payload)
            topic_matched = True
            logging.info(f"💡 Power updated: {old_value} → {payload} mW")
            
        elif topic == SENSOR_TOPICS["status"]:
            old_value = st.session_state.sensor_data["status"]
            st.session_state.sensor_data["status"] = payload
            topic_matched = True
            logging.info(f"📊 Status updated: {old_value} → {payload}")
        
        if not topic_matched:
            logging.warning(f"⚠️ Received message on unexpected topic: {topic}")
            logging.warning(f"   Expected topics: {list(SENSOR_TOPICS.values())}")
        
        # Update last update timestamp
        st.session_state.sensor_data["last_update"] = timestamp
        logging.info(f"🕒 Last update timestamp: {timestamp}")
        
        # Log current sensor data state
        logging.debug(f"📊 Current sensor data state:")
        for key, value in st.session_state.sensor_data.items():
            if key != "last_update":
                logging.debug(f"   {key}: {value}")
        
    except ValueError as e:
        logging.error(f"❌ Value conversion error for topic {topic}: {e}")
        logging.error(f"   Payload that failed: '{payload}'")
        print(f"❌ Value error for {topic}: {e}")
        
    except Exception as e:
        logging.error(f"❌ Unexpected error processing message: {e}")
        logging.error(f"   Topic: {topic}")
        logging.error(f"   Payload: {payload}")
        print(f"❌ Error processing message: {e}")

def on_disconnect(client, userdata, rc, properties=None):
    """Callback for when the MQTT client disconnects."""
    st.session_state.mqtt_connected = False
    logging.warning(f"🔌 MQTT client disconnected with result code: {rc}")
    
    disconnect_reasons = {
        0: "Disconnect was called",
        1: "Unexpected disconnect",
        5: "Connection lost"
    }
    reason = disconnect_reasons.get(rc, f"Unknown reason (code {rc})")
    logging.warning(f"🔍 Disconnect reason: {reason}")
    print(f"🔌 Disconnected from MQTT broker with result code {rc}: {reason}")

def setup_mqtt_client():
    """Setup and start the MQTT client in background thread."""
    if st.session_state.mqtt_client is None:
        try:
            logging.info("🚀 Setting up MQTT client...")
            logging.info(f"   Broker: {MQTT_BROKER}")
            logging.info(f"   Port: {MQTT_PORT}")
            logging.info(f"   Keepalive: {MQTT_KEEPALIVE}")
            
            # Create MQTT client
            client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
            client.on_connect = on_connect
            client.on_message = on_message
            client.on_disconnect = on_disconnect
            
            logging.info("✅ MQTT client created with callbacks attached")
            
            # Connect to broker
            logging.info(f"🔌 Attempting to connect to {MQTT_BROKER}:{MQTT_PORT}...")
            result = client.connect(MQTT_BROKER, MQTT_PORT, MQTT_KEEPALIVE)
            
            if result == mqtt.MQTT_ERR_SUCCESS:
                logging.info("✅ MQTT connect() call successful")
            else:
                logging.error(f"❌ MQTT connect() failed with code: {result}")
                error_codes = {
                    1: "Connection refused - invalid protocol version",
                    2: "Connection refused - invalid client identifier", 
                    3: "Connection refused - server unavailable",
                    4: "Connection refused - bad username or password",
                    5: "Connection refused - not authorised"
                }
                error_msg = error_codes.get(result, f"Unknown error code {result}")
                logging.error(f"🔍 Connect error: {error_msg}")
            
            # Start background loop (non-blocking)
            logging.info("🔄 Starting MQTT background loop...")
            client.loop_start()
            logging.info("✅ MQTT background loop started")
            
            # Store client in session state
            st.session_state.mqtt_client = client
            logging.info("📝 MQTT client stored in session state")
            
            print(f"🚀 MQTT client started and connecting to {MQTT_BROKER}:{MQTT_PORT}")
            
            # Log expected topics for debugging
            logging.info("📡 Expected MQTT topics:")
            for topic_name, topic in SENSOR_TOPICS.items():
                logging.info(f"   {topic_name}: {topic}")
            
        except Exception as e:
            error_msg = f"Failed to setup MQTT client: {e}"
            logging.error(f"❌ {error_msg}")
            st.error(error_msg)
            print(f"❌ MQTT setup error: {e}")
    else:
        logging.debug("🔄 MQTT client already exists, skipping setup")

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
    
    # Connection status with detailed debugging
    col1, col2, col3, col4 = st.columns([2, 1, 1, 1])
    
    with col1:
        if st.session_state.mqtt_connected:
            st.success("🟢 MQTT Connected")
            st.caption(f"Broker: {MQTT_BROKER}:{MQTT_PORT}")
        else:
            st.error("🔴 MQTT Disconnected")
            st.caption(f"Trying: {MQTT_BROKER}:{MQTT_PORT}")
    
    with col2:
        if st.session_state.sensor_data["last_update"]:
            last_update = st.session_state.sensor_data["last_update"]
            time_diff = datetime.now() - last_update
            st.info(f"🕒 Last Update: {last_update.strftime('%H:%M:%S')}")
            st.caption(f"({time_diff.total_seconds():.1f}s ago)")
        else:
            st.warning("⏳ Waiting for data...")
            st.caption("No messages received")
    
    with col3:
        status = st.session_state.sensor_data["status"]
        if status == "online":
            st.success(f"📡 Sensor: {status.upper()}")
        else:
            st.error(f"📡 Sensor: {status.upper()}")
        st.caption(f"Messages: {st.session_state.debug_message_count}")
    
    with col4:
        # Debug toggle
        if st.button("🐛 Debug Info"):
            st.session_state.show_debug = not st.session_state.get('show_debug', False)

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

def render_debug_section():
    """Render detailed debugging information."""
    if st.session_state.get('show_debug', False):
        st.header("🐛 Debug Information")
        
        # MQTT Debug Info
        debug_col1, debug_col2 = st.columns(2)
        
        with debug_col1:
            st.subheader("📡 MQTT Status")
            st.write(f"**Broker:** {MQTT_BROKER}:{MQTT_PORT}")
            st.write(f"**Connected:** {st.session_state.mqtt_connected}")
            st.write(f"**Client Exists:** {st.session_state.mqtt_client is not None}")
            st.write(f"**Messages Received:** {st.session_state.debug_message_count}")
            
            # Expected topics
            st.write("**Expected Topics:**")
            for name, topic in SENSOR_TOPICS.items():
                st.write(f"- {name}: `{topic}`")
        
        with debug_col2:
            st.subheader("📊 Session State")
            st.write("**Current Sensor Data:**")
            for key, value in st.session_state.sensor_data.items():
                if key == "last_update" and value:
                    st.write(f"- {key}: {value.strftime('%Y-%m-%d %H:%M:%S')}")
                else:
                    st.write(f"- {key}: {value}")
        
        # Recent messages
        st.subheader("📨 Recent MQTT Messages")
        if st.session_state.debug_last_messages:
            for msg in reversed(st.session_state.debug_last_messages[-5:]):  # Show last 5
                timestamp_str = msg["timestamp"].strftime('%H:%M:%S.%f')[:-3]
                st.write(f"**[{msg['count']}]** `{timestamp_str}` - **{msg['topic']}** → `{msg['payload']}`")
        else:
            st.write("No messages received yet")
        
        # Connection test button
        if st.button("🔄 Test MQTT Connection"):
            try:
                import socket
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(5)
                result = sock.connect_ex((MQTT_BROKER, MQTT_PORT))
                sock.close()
                
                if result == 0:
                    st.success(f"✅ Can reach {MQTT_BROKER}:{MQTT_PORT}")
                else:
                    st.error(f"❌ Cannot reach {MQTT_BROKER}:{MQTT_PORT}")
            except Exception as e:
                st.error(f"❌ Connection test failed: {e}")
        
        # Manual reconnect button
        if st.button("🔌 Force MQTT Reconnect"):
            if st.session_state.mqtt_client:
                try:
                    st.session_state.mqtt_client.disconnect()
                    st.session_state.mqtt_client.loop_stop()
                except:
                    pass
            st.session_state.mqtt_client = None
            st.session_state.mqtt_connected = False
            st.rerun()

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
    
    # Debug section (if enabled)
    render_debug_section()
    if st.session_state.get('show_debug', False):
        st.markdown("---")
    
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
    🌱 Renewable Energy Monitoring System | Built with Streamlit & MQTT<br>
    <small>Debug log: dashboard_debug.log | Check terminal/console for real-time logs</small>
    </div>
    """, unsafe_allow_html=True)
    
    # Auto-refresh the page every 3 seconds when connected, or every 5 seconds when disconnected
    refresh_time = 3 if st.session_state.mqtt_connected else 5
    time.sleep(refresh_time)
    st.rerun()

# ==========================================
# APPLICATION ENTRY POINT
# ==========================================

if __name__ == "__main__":
    main()
