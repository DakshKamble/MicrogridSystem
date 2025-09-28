# 💻 Microgrid Dashboard - PC Development Guide

This guide will help you run the complete Microgrid Dashboard System on your Windows PC for development and testing.

## 📋 Prerequisites for Windows PC

### Required Software

#### 1. Python 3.7+
```bash
# Download from: https://www.python.org/downloads/
# Make sure to check "Add Python to PATH" during installation
python --version
```

#### 2. Node.js 16+ and npm
```bash
# Download from: https://nodejs.org/en/download/
# This includes npm automatically
node --version
npm --version
```

#### 3. Git (Optional but recommended)
```bash
# Download from: https://git-scm.com/download/win
git --version
```

#### 4. MQTT Broker (for testing)
**Option A: Eclipse Mosquitto (Recommended)**
```bash
# Download from: https://mosquitto.org/download/
# Install and start the service
# Default runs on localhost:1883
```

**Option B: Use online MQTT broker (for testing)**
- Edit `mqtt_fastapi_server.py` to use: `test.mosquitto.org` (port 1883)
- Or use any free online MQTT broker

## 🚀 Quick Start on PC

### Step 1: Install Python Dependencies
```bash
# Open Command Prompt or PowerShell in your project directory
cd C:\development\SIH\MicrogridSystem\zone-flow-monitor

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# For Command Prompt:
venv\Scripts\activate
# For PowerShell:
venv\Scripts\Activate.ps1

# Install Python packages
pip install -r requirements.txt
```

### Step 2: Install Node.js Dependencies
```bash
# Install frontend dependencies
npm install
```

### Step 3: Start the System

#### Option A: Use the Python Startup Script
```bash
# Make sure virtual environment is activated
venv\Scripts\activate

# Run the startup script
python start_system.py
```

#### Option B: Manual Start (Development Mode)
```bash
# Terminal 1 - Start Backend
python mqtt_fastapi_server.py

# Terminal 2 - Start Frontend (in a new terminal)
npm run dev
```

### Step 4: Access the Dashboard
- **Dashboard**: http://localhost:8080
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🔧 Development Workflow

### For Active Development
```bash
# Terminal 1 - Backend with auto-reload
python mqtt_fastapi_server.py

# Terminal 2 - Frontend with hot reload
npm run dev
```

### For Testing Production Build
```bash
# Build frontend
npm run build

# Start both services
python start_system.py
```

## 📡 Testing MQTT Functionality

### Option 1: Using Local Mosquitto Broker

#### Install Mosquitto on Windows
1. Download from: https://mosquitto.org/download/
2. Install and start the service
3. Test with command line tools:

```bash
# Test publishing (in Command Prompt)
mosquitto_pub -h localhost -t "/node1/zone1" -m "{\"node_id\": \"node1\", \"zone_id\": \"zone1\", \"timestamp\": \"2023-12-01T10:30:00Z\", \"current_mA\": 1500, \"voltage_V\": 12.5, \"power_mW\": 18750}"

# Test subscribing (in another terminal)
mosquitto_sub -h localhost -t "/node1/zone1"
```

### Option 2: Using Online MQTT Broker

Edit `mqtt_fastapi_server.py` line 65:
```python
# Change from:
def __init__(self, broker_host: str = "localhost", broker_port: int = 1883):

# To:
def __init__(self, broker_host: str = "test.mosquitto.org", broker_port: int = 1883):
```

### Option 3: Simulate MQTT Data with Python Script

