#!/usr/bin/env python3
"""
Microgrid System Backend
Connects to MQTT broker to receive sensor data from ESP8266
Serves data to Next.js frontend via FastAPI
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional
import paho.mqtt.client as mqtt
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MQTT Configuration
MQTT_BROKER = "10.237.57.45"  # Raspberry Pi IP
MQTT_PORT = 1883
MQTT_CLIENT_ID = "microgrid_backend"

# MQTT Topics (matching ESP code)
TOPICS = {
    "bus_voltage": "microgrid/sensor/bus_voltage",
    "shunt_voltage": "microgrid/sensor/shunt_voltage", 
    "load_voltage": "microgrid/sensor/load_voltage",
    "current": "microgrid/sensor/current",
    "power": "microgrid/sensor/power",
    "status": "microgrid/sensor/status"
}

# Global data storage
sensor_data = {
    "bus_voltage": 0.0,
    "shunt_voltage": 0.0,
    "load_voltage": 0.0,
    "current": 0.0,
    "power": 0.0,
    "status": "offline",
    "last_updated": None,
    "timestamp": None
}

# Pydantic models for API responses
class SensorData(BaseModel):
    bus_voltage: float
    shunt_voltage: float
    load_voltage: float
    current: float
    power: float
    status: str
    last_updated: Optional[str] = None
    timestamp: Optional[str] = None

class SystemStatus(BaseModel):
    solar_generation: float
    wind_generation: float
    total_output: float
    efficiency: float
    battery_level: float
    battery_capacity: float
    battery_available: float

class ZoneData(BaseModel):
    residential: Dict[str, Any]
    commercial: Dict[str, Any]
    industrial: Dict[str, Any]
    backup: Dict[str, Any]

# MQTT Client Setup
class MQTTClient:
    def __init__(self):
        self.client = mqtt.Client(MQTT_CLIENT_ID)
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.client.on_disconnect = self.on_disconnect
        
    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            logger.info("Connected to MQTT broker successfully")
            # Subscribe to all sensor topics
            for topic in TOPICS.values():
                client.subscribe(topic)
                logger.info(f"Subscribed to topic: {topic}")
        else:
            logger.error(f"Failed to connect to MQTT broker. Return code: {rc}")
    
    def on_message(self, client, userdata, msg):
        try:
            topic = msg.topic
            payload = msg.payload.decode('utf-8')
            
            # Update sensor data based on topic
            if topic == TOPICS["bus_voltage"]:
                sensor_data["bus_voltage"] = float(payload)
            elif topic == TOPICS["shunt_voltage"]:
                sensor_data["shunt_voltage"] = float(payload)
            elif topic == TOPICS["load_voltage"]:
                sensor_data["load_voltage"] = float(payload)
            elif topic == TOPICS["current"]:
                sensor_data["current"] = float(payload)
            elif topic == TOPICS["power"]:
                sensor_data["power"] = float(payload)
            elif topic == TOPICS["status"]:
                sensor_data["status"] = payload
            
            # Update timestamp
            sensor_data["last_updated"] = datetime.now().isoformat()
            sensor_data["timestamp"] = datetime.now().strftime("%H:%M:%S")
            
            logger.info(f"Updated sensor data from {topic}: {payload}")
            
        except Exception as e:
            logger.error(f"Error processing MQTT message: {e}")
    
    def on_disconnect(self, client, userdata, rc):
        logger.warning(f"Disconnected from MQTT broker. Return code: {rc}")
    
    def connect(self):
        try:
            self.client.connect(MQTT_BROKER, MQTT_PORT, 60)
            self.client.loop_start()
            logger.info(f"Connecting to MQTT broker at {MQTT_BROKER}:{MQTT_PORT}")
        except Exception as e:
            logger.error(f"Failed to connect to MQTT broker: {e}")
    
    def disconnect(self):
        self.client.loop_stop()
        self.client.disconnect()

# Initialize FastAPI app
app = FastAPI(
    title="Microgrid System API",
    description="Backend API for renewable energy dashboard",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MQTT client
mqtt_client = MQTTClient()

# API Endpoints
@app.get("/")
async def root():
    return {"message": "Microgrid System Backend API", "status": "running"}

@app.get("/api/sensor-data", response_model=SensorData)
async def get_sensor_data():
    """Get current sensor data from ESP8266"""
    return SensorData(**sensor_data)

@app.get("/api/system-status", response_model=SystemStatus)
async def get_system_status():
    """Get calculated system status based on sensor data"""
    # Calculate system metrics based on sensor data
    # These are example calculations - adjust based on your actual system
    
    # Convert current from mA to A and power from mW to W
    current_a = sensor_data["current"] / 1000.0
    power_w = sensor_data["power"] / 1000.0
    
    # Calculate solar and wind generation (example logic)
    # In a real system, you'd have separate sensors for each source
    solar_generation = power_w * 0.7  # Assume 70% from solar
    wind_generation = power_w * 0.3   # Assume 30% from wind
    total_output = solar_generation + wind_generation
    
    # Calculate efficiency (example: based on voltage stability)
    efficiency = min(100, max(0, (sensor_data["load_voltage"] / 12.0) * 100))
    
    # Battery calculations (example)
    battery_capacity = 24.5  # kWh
    battery_level = min(100, max(0, (sensor_data["bus_voltage"] / 14.4) * 100))
    battery_available = (battery_capacity * battery_level) / 100
    
    return SystemStatus(
        solar_generation=round(solar_generation, 1),
        wind_generation=round(wind_generation, 1),
        total_output=round(total_output, 1),
        efficiency=round(efficiency, 1),
        battery_level=round(battery_level, 1),
        battery_capacity=battery_capacity,
        battery_available=round(battery_available, 1)
    )

@app.get("/api/zones", response_model=ZoneData)
async def get_zones():
    """Get distribution zone data"""
    # Calculate zone loads based on current sensor data
    total_current = sensor_data["current"] / 1000.0  # Convert to A
    total_power = sensor_data["power"] / 1000.0      # Convert to W
    
    # Distribute load across zones (example distribution)
    residential_load = total_power * 0.4
    commercial_load = total_power * 0.25
    industrial_load = total_power * 0.3
    backup_load = total_power * 0.05
    
    return ZoneData(
        residential={
            "load": round(residential_load, 1),
            "active": True,
            "current": round(total_current * 0.4, 2)
        },
        commercial={
            "load": round(commercial_load, 1),
            "active": False,
            "current": round(total_current * 0.25, 2)
        },
        industrial={
            "load": round(industrial_load, 1),
            "active": True,
            "current": round(total_current * 0.3, 2)
        },
        backup={
            "load": round(backup_load, 1),
            "active": False,
            "current": round(total_current * 0.05, 2)
        }
    )

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "mqtt_connected": mqtt_client.client.is_connected(),
        "sensor_status": sensor_data["status"],
        "last_update": sensor_data["last_updated"]
    }

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize MQTT connection on startup"""
    logger.info("Starting Microgrid System Backend...")
    mqtt_client.connect()
    await asyncio.sleep(1)  # Give MQTT time to connect

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up MQTT connection on shutdown"""
    logger.info("Shutting down Microgrid System Backend...")
    mqtt_client.disconnect()

if __name__ == "__main__":
    logger.info("Starting Microgrid System Backend Server...")
    uvicorn.run(
        "backend:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
