#!/usr/bin/env python3
"""
Multi-Zone Streamlit Dashboard for Microgrid Node 1
==================================================

This dashboard fetches and displays real-time sensor data from all 3 zones
of Node 1 in the microgrid system. It connects to the FastAPI backend running 
on the same Raspberry Pi and updates automatically every 5 seconds.

Features:
- Displays data from Zone 1, Zone 2, and Zone 3
- Real-time updates every 5 seconds
- Individual zone status indicators
- Organized layout with zone-specific cards

Usage:
    streamlit run dashboard.py

The dashboard will be accessible at:
    - Local: http://localhost:8501
    - Network: http://<raspberry-pi-ip>:8501

Author: Generated for Raspberry Pi Microgrid System
"""

import streamlit as st
import requests
import time
from datetime import datetime
import json

# Configuration
API_BASE_URL = "http://localhost:8000"  # FastAPI server URL
ZONE_ENDPOINTS = {
    "Zone 1": f"{API_BASE_URL}/api/v1/node1/zone1",
    "Zone 2": f"{API_BASE_URL}/api/v1/node1/zone2", 
    "Zone 3": f"{API_BASE_URL}/api/v1/node1/zone3"
}
REFRESH_INTERVAL = 5  # seconds

# Page configuration
st.set_page_config(
    page_title="Node 1 Multi-Zone Dashboard",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="collapsed"
)

def fetch_zone_data(zone_name, endpoint):
    """
    Fetch the latest sensor data from a specific zone.
    
    Args:
        zone_name (str): Name of the zone (e.g., "Zone 1")
        endpoint (str): API endpoint URL for the zone
    
    Returns:
        dict: JSON response from the API, or None if error occurs
    """
    try:
        response = requests.get(endpoint, timeout=10)
        response.raise_for_status()  # Raises an HTTPError for bad responses
        return response.json()
    except requests.exceptions.RequestException as e:
        # Don't show error in UI for individual zones, just return None
        return None
    except json.JSONDecodeError:
        return None

def fetch_all_zones_data():
    """
    Fetch data from all zones.
    
    Returns:
        dict: Dictionary with zone names as keys and data as values
    """
    all_data = {}
    for zone_name, endpoint in ZONE_ENDPOINTS.items():
        all_data[zone_name] = fetch_zone_data(zone_name, endpoint)
    return all_data

def format_timestamp(timestamp):
    """
    Convert Unix timestamp to human-readable format.
    
    Args:
        timestamp (int/float): Unix timestamp
        
    Returns:
        str: Formatted datetime string
    """
    try:
        dt = datetime.fromtimestamp(timestamp)
        return dt.strftime("%Y-%m-%d %H:%M:%S")
    except (ValueError, TypeError):
        return "Invalid timestamp"

def display_data_card(title, value, unit, icon):
    """
    Display a data value in a styled card format.
    
    Args:
        title (str): The title/label for the data
        value (float/int): The numerical value
        unit (str): The unit of measurement
        icon (str): Emoji icon for the card
    """
    st.markdown(f"""
    <div style="
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #1f77b4;
        margin: 0.5rem 0;
    ">
        <h4 style="margin: 0; color: #333;">{icon} {title}</h4>
        <h2 style="margin: 0.25rem 0 0 0; color: #1f77b4;">{value} {unit}</h2>
    </div>
    """, unsafe_allow_html=True)

def display_zone_card(zone_name, data):
    """
    Display a complete zone card with all sensor data.
    
    Args:
        zone_name (str): Name of the zone
        data (dict): Zone sensor data, or None if no data available
    """
    # Zone header with status indicator
    if data:
        status_color = "#28a745"  # Green
        status_icon = "🟢"
        status_text = "Online"
    else:
        status_color = "#dc3545"  # Red
        status_icon = "🔴"
        status_text = "Offline"
    
    st.markdown(f"""
    <div style="
        background-color: white;
        padding: 1.5rem;
        border-radius: 0.75rem;
        border: 2px solid {status_color};
        margin: 1rem 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    ">
        <h3 style="margin: 0 0 1rem 0; color: #333;">
            ⚡ {zone_name} {status_icon} {status_text}
        </h3>
    """, unsafe_allow_html=True)
    
    if data:
        # Create columns for sensor data
        col1, col2, col3 = st.columns(3)
        
        with col1:
            current_ma = data.get('current_mA', 0)
            display_data_card("Current", f"{current_ma:.1f}", "mA", "🔌")
        
        with col2:
            voltage_v = data.get('voltage_V', 0)
            display_data_card("Voltage", f"{voltage_v:.3f}", "V", "⚡")
        
        with col3:
            power_mw = data.get('power_mW', 0)
            display_data_card("Power", f"{power_mw:.1f}", "mW", "⚙️")
        
        # Zone info
        col_info1, col_info2 = st.columns(2)
        with col_info1:
            st.info(f"**Node ID:** {data.get('node_id', 'N/A')}")
        with col_info2:
            timestamp = data.get('timestamp', 0)
            formatted_time = format_timestamp(timestamp)
            st.info(f"**Last Update:** {formatted_time}")
    else:
        st.warning(f"No data available for {zone_name}. Check if the NodeMCU is sending data to this zone.")
    
    st.markdown("</div>", unsafe_allow_html=True)

