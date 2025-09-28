# 🚀 Microgrid Dashboard System - Installation Guide

This guide will help you set up the complete Microgrid Dashboard System on your Raspberry Pi.

## 📋 Prerequisites

### System Requirements
- **Raspberry Pi** (3B+ or newer recommended)
- **Raspberry Pi OS** (latest version)
- **Internet connection** for installing dependencies
- **4GB+ SD card** (8GB+ recommended)

### Required Software

#### 1. Python 3.7+
```bash
# Usually pre-installed on Raspberry Pi OS
python3 --version

# If not installed or outdated:
sudo apt update
sudo apt install python3 python3-pip python3-venv
```

#### 2. Node.js 16+ and npm
```bash
# Install Node.js via NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### 3. Git (for cloning the repository)
```bash
sudo apt install git
```

## 🔧 Installation Steps

### Step 1: Clone or Copy the Project
```bash
# If using Git:
git clone <your-repository-url>
cd zone-flow-monitor

# Or copy your project files to the Raspberry Pi
```

### Step 2: Install Python Dependencies
```bash
# Create a virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate

# Install Python packages
pip install -r requirements.txt
```

### Step 3: Install Node.js Dependencies
```bash
# Install frontend dependencies
npm install
```

### Step 4: Make the Startup Script Executable
```bash
chmod +x start_system.py
```

### Step 5: Test the Installation
```bash
# Run the system startup script
python3 start_system.py
```

## 🏃‍♂️ Running the System

### Production Mode (Recommended for RPi)
```bash
python3 start_system.py
```

### Development Mode (for testing)
```bash
./start_dev.sh
```

### Alternative: Manual Start
```bash
# Terminal 1 - Start backend
python3 mqtt_fastapi_server.py

# Terminal 2 - Start frontend (development)
npm run dev

# Or build and serve production frontend
npm run build
cd dist && python3 -m http.server 8080
```

## 🌐 Accessing the Dashboard

Once started, you can access the dashboard from:

- **Local (on RPi)**: http://localhost:8080
- **From other devices**: http://[RPi-IP]:8080
- **API Documentation**: http://[RPi-IP]:8000/docs

To find your Raspberry Pi's IP address:
```bash
hostname -I
```

## 🔌 MQTT Broker Setup

### Install Mosquitto MQTT Broker (if needed)
```bash
sudo apt update
sudo apt install mosquitto mosquitto-clients

# Start the service
sudo systemctl start mosquitto
sudo systemctl enable mosquitto

# Test the broker
mosquitto_pub -h localhost -t test -m "Hello MQTT"
mosquitto_sub -h localhost -t test
```

## 🚀 Auto-Start on Boot (Optional)

To automatically start the system when the Raspberry Pi boots:

### Method 1: Using systemd (Recommended)
```bash
# Create a service file
sudo nano /etc/systemd/system/microgrid-dashboard.service
```

Add this content:
```ini
[Unit]
Description=Microgrid Dashboard System
After=network.target

[Service]
Type=exec
User=pi
WorkingDirectory=/home/pi/zone-flow-monitor
ExecStart=/home/pi/zone-flow-monitor/venv/bin/python /home/pi/zone-flow-monitor/start_system.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable the service:
```bash
sudo systemctl enable microgrid-dashboard.service
sudo systemctl start microgrid-dashboard.service

# Check status
sudo systemctl status microgrid-dashboard.service
```

### Method 2: Using crontab
```bash
# Edit crontab
crontab -e

# Add this line (adjust path as needed)
@reboot cd /home/pi/zone-flow-monitor && /home/pi/zone-flow-monitor/venv/bin/python start_system.py
```

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 8000 or 8080
sudo lsof -i :8000
sudo lsof -i :8080

# Kill the process
sudo kill -9 <PID>
```

#### Permission Denied
```bash
# Make scripts executable
chmod +x start_system.py
chmod +x start_dev.sh
chmod +x start_system.sh
```

#### Node.js/npm Issues
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Python Import Errors
```bash
# Activate virtual environment
source venv/bin/activate

# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

### View Logs
```bash
# If using systemd
journalctl -u microgrid-dashboard.service -f

# Manual run with verbose output
python3 start_system.py
```

## 📱 Testing with NodeMCU

Send test MQTT messages to verify the system:

```bash
# Install MQTT client tools
sudo apt install mosquitto-clients

# Send test data
mosquitto_pub -h localhost -t "/node1/zone1" -m '{
    "node_id": "node1",
    "zone_id": "zone1", 
    "timestamp": "2023-12-01T10:30:00Z",
    "current_mA": 1500,
    "voltage_V": 12.5,
    "power_mW": 18750
}'
```

## 📊 System Monitoring

### Check System Resources
```bash
# CPU and memory usage
htop

# Disk space
df -h

# Network connections
netstat -tulnp | grep :8000
netstat -tulnp | grep :8080
```

### Performance Tips for Raspberry Pi
1. Use a fast SD card (Class 10 or better)
2. Enable GPU memory split: `sudo raspi-config` → Advanced → Memory Split → 16
3. Disable unnecessary services to free up RAM
4. Consider using a USB 3.0 drive for better I/O performance

## 🆘 Support

If you encounter issues:

1. Check the logs for error messages
2. Verify all prerequisites are installed correctly
3. Ensure the MQTT broker is running
4. Check network connectivity
5. Verify file permissions

For additional help, check the system output when running `python3 start_system.py` - it will show detailed status information.
