#!/bin/bash

# Quick Setup Script for Microgrid Dashboard System
# Run this once to install all prerequisites

echo "🚀 Microgrid Dashboard System - Quick Setup"
echo "=========================================="

# Update system
echo "📦 Updating system packages..."
sudo apt update

# Install Python dependencies if not present
echo "🐍 Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "Installing Python3..."
    sudo apt install -y python3 python3-pip python3-venv
fi

# Install Node.js if not present
echo "📗 Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install Git if not present
echo "📚 Checking Git installation..."
if ! command -v git &> /dev/null; then
    echo "Installing Git..."
    sudo apt install -y git
fi

# Create virtual environment
echo "🔧 Setting up Python virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activate virtual environment and install Python packages
echo "📦 Installing Python dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Install MQTT broker (optional)
echo "🔌 Installing MQTT broker (Mosquitto)..."
sudo apt install -y mosquitto mosquitto-clients
sudo systemctl enable mosquitto
sudo systemctl start mosquitto

# Make scripts executable
echo "🔧 Setting up permissions..."
chmod +x start_system.py
chmod +x start_dev.sh
chmod +x start_system.sh
chmod +x quick_setup.sh

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🚀 To start the system, run:"
echo "   python3 start_system.py"
echo ""
echo "📖 For detailed instructions, see INSTALLATION_GUIDE.md"
echo "🔧 For development mode, run: ./start_dev.sh"
echo ""
