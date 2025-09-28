#!/bin/bash

# Microgrid Dashboard Startup Script
# This script starts both the FastAPI backend and React frontend

echo "🚀 Starting Microgrid Dashboard System..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to start FastAPI backend
start_backend() {
    echo -e "${BLUE}📡 Starting FastAPI Backend Server...${NC}"
    
    if check_port 8000; then
        echo -e "${YELLOW}⚠️  Port 8000 is already in use. FastAPI might already be running.${NC}"
        echo -e "${YELLOW}   Check: http://localhost:8000/api/v1/status${NC}"
    else
        echo -e "${GREEN}✅ Starting FastAPI on port 8000...${NC}"
        python3 mqtt_fastapi_server.py &
        BACKEND_PID=$!
        echo "Backend PID: $BACKEND_PID"
        
        # Wait a moment for the server to start
        sleep 3
        
        if check_port 8000; then
            echo -e "${GREEN}✅ FastAPI Backend is running!${NC}"
            echo -e "${GREEN}   API Documentation: http://localhost:8000/docs${NC}"
            echo -e "${GREEN}   Status Endpoint: http://localhost:8000/api/v1/status${NC}"
        else
            echo -e "${RED}❌ Failed to start FastAPI Backend${NC}"
            exit 1
        fi
    fi
}

# Function to start React frontend
start_frontend() {
    echo -e "${BLUE}⚛️  Starting React Frontend...${NC}"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing npm dependencies...${NC}"
        npm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Failed to install npm dependencies${NC}"
            exit 1
        fi
    fi
    
    if check_port 3000; then
        echo -e "${YELLOW}⚠️  Port 3000 is already in use. React might already be running.${NC}"
        echo -e "${YELLOW}   Check: http://localhost:3000${NC}"
    else
        echo -e "${GREEN}✅ Starting React Development Server...${NC}"
        npm start &
        FRONTEND_PID=$!
        echo "Frontend PID: $FRONTEND_PID"
        
        # Wait for React to start
        echo -e "${BLUE}⏳ Waiting for React to start (this may take 30-60 seconds)...${NC}"
        
        # Wait up to 60 seconds for React to start
        for i in {1..60}; do
            if check_port 3000; then
                echo -e "${GREEN}✅ React Frontend is running!${NC}"
                break
            fi
            sleep 1
            echo -n "."
        done
        
        if check_port 3000; then
            echo -e "${GREEN}🎉 Dashboard is ready!${NC}"
            echo -e "${GREEN}   Local Access: http://localhost:3000${NC}"
            echo -e "${GREEN}   Network Access: http://$(hostname -I | awk '{print $1}'):3000${NC}"
        else
            echo -e "${RED}❌ Failed to start React Frontend${NC}"
            exit 1
        fi
    fi
}

# Function to show status
show_status() {
    echo ""
    echo -e "${BLUE}📊 System Status:${NC}"
    echo "=================="
    
    if check_port 8000; then
        echo -e "${GREEN}✅ FastAPI Backend: Running on port 8000${NC}"
    else
        echo -e "${RED}❌ FastAPI Backend: Not running${NC}"
    fi
    
    if check_port 3000; then
        echo -e "${GREEN}✅ React Frontend: Running on port 3000${NC}"
    else
        echo -e "${RED}❌ React Frontend: Not running${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}🔗 Quick Links:${NC}"
    echo "   Dashboard: http://localhost:3000"
    echo "   API Docs:  http://localhost:8000/docs"
    echo "   API Status: http://localhost:8000/api/v1/status"
    echo ""
}

# Function to stop services
stop_services() {
    echo -e "${YELLOW}🛑 Stopping services...${NC}"
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "Stopped FastAPI Backend (PID: $BACKEND_PID)"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "Stopped React Frontend (PID: $FRONTEND_PID)"
    fi
    
    # Kill any remaining processes on these ports
    pkill -f "python3 mqtt_fastapi_server.py" 2>/dev/null
    pkill -f "react-scripts start" 2>/dev/null
    
    echo -e "${GREEN}✅ Services stopped${NC}"
}

# Trap to handle script interruption
trap stop_services EXIT INT TERM

# Main execution
case "${1:-start}" in
    "start")
        start_backend
        start_frontend
        show_status
        
        echo -e "${GREEN}🎉 Microgrid Dashboard is now running!${NC}"
        echo -e "${YELLOW}💡 Press Ctrl+C to stop all services${NC}"
        echo ""
        
        # Keep script running
        wait
        ;;
    
    "backend")
        start_backend
        show_status
        wait
        ;;
    
    "frontend")
        start_frontend
        show_status
        wait
        ;;
    
    "status")
        show_status
        ;;
    
    "stop")
        stop_services
        ;;
    
    *)
        echo "Usage: $0 {start|backend|frontend|status|stop}"
        echo ""
        echo "Commands:"
        echo "  start     - Start both backend and frontend (default)"
        echo "  backend   - Start only FastAPI backend"
        echo "  frontend  - Start only React frontend"
        echo "  status    - Show current status"
        echo "  stop      - Stop all services"
        exit 1
        ;;
esac
