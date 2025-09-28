#!/bin/bash

# Development startup script
# Starts both backend and frontend in development mode

echo "🔧 Starting Development Environment..."

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down development servers..."
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

# Start the React development server
echo "🌐 Starting React development server on port 8080..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Development environment started!"
echo ""
echo "📊 Frontend (Dev): http://localhost:8080"
echo "🔌 Backend API: http://localhost:8000"
echo "📝 API Docs: http://localhost:8000/docs"
echo ""
echo "🛑 Press Ctrl+C to stop all services"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
