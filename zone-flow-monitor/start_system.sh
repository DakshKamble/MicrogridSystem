#!/bin/bash

# Microgrid Dashboard Startup Script for Raspberry Pi
# This script starts both the MQTT FastAPI server and the React frontend

echo "🚀 Starting Microgrid Dashboard System..."

# Get the RPi IP address
RPI_IP=$(hostname -I | awk '{print $1}')
echo "📍 Raspberry Pi IP Address: $RPI_IP"

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start the FastAPI backend server
echo "🔧 Starting MQTT FastAPI Server on port 8000..."
python3 mqtt_fastapi_server.py &
BACKEND_PID=$!

# Wait a moment for the backend to start
sleep 3

# Build the React frontend for production
echo "🏗️  Building React frontend..."
npm run build

# Start a simple HTTP server for the frontend
echo "🌐 Starting frontend server on port 8080..."
cd dist
python3 -m http.server 8080 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ System started successfully!"
echo ""
echo "📊 Dashboard URL: http://$RPI_IP:8080"
echo "🔌 API Server: http://$RPI_IP:8000"
echo "📝 API Docs: http://$RPI_IP:8000/docs"
echo ""
echo "🌍 Access the dashboard from your main PC using: http://$RPI_IP:8080"
echo ""
echo "🛑 Press Ctrl+C to stop all services"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