def main():
    """
    Main dashboard function that creates the layout and handles data display.
    
    This function:
    1. Sets up the dashboard header and layout
    2. Fetches data from all zone API endpoints
    3. Displays the data in organized zone cards
    4. Handles auto-refresh functionality
    """
    # Dashboard header
    st.title("⚡ Microgrid Node 1 Multi-Zone Dashboard")
    st.markdown("**Real-time sensor data from all 3 zones**")
    
    # System status summary
    all_data = fetch_all_zones_data()
    online_zones = sum(1 for data in all_data.values() if data is not None)
    total_zones = len(all_data)
    
    # Status indicator
    if online_zones == total_zones:
        st.success(f"🟢 All {total_zones} zones online")
    elif online_zones > 0:
        st.warning(f"🟡 {online_zones}/{total_zones} zones online")
    else:
        st.error(f"🔴 No zones online ({online_zones}/{total_zones})")
    
    st.markdown("---")
    
    # Create placeholder for dynamic content
    placeholder = st.empty()
    
    # Auto-refresh container
    with placeholder.container():
        # Display each zone in its own card
        for zone_name in ["Zone 1", "Zone 2", "Zone 3"]:
            zone_data = all_data.get(zone_name)
            display_zone_card(zone_name, zone_data)
        
        # System summary section
        st.markdown("---")
        st.subheader("📊 System Summary")
        
        # Calculate totals if any zones are online
        if online_zones > 0:
            total_current = 0
            total_power = 0
            avg_voltage = 0
            voltage_count = 0
            
            for zone_name, data in all_data.items():
                if data:
                    total_current += data.get('current_mA', 0)
                    total_power += data.get('power_mW', 0)
                    voltage = data.get('voltage_V', 0)
                    if voltage > 0:
                        avg_voltage += voltage
                        voltage_count += 1
            
            if voltage_count > 0:
                avg_voltage = avg_voltage / voltage_count
            
            # Display summary metrics
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.metric("Online Zones", f"{online_zones}/{total_zones}")
            
            with col2:
                st.metric("Total Current", f"{total_current:.1f} mA")
            
            with col3:
                st.metric("Average Voltage", f"{avg_voltage:.3f} V")
            
            with col4:
                st.metric("Total Power", f"{total_power:.1f} mW")
        
        # Raw data section
        st.markdown("---")
        st.subheader("📋 Raw Data")
        
        for zone_name, data in all_data.items():
            if data:
                with st.expander(f"View {zone_name} Raw JSON Data"):
                    st.json(data)
        
        # Connection info
        st.markdown("---")
        st.info("**API Endpoints:**")
        for zone_name, endpoint in ZONE_ENDPOINTS.items():
            status = "✅" if all_data.get(zone_name) else "❌"
            st.write(f"{status} {zone_name}: `{endpoint}`")
        
        # Display refresh information
        st.markdown(f"*Dashboard refreshes every {REFRESH_INTERVAL} seconds*")
        
        # Troubleshooting section
        if online_zones < total_zones:
            st.markdown("---")
            st.subheader("🔧 Troubleshooting")
            st.warning("Some zones are offline. Please check:")
            st.write("- FastAPI server is running on port 8000")
            st.write("- MQTT broker is running and accessible")
            st.write("- NodeMCU is powered on and connected to WiFi")
            st.write("- All INA219 sensors are properly connected")
            st.write("- Check NodeMCU serial output for error messages")
    
    # Auto-refresh mechanism
    time.sleep(REFRESH_INTERVAL)
    st.rerun()

if __name__ == "__main__":
    # Entry point for the Streamlit application
    # Note: This block won't execute when run with 'streamlit run dashboard.py'
    # but provides a fallback for direct execution
    print("Starting Node 1 Multi-Zone Dashboard...")
    print(f"Connect to: http://localhost:8501")
    print("API Endpoints:")
    for zone_name, endpoint in ZONE_ENDPOINTS.items():
        print(f"  {zone_name}: {endpoint}")
    main()
