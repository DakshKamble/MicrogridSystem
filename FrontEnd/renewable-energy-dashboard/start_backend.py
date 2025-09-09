#!/usr/bin/env python3
"""
Startup script for Microgrid System Backend
This script ensures all dependencies are installed and starts the backend server
"""

import subprocess
import sys
import os

def install_requirements():
    """Install required Python packages"""
    print("Installing Python dependencies...")
    
    # Try the main requirements file first
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"⚠️  Main requirements failed: {e}")
        print("Trying simplified requirements...")
        
        # Try simplified requirements as fallback
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements-simple.txt"])
            print("✅ Dependencies installed with simplified requirements!")
            return True
        except subprocess.CalledProcessError as e2:
            print(f"❌ Both requirements files failed!")
            print(f"Main error: {e}")
            print(f"Fallback error: {e2}")
            print("\n💡 Try installing manually:")
            print("pip install fastapi uvicorn paho-mqtt pydantic httpx python-dateutil python-dotenv")
            return False

def start_backend():
    """Start the backend server"""
    print("Starting Microgrid System Backend...")
    print("Backend will be available at: http://localhost:8000")
    print("API documentation at: http://localhost:8000/docs")
    print("Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        # Import and run the backend
        from backend import app
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
    except KeyboardInterrupt:
        print("\n🛑 Backend server stopped by user")
    except Exception as e:
        print(f"❌ Error starting backend: {e}")

def main():
    """Main startup function"""
    print("🚀 Microgrid System Backend Startup")
    print("=" * 40)
    
    # Check if requirements.txt exists
    if not os.path.exists("requirements.txt"):
        print("❌ requirements.txt not found!")
        return
    
    # Install dependencies
    if not install_requirements():
        return
    
    # Start the backend
    start_backend()

if __name__ == "__main__":
    main()
