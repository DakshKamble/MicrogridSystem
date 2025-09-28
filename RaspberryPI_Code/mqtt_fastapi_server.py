#!/usr/bin/env python3
"""
Simple FastAPI server that receives MQTT messages and exposes them via REST API.
Designed for Raspberry Pi microgrid monitoring system.
"""

import json
import threading
import time
from datetime import datetime
from typing import Optional, Dict, Any

import paho.mqtt.client as mqtt
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn


class MQTTDataStore:
    """Thread-safe data store for MQTT messages."""
    
    def __init__(self):
        self._data: Dict[str, Any] = {}
        self._lock = threading.Lock()
    
    def update_data(self, node_id: str, zone_id: str, payload: Dict[str, Any]):
        """Update stored data for a specific node/zone combination."""
        key = f"{node_id}/{zone_id}"
        with self._lock:
            self._data[key] = {
                **payload,
                "received_at": datetime.now().isoformat()
            }
    
    def get_data(self, node_id: str, zone_id: str) -> Optional[Dict[str, Any]]:
        """Get stored data for a specific node/zone combination."""
        key = f"{node_id}/{zone_id}"
        with self._lock:
            return self._data.get(key)


# Global data store
data_store = MQTTDataStore()

# FastAPI app
app = FastAPI(
    title="Microgrid MQTT API",
    description="REST API for microgrid sensor data received via MQTT",
    version="1.0.0"
)

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


class MQTTClient:
    """MQTT client for subscribing to sensor data."""
    
    def __init__(self, broker_host: str = "localhost", broker_port: int = 1883):
        self.broker_host = broker_host
        self.broker_port = broker_port
        self.client = mqtt.Client()
        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message
        self.client.on_disconnect = self._on_disconnect
    
    def _on_connect(self, client, userdata, flags, rc):
        """Callback for when the client receives a CONNACK response from the server."""
        if rc == 0:
            print(f"✅ Connected to MQTT broker at {self.broker_host}:{self.broker_port}")
            # Subscribe to all zone topics
            topics = ["/node1/zone1", "/node1/zone2", "/node1/zone3"]
            for topic in topics:
                client.subscribe(topic)
                print(f"📡 Subscribed to topic: {topic}")
        else:
            print(f"❌ Failed to connect to MQTT broker. Return code: {rc}")
    
    def _on_message(self, client, userdata, msg):
        """Callback for when a PUBLISH message is received from the server."""
        try:
            # Decode the message payload
            payload_str = msg.payload.decode('utf-8')
            print(f"📨 Received MQTT message on topic '{msg.topic}': {payload_str}")
            
            # Parse JSON payload
            payload = json.loads(payload_str)
            
            # Validate required fields
            required_fields = ["node_id", "zone_id", "timestamp", "current_mA", "voltage_V", "power_mW"]
            missing_fields = [field for field in required_fields if field not in payload]
            
            if missing_fields:
                print(f"⚠️ Warning: Missing required fields in payload: {missing_fields}")
                return
            
            # Store the data
            node_id = payload["node_id"]
            zone_id = payload["zone_id"]
            data_store.update_data(node_id, zone_id, payload)
            
            print(f"💾 Stored data for {node_id}/{zone_id}: "
                  f"Current={payload['current_mA']}mA, "
                  f"Voltage={payload['voltage_V']}V, "
                  f"Power={payload['power_mW']}mW")
            
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing JSON payload: {e}")
        except Exception as e:
            print(f"❌ Error processing MQTT message: {e}")
    
    def _on_disconnect(self, client, userdata, rc):
        """Callback for when the client disconnects from the server."""
        print(f"📡 Disconnected from MQTT broker. Return code: {rc}")
    
    def start(self):
        """Start the MQTT client."""
        try:
            print(f"🔌 Connecting to MQTT broker at {self.broker_host}:{self.broker_port}...")
            self.client.connect(self.broker_host, self.broker_port, 60)
            # Start the network loop in a separate thread
            self.client.loop_start()
        except Exception as e:
            print(f"❌ Error starting MQTT client: {e}")
    
    def stop(self):
        """Stop the MQTT client."""
        self.client.loop_stop()
        self.client.disconnect()


