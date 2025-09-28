#!/usr/bin/env python3
"""
Microgrid Dashboard System Startup Script for Raspberry Pi
This script starts both the MQTT FastAPI server and the React frontend dashboard.
"""

import os
import sys
import time
import signal
import socket
import subprocess
import threading
from pathlib import Path

class MicrogridSystemManager:
    def __init__(self):
        self.backend_process = None
        self.frontend_process = None
        self.build_process = None
        self.is_running = False
        
    def get_rpi_ip(self):
        """Get the Raspberry Pi's IP address."""
        try:
            # Connect to a remote address to get local IP
            with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
                s.connect(("8.8.8.8", 80))
                return s.getsockname()[0]
        except Exception:
            return "localhost"
    
    def check_prerequisites(self):
        """Check if all required dependencies are installed."""
        print("[CHECK] Checking prerequisites...")
        
        # Check Python version
        if sys.version_info < (3, 7):
            print("[ERROR] Python 3.7+ is required")
            return False
        print(f"[OK] Python {sys.version.split()[0]}")
        
        # Check if Node.js is installed
        try:
            node_result = subprocess.run(['node', '--version'], 
                                       capture_output=True, text=True, check=True)
            print(f"[OK] Node.js {node_result.stdout.strip()}")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("[ERROR] Node.js is not installed or not in PATH")
            return False
        
        # Check if npm is installed (try both npm and npm.cmd for Windows)
        npm_commands = ['npm', 'npm.cmd']
        npm_found = False
        for npm_cmd in npm_commands:
            try:
                npm_result = subprocess.run([npm_cmd, '--version'], 
                                          capture_output=True, text=True, check=True)
                print(f"[OK] npm {npm_result.stdout.strip()}")
                npm_found = True
                break
            except (subprocess.CalledProcessError, FileNotFoundError):
                continue
        
        if not npm_found:
            print("[ERROR] npm is not installed or not in PATH")
            return False
        
        # Check Python dependencies
        required_python_packages = [
            ('fastapi', 'fastapi'),
            ('uvicorn', 'uvicorn'), 
            ('paho-mqtt', 'paho.mqtt.client')
        ]
        
        for package_name, import_name in required_python_packages:
            try:
                __import__(import_name)
                print(f"[OK] Python package: {package_name}")
            except ImportError:
                print(f"[ERROR] Python package missing: {package_name}")
                return False
        
        # Check if project files exist
        required_files = [
            'mqtt_fastapi_server.py',
            'package.json',
            'src/main.tsx'
        ]
        
        for file in required_files:
            if not Path(file).exists():
                print(f"[ERROR] Required file missing: {file}")
                return False
            print(f"[OK] Found: {file}")
        
        # Check if node_modules exists
        if not Path('node_modules').exists():
            print("[WARNING] node_modules not found - will install dependencies")
            return "install_deps"
        
        print("[OK] All prerequisites satisfied!")
        return True
    
    def install_node_dependencies(self):
        """Install Node.js dependencies."""
        print("[INSTALL] Installing Node.js dependencies...")
        
        # Try npm.cmd first (Windows), then npm (Unix/Linux)
        npm_commands = ['npm.cmd', 'npm']
        for npm_cmd in npm_commands:
            try:
                subprocess.run([npm_cmd, 'install'], check=True)
                print("[OK] Node.js dependencies installed successfully")
                return True
            except (subprocess.CalledProcessError, FileNotFoundError):
                continue
        
        print("[ERROR] Failed to install Node.js dependencies: npm not found")
        return False
    
    def build_frontend(self):
        """Build the React frontend for production."""
        print("[BUILD] Building React frontend for production...")
        
        # Try npm.cmd first (Windows), then npm (Unix/Linux)
        npm_commands = ['npm.cmd', 'npm']
        for npm_cmd in npm_commands:
            try:
                self.build_process = subprocess.run(
                    [npm_cmd, 'run', 'build'], 
                    check=True,
                    capture_output=True,
                    text=True
                )
                print("[OK] Frontend build completed successfully")
                return True
            except FileNotFoundError:
                continue
            except subprocess.CalledProcessError as e:
                print(f"[ERROR] Frontend build failed: {e}")
                if hasattr(e, 'stderr') and e.stderr:
                    print(f"Build error: {e.stderr}")
                return False
        
        print("[ERROR] Frontend build failed: npm not found")
        return False
    
    def start_backend(self):
        """Start the MQTT FastAPI server."""
        print("[START] Starting MQTT FastAPI Server on port 8000...")
        try:
            self.backend_process = subprocess.Popen(
                [sys.executable, 'mqtt_fastapi_server.py'],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                universal_newlines=True,
                bufsize=1,
                encoding='utf-8',
                errors='replace'
            )
            
            # Start a thread to monitor backend output
            def monitor_backend():
                try:
                    for line in iter(self.backend_process.stdout.readline, ''):
                        if line and line.strip():
                            # Clean output and remove any problematic characters
                            clean_line = line.strip().encode('ascii', 'ignore').decode('ascii')
                            if clean_line:
                                print(f"[BACKEND] {clean_line}")
                except Exception:
                    pass  # Silently handle encoding errors
                
            backend_thread = threading.Thread(target=monitor_backend, daemon=True)
            backend_thread.start()
            
            # Give the backend a moment to start
            time.sleep(2)
            
            if self.backend_process.poll() is None:
                print("[OK] Backend server started successfully")
                return True
            else:
                print("[ERROR] Backend server failed to start")
                return False
                
        except Exception as e:
            print(f"[ERROR] Failed to start backend: {e}")
            return False
    
    def start_frontend(self):
        """Start the frontend HTTP server."""
        print("[START] Starting frontend server on port 8080...")
        
        # Check if dist directory exists
        if not Path('dist').exists():
            print("[ERROR] dist directory not found. Frontend build may have failed.")
            return False
        
        try:
            # Change to dist directory and start HTTP server
            os.chdir('dist')
            self.frontend_process = subprocess.Popen(
                [sys.executable, '-m', 'http.server', '8080'],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                universal_newlines=True
            )
            os.chdir('..')  # Change back to root directory
            
            # Give the frontend a moment to start
            time.sleep(1)
            
            if self.frontend_process.poll() is None:
                print("[OK] Frontend server started successfully")
                return True
            else:
                print("[ERROR] Frontend server failed to start")
                return False
                
        except Exception as e:
            print(f"[ERROR] Failed to start frontend: {e}")
            return False
    
    def cleanup(self, signum=None, frame=None):
        """Cleanup function to stop all processes."""
        print("\n[STOP] Shutting down services...")
        self.is_running = False
        
        if self.backend_process and self.backend_process.poll() is None:
            print("[STOP] Stopping backend server...")
            self.backend_process.terminate()
            try:
                self.backend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.backend_process.kill()
        
        if self.frontend_process and self.frontend_process.poll() is None:
            print("[STOP] Stopping frontend server...")
            self.frontend_process.terminate()
            try:
                self.frontend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.frontend_process.kill()
        
        print("[OK] All services stopped")
        sys.exit(0)
    
    def setup_signal_handlers(self):
        """Set up signal handlers for graceful shutdown."""
        signal.signal(signal.SIGINT, self.cleanup)
        signal.signal(signal.SIGTERM, self.cleanup)
    
    def display_info(self, rpi_ip):
        """Display system information."""
        print("\n" + "="*60)
        print("MICROGRID DASHBOARD SYSTEM STARTED SUCCESSFULLY!")
        print("="*60)
        print(f"IP Address: {rpi_ip}")
        print(f"Dashboard URL: http://{rpi_ip}:8080")
        print(f"API Server: http://{rpi_ip}:8000")
        print(f"API Documentation: http://{rpi_ip}:8000/docs")
        print("\nACCESS FROM OTHER DEVICES:")
        print(f"   Main PC/Laptop: http://{rpi_ip}:8080")
        print(f"   Mobile/Tablet: http://{rpi_ip}:8080")
        print("\nPress Ctrl+C to stop all services")
        print("="*60)
    
    def run(self):
        """Main method to start the system."""
        print("Starting Microgrid Dashboard System...")
        print("="*50)
        
        # Set up signal handlers
        self.setup_signal_handlers()
        
        # Get RPi IP
        rpi_ip = self.get_rpi_ip()
        
        # Check prerequisites
        prereq_result = self.check_prerequisites()
        if prereq_result is False:
            print("\n[ERROR] Prerequisites not met. Please install missing dependencies.")
            print("\nSee the installation guide in the output above.")
            return False
        elif prereq_result == "install_deps":
            if not self.install_node_dependencies():
                return False
        
        # Build frontend
        if not self.build_frontend():
            return False
        
        # Start backend
        if not self.start_backend():
            return False
        
        # Start frontend
        if not self.start_frontend():
            return False
        
        # Display system information
        self.display_info(rpi_ip)
        
        # Set running flag
        self.is_running = True
        
        # Keep the script running and monitor processes
        try:
            while self.is_running:
                # Check if processes are still running
                if self.backend_process and self.backend_process.poll() is not None:
                    print("[ERROR] Backend process died unexpectedly")
                    break
                
                if self.frontend_process and self.frontend_process.poll() is not None:
                    print("[ERROR] Frontend process died unexpectedly")
                    break
                
                time.sleep(1)
        except KeyboardInterrupt:
            pass
        finally:
            self.cleanup()

def main():
    """Entry point."""
    manager = MicrogridSystemManager()
    success = manager.run()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