Create `simulate_mqtt.py`:
```python
import json
import time
import random
from datetime import datetime
import paho.mqtt.client as mqtt

def simulate_sensor_data():
    """Simulate NodeMCU sensor data"""
    return {
        "node_id": "node1",
        "zone_id": "zone1",
        "timestamp": datetime.now().isoformat() + "Z",
        "current_mA": random.randint(500, 2500),  # 0.5A to 2.5A
        "voltage_V": round(random.uniform(10.0, 25.0), 2),  # 10V to 25V
        "power_mW": random.randint(5000, 18000)  # 5W to 18W
    }

def main():
    client = mqtt.Client()
    client.connect("localhost", 1883, 60)
    
    print("🔄 Starting MQTT data simulation...")
    print("📡 Publishing to topic: /node1/zone1")
    print("🛑 Press Ctrl+C to stop")
    
    try:
        while True:
            data = simulate_sensor_data()
            payload = json.dumps(data)
            client.publish("/node1/zone1", payload)
            print(f"📤 Sent: Current={data['current_mA']}mA, Voltage={data['voltage_V']}V, Power={data['power_mW']}mW")
            time.sleep(5)  # Send data every 5 seconds
    except KeyboardInterrupt:
        print("\n🛑 Simulation stopped")
        client.disconnect()

if __name__ == "__main__":
    main()
```

Run the simulator:
```bash
python simulate_mqtt.py
```

## 📁 Project Structure on PC
```
C:\development\SIH\MicrogridSystem\zone-flow-monitor\
├── mqtt_fastapi_server.py          # Backend API server
├── start_system.py                 # Combined startup script
├── requirements.txt                # Python dependencies
├── package.json                    # Node.js dependencies
├── simulate_mqtt.py                # MQTT data simulator (create this)
├── src\                            # React frontend source
├── dist\                           # Built frontend (after npm run build)
├── venv\                           # Python virtual environment
└── node_modules\                   # Node.js dependencies
```

## 🐛 Troubleshooting on PC

### Common Issues and Solutions

#### 1. Python Virtual Environment Issues
```bash
# If activation fails in PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then try again
venv\Scripts\Activate.ps1
```

#### 2. Port Already in Use
```bash
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

#### 3. MQTT Connection Issues
```bash
# Check if Mosquitto is running
sc query mosquitto

# Start Mosquitto service
net start mosquitto

# Or use online broker by editing mqtt_fastapi_server.py
```

#### 4. Node.js Permission Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rmdir /s node_modules
del package-lock.json
npm install
```

#### 5. Firewall Issues
- Windows Defender might block the servers
- Allow Python and Node.js through firewall when prompted
- Or temporarily disable firewall for testing

### Performance Tips for PC Development

1. **Use SSD** for better I/O performance
2. **Close unnecessary applications** to free up RAM
3. **Use Windows Terminal** for better command line experience
4. **Enable WSL2** for better Linux compatibility (optional)

## 🔄 Development Workflow

### Day-to-Day Development
1. **Start in development mode**:
   ```bash
   # Terminal 1
   venv\Scripts\activate
   python mqtt_fastapi_server.py
   
   # Terminal 2
   npm run dev
   ```

2. **Test with simulated data**:
   ```bash
   # Terminal 3
   python simulate_mqtt.py
   ```

3. **Access dashboard**: http://localhost:8080

### Testing Production Build
1. **Build and test**:
   ```bash
   python start_system.py
   ```

2. **Test on network**:
   - Find your PC's IP: `ipconfig`
   - Access from phone/tablet: `http://[PC-IP]:8080`

## 📊 Monitoring During Development

### Check System Status
```bash
# View API status
curl http://localhost:8000/api/v1/status

# View latest data
curl http://localhost:8000/api/v1/node1/zone1

# Check processes
tasklist | findstr python
tasklist | findstr node
```

### View Logs
- Backend logs appear in the terminal running `mqtt_fastapi_server.py`
- Frontend logs appear in browser developer console (F12)
- Network requests visible in browser Network tab

## 🚀 Ready for RPi Deployment

Once everything works on your PC:

1. **Test production build**: `python start_system.py`
2. **Verify network access**: Test from another device on your network
3. **Document any configuration changes** you made
4. **Prepare for RPi transfer**: Copy all files to RPi and follow the RPi installation guide

## 📝 Quick Commands Reference

```bash
# Setup (one time)
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
npm install

# Development mode
python mqtt_fastapi_server.py        # Terminal 1
npm run dev                          # Terminal 2
python simulate_mqtt.py              # Terminal 3 (optional)

# Production test
python start_system.py

# Access points
# Dashboard: http://localhost:8080
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```
