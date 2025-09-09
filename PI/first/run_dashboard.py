#!/usr/bin/env python3
"""
Dashboard Launcher Script
=========================

Simple script to install dependencies and launch the Streamlit dashboard.
Run this script to start the Renewable Energy Monitoring System dashboard.

This script automatically creates a virtual environment to avoid 
externally-managed-environment issues on Raspberry Pi OS.
"""

import subprocess
import sys
import os
import venv

VENV_DIR = "dashboard_venv"

def create_virtual_environment():
    """Create a virtual environment for the dashboard."""
    if os.path.exists(VENV_DIR):
        print(f"📦 Virtual environment '{VENV_DIR}' already exists.")
        return True
    
    print(f"🔧 Creating virtual environment '{VENV_DIR}'...")
    try:
        venv.create(VENV_DIR, with_pip=True)
        print("✅ Virtual environment created successfully!")
        return True
    except Exception as e:
        print(f"❌ Failed to create virtual environment: {e}")
        return False

def get_venv_python():
    """Get the path to the Python executable in the virtual environment."""
    if os.name == 'nt':  # Windows
        return os.path.join(VENV_DIR, "Scripts", "python.exe")
    else:  # Linux/macOS
        return os.path.join(VENV_DIR, "bin", "python")

def get_venv_pip():
    """Get the path to the pip executable in the virtual environment."""
    if os.name == 'nt':  # Windows
        return os.path.join(VENV_DIR, "Scripts", "pip.exe")
    else:  # Linux/macOS
        return os.path.join(VENV_DIR, "bin", "pip")

def install_requirements():
    """Install required Python packages in virtual environment."""
    print("🔧 Installing required packages in virtual environment...")
    
    # First, upgrade pip
    pip_path = get_venv_pip()
    try:
        subprocess.check_call([pip_path, "install", "--upgrade", "pip"])
        print("✅ Pip upgraded successfully!")
    except subprocess.CalledProcessError as e:
        print(f"⚠️ Warning: Could not upgrade pip: {e}")
    
    # Install requirements
    try:
        subprocess.check_call([pip_path, "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        print("\n💡 Trying alternative installation method...")
        
        # Try installing packages individually
        packages = ["streamlit>=1.28.0", "paho-mqtt>=1.6.1", "pandas>=1.5.0"]
        for package in packages:
            try:
                print(f"  Installing {package}...")
                subprocess.check_call([pip_path, "install", package])
            except subprocess.CalledProcessError as pkg_e:
                print(f"  ❌ Failed to install {package}: {pkg_e}")
                return False
        
        print("✅ All packages installed successfully!")
        return True

def launch_dashboard():
    """Launch the Streamlit dashboard using virtual environment."""
    print("🚀 Launching Renewable Energy Monitoring Dashboard...")
    python_path = get_venv_python()
    
    try:
        # Launch Streamlit with the dashboard script using venv python
        subprocess.run([
            python_path, "-m", "streamlit", "run", 
            "streamlit_dashboard.py",
            "--server.port=8501",
            "--server.address=0.0.0.0"
        ])
    except KeyboardInterrupt:
        print("\n👋 Dashboard stopped by user.")
    except Exception as e:
        print(f"❌ Error launching dashboard: {e}")

def check_system_requirements():
    """Check if system has required packages for virtual environment."""
    print("🔍 Checking system requirements...")
    
    # Check if python3-venv is available
    try:
        import venv
        print("✅ Virtual environment support available")
        return True
    except ImportError:
        print("❌ Virtual environment support not available")
        print("💡 On Raspberry Pi, try: sudo apt install python3-venv python3-full")
        return False

def main():
    """Main launcher function."""
    print("=" * 70)
    print("🔋 Renewable Energy Monitoring System - Dashboard Launcher")
    print("   (Raspberry Pi Compatible with Virtual Environment)")
    print("=" * 70)
    
    # Check if streamlit_dashboard.py exists
    if not os.path.exists("streamlit_dashboard.py"):
        print("❌ streamlit_dashboard.py not found in current directory!")
        print("   Please run this script from the same directory as the dashboard.")
        return
    
    # Check system requirements
    if not check_system_requirements():
        return
    
    # Create virtual environment
    if not create_virtual_environment():
        return
    
    # Install dependencies
    if install_requirements():
        print("\n" + "=" * 70)
        print("🌐 Starting dashboard...")
        print("   Dashboard will be available at: http://localhost:8501")
        print("   Or from other devices: http://[your-pi-ip]:8501")
        print("   Press Ctrl+C to stop the dashboard")
        print("=" * 70)
        
        # Launch the dashboard
        launch_dashboard()
    else:
        print("❌ Cannot start dashboard due to dependency issues.")
        print("\n💡 Manual installation alternative:")
        print("   1. sudo apt install python3-venv python3-full")
        print("   2. python3 -m venv dashboard_venv")
        print("   3. source dashboard_venv/bin/activate")
        print("   4. pip install -r requirements.txt")
        print("   5. streamlit run streamlit_dashboard.py")

if __name__ == "__main__":
    main()
