#!/usr/bin/env python3
"""
Dashboard Launcher Script
=========================

Simple script to install dependencies and launch the Streamlit dashboard.
Run this script to start the Renewable Energy Monitoring System dashboard.
"""

import subprocess
import sys
import os

def install_requirements():
    """Install required Python packages."""
    print("🔧 Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def launch_dashboard():
    """Launch the Streamlit dashboard."""
    print("🚀 Launching Renewable Energy Monitoring Dashboard...")
    try:
        # Launch Streamlit with the dashboard script
        subprocess.run([
            sys.executable, "-m", "streamlit", "run", 
            "streamlit_dashboard.py",
            "--server.port=8501",
            "--server.address=0.0.0.0"
        ])
    except KeyboardInterrupt:
        print("\n👋 Dashboard stopped by user.")
    except Exception as e:
        print(f"❌ Error launching dashboard: {e}")

def main():
    """Main launcher function."""
    print("=" * 50)
    print("🔋 Renewable Energy Monitoring System")
    print("   Dashboard Launcher")
    print("=" * 50)
    
    # Check if streamlit_dashboard.py exists
    if not os.path.exists("streamlit_dashboard.py"):
        print("❌ streamlit_dashboard.py not found in current directory!")
        print("   Please run this script from the same directory as the dashboard.")
        return
    
    # Install dependencies
    if install_requirements():
        print("\n" + "=" * 50)
        print("🌐 Starting dashboard...")
        print("   Dashboard will be available at: http://localhost:8501")
        print("   Press Ctrl+C to stop the dashboard")
        print("=" * 50)
        
        # Launch the dashboard
        launch_dashboard()
    else:
        print("❌ Cannot start dashboard due to dependency issues.")

if __name__ == "__main__":
    main()