# Global MQTT client
mqtt_client = MQTTClient()


@app.on_event("startup")
async def startup_event():
    """Initialize MQTT client when FastAPI starts."""
    print("🚀 Starting Microgrid MQTT API server...")
    mqtt_client.start()
    # Give MQTT client a moment to connect
    time.sleep(1)


@app.on_event("shutdown")
async def shutdown_event():
    """Clean up MQTT client when FastAPI shuts down."""
    print("🛑 Shutting down Microgrid MQTT API server...")
    mqtt_client.stop()


@app.get("/")
async def root():
    """Root endpoint with basic API information."""
    return {
        "message": "Microgrid MQTT API",
        "version": "1.0.0",
        "endpoints": {
            "zone1_data": "/api/v1/node1/zone1",
            "zone2_data": "/api/v1/node1/zone2", 
            "zone3_data": "/api/v1/node1/zone3",
            "status": "/api/v1/status",
            "docs": "/docs",
            "redoc": "/redoc"
        }
    }


@app.get("/api/v1/node1/zone1")
async def get_node1_zone1_data():
    """Get the latest sensor data for node1/zone1."""
    data = data_store.get_data("node1", "zone1")
    
    if data is None:
        raise HTTPException(
            status_code=404, 
            detail="No data available for node1/zone1. Check if MQTT messages are being received."
        )
    
    return data


@app.get("/api/v1/node1/zone2")
async def get_node1_zone2_data():
    """Get the latest sensor data for node1/zone2."""
    data = data_store.get_data("node1", "zone2")
    
    if data is None:
        raise HTTPException(
            status_code=404, 
            detail="No data available for node1/zone2. Check if MQTT messages are being received."
        )
    
    return data


@app.get("/api/v1/node1/zone3")
async def get_node1_zone3_data():
    """Get the latest sensor data for node1/zone3."""
    data = data_store.get_data("node1", "zone3")
    
    if data is None:
        raise HTTPException(
            status_code=404, 
            detail="No data available for node1/zone3. Check if MQTT messages are being received."
        )
    
    return data


@app.get("/api/v1/status")
async def get_status():
    """Get API status and basic statistics."""
    # Check if we have data for all zones
    node1_zone1_data = data_store.get_data("node1", "zone1")
    node1_zone2_data = data_store.get_data("node1", "zone2")
    node1_zone3_data = data_store.get_data("node1", "zone3")
    
    return {
        "status": "running",
        "mqtt_broker": f"{mqtt_client.broker_host}:{mqtt_client.broker_port}",
        "subscribed_topics": ["/node1/zone1", "/node1/zone2", "/node1/zone3"],
        "data_available": {
            "node1/zone1": node1_zone1_data is not None,
            "node1/zone2": node1_zone2_data is not None,
            "node1/zone3": node1_zone3_data is not None
        },
        "last_updates": {
            "node1/zone1": node1_zone1_data.get("received_at") if node1_zone1_data else None,
            "node1/zone2": node1_zone2_data.get("received_at") if node1_zone2_data else None,
            "node1/zone3": node1_zone3_data.get("received_at") if node1_zone3_data else None
        }
    }


if __name__ == "__main__":
    print("🔧 Starting in development mode...")
    print("📝 Access API documentation at: http://localhost:8000/docs")
    print("🌐 Zone APIs available at:")
    print("   - Zone 1: http://localhost:8000/api/v1/node1/zone1")
    print("   - Zone 2: http://localhost:8000/api/v1/node1/zone2") 
    print("   - Zone 3: http://localhost:8000/api/v1/node1/zone3")
    print("📊 Check status at: http://localhost:8000/api/v1/status")
    print("🛑 Press Ctrl+C to stop the server")
    
    # Run the FastAPI server
    uvicorn.run(
        "mqtt_fastapi_server:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )
