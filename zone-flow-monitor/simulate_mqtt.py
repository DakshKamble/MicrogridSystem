#!/usr/bin/env python3
"""
MQTT Data Simulator for Microgrid Dashboard
Simulates NodeMCU sensor data for testing purposes on PC
"""

import json
import time
import random
import threading
from datetime import datetime
import paho.mqtt.client as mqtt

class MQTTSimulator:
    def __init__(self, broker_host="localhost", broker_port=1883):
        self.broker_host = broker_host
        self.broker_port = broker_port
        self.client = mqtt.Client()
        self.client.on_connect = self._on_connect
        self.client.on_disconnect = self._on_disconnect
        self.is_running = False
        
    def _on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print(f"✅ Connected to MQTT broker at {self.broker_host}:{self.broker_port}")
        else:
            print(f"❌ Failed to connect to MQTT broker. Return code: {rc}")
    
    def _on_disconnect(self, client, userdata, rc):
        print(f"📡 Disconnected from MQTT broker. Return code: {rc}")
    
    def simulate_sensor_data(self):
        """Generate realistic sensor data similar to NodeMCU"""
        # Simulate realistic microgrid values
        base_current = 1200  # Base current in mA
        base_voltage = 15.0  # Base voltage in V
        
        # Add some realistic variation
        current_variation = random.uniform(-300, 500)  # ±300-500mA variation
        voltage_variation = random.uniform(-2.0, 5.0)  # ±2-5V variation
        
        current_mA = max(100, base_current + current_variation)  # Minimum 100mA
        voltage_V = max(5.0, base_voltage + voltage_variation)   # Minimum 5V
        power_mW = current_mA * voltage_V  # Calculate power
        
        return {
            "node_id": "node1",
            "zone_id": "zone1",
            "timestamp": datetime.now().isoformat() + "Z",
            "current_mA": round(current_mA, 1),
            "voltage_V": round(voltage_V, 2),
            "power_mW": round(power_mW, 1)
        }
    
    def simulate_disconnect_scenario(self):
        """Simulate NodeMCU disconnect scenario for testing"""
        print("[DISCONNECT] Simulating NodeMCU disconnect...")
        print("[DISCONNECT] No data will be sent for 30 seconds to test disconnect detection")
        time.sleep(30)
        print("[DISCONNECT] Reconnecting NodeMCU simulation...")
    
    def start_simulation(self, interval=3, include_disconnect_test=False):
        """Start sending simulated data"""
        try:
            self.client.connect(self.broker_host, self.broker_port, 60)
            self.client.loop_start()
            
            print("[SIMULATOR] Starting MQTT data simulation...")
            print(f"[SIMULATOR] Publishing to topic: /node1/zone1")
            print(f"[SIMULATOR] Sending data every {interval} seconds")
            print("[SIMULATOR] Press Ctrl+C to stop")
            print("-" * 50)
            
            self.is_running = True
            message_count = 0
            
            while self.is_running:
                # Generate and send data
                data = self.simulate_sensor_data()
                payload = json.dumps(data)
                
                result = self.client.publish("/node1/zone1", payload)
                message_count += 1
                
                if result.rc == mqtt.MQTT_ERR_SUCCESS:
                    print(f"[SENT] Message {message_count}: "
                          f"Current={data['current_mA']}mA, "
                          f"Voltage={data['voltage_V']}V, "
                          f"Power={data['power_mW']}mW")
                else:
                    print(f"[ERROR] Failed to send message {message_count}")
                
                # Optional disconnect test after 20 messages
                if include_disconnect_test and message_count == 20:
                    self.simulate_disconnect_scenario()
                
                time.sleep(interval)
                
        except KeyboardInterrupt:
            print("\n[STOP] Simulation stopped by user")
        except Exception as e:
            print(f"[ERROR] Error during simulation: {e}")
        finally:
            self.stop_simulation()
    
    def stop_simulation(self):
        """Stop the simulation"""
        self.is_running = False
        self.client.loop_stop()
        self.client.disconnect()
        print("[OK] MQTT simulation stopped")

def main():
    """Main entry point"""
    print("Microgrid MQTT Data Simulator")
    print("=" * 40)
    
    # Configuration
    BROKER_HOST = "localhost"  # Change to "test.mosquitto.org" for online broker
    BROKER_PORT = 1883
    SEND_INTERVAL = 3  # seconds
    
    print(f"Configuration:")
    print(f"   MQTT Broker: {BROKER_HOST}:{BROKER_PORT}")
    print(f"   Send Interval: {SEND_INTERVAL} seconds")
    print(f"   Topic: /node1/zone1")
    print()
    
    # Ask user for options
    try:
        print("Options:")
        print("1. Normal simulation (default)")
        print("2. Include disconnect test (stops sending data for 30s after 20 messages)")
        choice = input("Choose option (1 or 2, press Enter for default): ").strip()
        
        include_disconnect = choice == "2"
        
        # Create and start simulator
        simulator = MQTTSimulator(BROKER_HOST, BROKER_PORT)
        simulator.start_simulation(SEND_INTERVAL, include_disconnect)
        
    except KeyboardInterrupt:
        print("\n[EXIT] Exiting...")
    except Exception as e:
        print(f"[ERROR] Error: {e}")

if __name__ == "__main__":
    main()
