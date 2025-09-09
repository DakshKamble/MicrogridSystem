#!/bin/bash

# Renewable Energy Monitoring System - Dashboard Setup Script
# =============================================================
# 
# This script sets up the dashboard with a virtual environment
# to avoid externally-managed-environment issues on Raspberry Pi OS.

echo "==============================================="
echo "🔋 Renewable Energy Monitoring System Setup"
echo "   Virtual Environment Installation"
echo "==============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running on Raspberry Pi
if grep -q "Raspberry Pi" /proc/device-tree/model 2>/dev/null; then
    echo -e "${BLUE}🍓 Detected Raspberry Pi system${NC}"
else
    echo -e "${YELLOW}⚠️  Not detected as Raspberry Pi, but proceeding anyway${NC}"
fi

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if required files exist
echo
print_info "Checking required files..."
if [ ! -f "streamlit_dashboard.py" ]; then
    print_error "streamlit_dashboard.py not found!"
    exit 1
fi

if [ ! -f "requirements.txt" ]; then
    print_error "requirements.txt not found!"
    exit 1
fi

print_status "All required files found"

# Install system dependencies if needed
echo
print_info "Checking system dependencies..."

if ! dpkg -l | grep -q python3-venv; then
    print_warning "python3-venv not installed, attempting to install..."
    if command -v apt >/dev/null 2>&1; then
        echo "Installing python3-venv and python3-full..."
        sudo apt update
        sudo apt install -y python3-venv python3-full
        
        if [ $? -eq 0 ]; then
            print_status "System dependencies installed successfully"
        else
            print_error "Failed to install system dependencies"
            print_info "Please run: sudo apt install python3-venv python3-full"
            exit 1
        fi
    else
        print_error "apt package manager not found"
        print_info "Please install python3-venv manually"
        exit 1
    fi
else
    print_status "System dependencies already installed"
fi

# Create virtual environment
echo
print_info "Setting up virtual environment..."

VENV_DIR="dashboard_venv"

if [ -d "$VENV_DIR" ]; then
    print_warning "Virtual environment already exists, removing old one..."
    rm -rf "$VENV_DIR"
fi

python3 -m venv "$VENV_DIR"

if [ $? -eq 0 ]; then
    print_status "Virtual environment created successfully"
else
    print_error "Failed to create virtual environment"
    exit 1
fi

# Activate virtual environment and install packages
echo
print_info "Installing Python packages..."

source "$VENV_DIR/bin/activate"

# Upgrade pip first
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    print_status "All packages installed successfully"
else
    print_error "Failed to install some packages"
    print_info "Trying individual package installation..."
    
    # Try installing packages individually
    pip install "streamlit>=1.28.0"
    pip install "paho-mqtt>=1.6.1" 
    pip install "pandas>=1.5.0"
    
    if [ $? -eq 0 ]; then
        print_status "Packages installed via alternative method"
    else
        print_error "Package installation failed"
        exit 1
    fi
fi

# Deactivate virtual environment
deactivate

# Create launcher script
echo
print_info "Creating launcher script..."

cat > launch_dashboard.sh << 'EOF'
#!/bin/bash

# Dashboard Launcher
echo "🚀 Starting Renewable Energy Monitoring Dashboard..."

# Check if virtual environment exists
if [ ! -d "dashboard_venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "   Please run setup_dashboard.sh first"
    exit 1
fi

# Activate virtual environment and launch dashboard
source dashboard_venv/bin/activate

echo "🌐 Dashboard starting..."
echo "   Available at: http://localhost:8501"
echo "   Or from network: http://$(hostname -I | awk '{print $1}'):8501"
echo "   Press Ctrl+C to stop"

streamlit run streamlit_dashboard.py --server.port=8501 --server.address=0.0.0.0

deactivate
EOF

chmod +x launch_dashboard.sh

print_status "Launcher script created"

# Final instructions
echo
echo "==============================================="
print_status "Setup completed successfully!"
echo "==============================================="
echo
print_info "To start the dashboard:"
echo "   ./launch_dashboard.sh"
echo
print_info "Or manually:"
echo "   source dashboard_venv/bin/activate"
echo "   streamlit run streamlit_dashboard.py"
echo
print_info "Dashboard will be available at:"
echo "   http://localhost:8501"
echo "   http://$(hostname -I | awk '{print $1}'):8501 (from other devices)"
echo
print_warning "Make sure your MQTT broker is running before starting the dashboard!"
echo
