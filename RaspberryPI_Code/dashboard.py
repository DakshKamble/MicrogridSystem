#!/usr/bin/env python3
"""
Simple Streamlit Dashboard for Microgrid Node 1
===============================================

This dashboard fetches and displays real-time sensor data from Node 1 (Zone 1)
of the microgrid system. It connects to the FastAPI backend running on the same
Raspberry Pi and updates automatically every 5 seconds.

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
API_ENDPOINT = f"{API_BASE_URL}/api/v1/node1/zone1"
REFRESH_INTERVAL = 5  # seconds

# Page configuration
st.set_page_config(
    page_title="Node 1 Dashboard",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="collapsed"
)

def fetch_node1_data():
    """
    Fetch the latest sensor data from Node 1, Zone 1.
    
    This function makes an HTTP GET request to the FastAPI backend endpoint
    '/api/v1/node1/zone1' and returns the JSON response containing:
    - node_id: Identifier for the node
    - zone_id: Identifier for the zone
    - timestamp: Unix timestamp of the measurement
    - current_mA: Current in milliamperes
    - voltage_V: Voltage in volts
    - power_mW: Power in milliwatts
    
    Returns:
        dict: JSON response from the API, or None if error occurs
    """
    try:
        response = requests.get(API_ENDPOINT, timeout=10)
        response.raise_for_status()  # Raises an HTTPError for bad responses
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"Error fetching data: {e}")
        return None
    except json.JSONDecodeError:
        st.error("Error: Invalid JSON response from server")
        return None

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

def main():
    """
    Main dashboard function that creates the layout and handles data display.
    
    This function:
    1. Sets up the dashboard header and layout
    2. Fetches data from the API endpoint
    3. Displays the data in organized cards
    4. Handles auto-refresh functionality
    """
    # Dashboard header
    st.title("⚡ Microgrid Node 1 Dashboard")
    st.markdown("**Real-time sensor data from Node 1, Zone 1**")
    st.markdown("---")
    
    # Create placeholder for dynamic content
    # This allows us to update the content without rerunning the entire app
    placeholder = st.empty()
    
    # Auto-refresh container
    with placeholder.container():
        # Fetch the latest data from the FastAPI backend
        data = fetch_node1_data()
        
        if data:
            # Display connection status
            st.success("🟢 Connected to Node 1")
            
            # Create columns for better layout
            col1, col2 = st.columns(2)
            
            with col1:
                st.subheader("📍 Node Information")
                # Display node and zone information
                st.info(f"**Node ID:** {data.get('node_id', 'N/A')}")
                st.info(f"**Zone ID:** {data.get('zone_id', 'N/A')}")
                
                # Format and display timestamp
                timestamp = data.get('timestamp', 0)
                formatted_time = format_timestamp(timestamp)
                st.info(f"**Last Update:** {formatted_time}")
            
            with col2:
                st.subheader("📊 Sensor Readings")
                # Display current measurement
                current_ma = data.get('current_mA', 0)
                display_data_card("Current", f"{current_ma:.1f}", "mA", "🔌")
                
                # Display voltage measurement
                voltage_v = data.get('voltage_V', 0)
                display_data_card("Voltage", f"{voltage_v:.3f}", "V", "⚡")
                
                # Display power measurement
                power_mw = data.get('power_mW', 0)
                display_data_card("Power", f"{power_mw:.1f}", "mW", "⚙️")
            
            # Additional information section
            st.markdown("---")
            st.subheader("📋 Raw Data")
            with st.expander("View Raw JSON Data"):
                st.json(data)
            
            # Display refresh information
            st.markdown(f"*Dashboard refreshes every {REFRESH_INTERVAL} seconds*")
            
        else:
            # Display error state when no data is available
            st.error("🔴 Unable to connect to Node 1")
            st.warning("Please check that:")
            st.write("- FastAPI server is running on port 8000")
            st.write("- MQTT messages are being received")
            st.write("- Node 1 is sending data to Zone 1")
            
            # Show API endpoint for debugging
            st.info(f"**API Endpoint:** {API_ENDPOINT}")
    
    # Auto-refresh mechanism
    # This ensures the dashboard updates automatically every 5 seconds
    time.sleep(REFRESH_INTERVAL)
    st.rerun()

if __name__ == "__main__":
    # Entry point for the Streamlit application
    # Note: This block won't execute when run with 'streamlit run dashboard.py'
    # but provides a fallback for direct execution
    print("Starting Node 1 Dashboard...")
    print(f"Connect to: http://localhost:8501")
    print(f"API Endpoint: {API_ENDPOINT}")
    main()
