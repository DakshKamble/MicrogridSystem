#!/bin/bash

# Startup script for Microgrid Dashboard and FastAPI Server on Raspberry Pi
# This script starts both the FastAPI backend and Next.js dashboard

echo "🚀 Starting Microgrid Services on Raspberry Pi"
echo "================================================"

# Check if we're in the right directory
if [ ! -f "mqtt_fastapi_server.py" ]; then
    echo "❌ Error: mqtt_fastapi_server.py not found in current directory"
    echo "Please run this script from the RaspberryPI_Code directory"
    exit 1
fi

# Function to cleanup background processes
cleanup() {
    echo "🛑 Stopping services..."
    if [ ! -z "$FASTAPI_PID" ]; then
        kill $FASTAPI_PID 2>/dev/null
        echo "   ✅ FastAPI server stopped"
    fi
    if [ ! -z "$NEXTJS_PID" ]; then
        kill $NEXTJS_PID 2>/dev/null
        echo "   ✅ Next.js dashboard stopped"
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start FastAPI server in background
echo "🔧 Starting FastAPI server..."
if [ -d "venv" ]; then
    source venv/bin/activate
    uvicorn mqtt_fastapi_server:app --host 0.0.0.0 --port 8000 &
    FASTAPI_PID=$!
    echo "   ✅ FastAPI server started (PID: $FASTAPI_PID)"
else
    echo "   ⚠️ Virtual environment not found, using system Python"
    python3 -m uvicorn mqtt_fastapi_server:app --host 0.0.0.0 --port 8000 &
    FASTAPI_PID=$!
    echo "   ✅ FastAPI server started (PID: $FASTAPI_PID)"
fi

# Wait a moment for FastAPI to start
sleep 3

# Test FastAPI server
echo "🧪 Testing FastAPI server..."
if curl -s http://localhost:8000/api/v1/status > /dev/null; then
    echo "   ✅ FastAPI server is responding"
else
    echo "   ❌ FastAPI server is not responding"
    echo "   Check the logs above for errors"
fi

# Start Next.js dashboard
echo "🌐 Starting Next.js dashboard..."
if [ -d "node_modules" ]; then
    npm run dev &
    NEXTJS_PID=$!
    echo "   ✅ Next.js dashboard started (PID: $NEXTJS_PID)"
else
    echo "   ❌ Error: node_modules not found"
    echo "   Please run 'npm install' first"
    cleanup
    exit 1
fi

# Wait a moment for Next.js to start
sleep 5

echo ""
echo "🎉 All services started successfully!"
echo "================================================"
echo "📊 FastAPI Server:    http://localhost:8000"
echo "📋 API Documentation: http://localhost:8000/docs"
echo "🌐 Dashboard:         http://localhost:3000"
echo ""
echo "🌍 Access from other devices on your network:"
PI_IP=$(hostname -I | awk '{print $1}')
echo "📊 FastAPI Server:    http://$PI_IP:8000"
echo "🌐 Dashboard:         http://$PI_IP:3000"
echo ""
echo "🧪 Test MQTT message:"
echo "mosquitto_pub -h localhost -t '/node1/zone1' -m '{\"node_id\":\"node1\",\"zone_id\":\"zone1\",\"timestamp\":560625,\"current_mA\":6.3,\"voltage_V\":3.308,\"power_mW\":20}'"
echo ""
echo "🛑 Press Ctrl+C to stop all services"

# Keep script running and monitor processes
while true; do
    # Check if FastAPI is still running
    if ! kill -0 $FASTAPI_PID 2>/dev/null; then
        echo "❌ FastAPI server has stopped unexpectedly"
        break
    fi
    
    # Check if Next.js is still running
    if ! kill -0 $NEXTJS_PID 2>/dev/null; then
        echo "❌ Next.js dashboard has stopped unexpectedly"
        break
    fi
    
    sleep 5
done

cleanup
