#!/usr/bin/env python3
"""
Dependency installer for Microgrid System Backend
Handles Python 3.13 compatibility issues
"""

import subprocess
import sys
import os

def run_command(cmd, description):
    """Run a command and return success status"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} completed successfully")
            return True
        else:
            print(f"❌ {description} failed:")
            print(result.stderr)
            return False
    except Exception as e:
        print(f"❌ {description} failed with exception: {e}")
        return False

def main():
    """Main installation function"""
    print("🚀 Microgrid System Backend - Dependency Installer")
    print("=" * 50)
    
    # Check Python version
    python_version = sys.version_info
    print(f"Python version: {python_version.major}.{python_version.minor}.{python_version.micro}")
    
    if python_version >= (3, 13):
        print("⚠️  Detected Python 3.13+ - using compatibility mode")
    
    # Upgrade pip first
    if not run_command(f"{sys.executable} -m pip install --upgrade pip", "Upgrading pip"):
        print("⚠️  Pip upgrade failed, continuing anyway...")
    
    # Install dependencies one by one to handle issues
    dependencies = [
        "fastapi",
        "uvicorn[standard]", 
        "paho-mqtt",
        "pydantic",
        "httpx",
        "python-dateutil",
        "python-dotenv",
        "typing-extensions",
        "annotated-types"
    ]
    
    failed_deps = []
    
    for dep in dependencies:
        if not run_command(f"{sys.executable} -m pip install {dep}", f"Installing {dep}"):
            failed_deps.append(dep)
    
    if failed_deps:
        print(f"\n⚠️  Some dependencies failed to install: {', '.join(failed_deps)}")
        print("\n💡 Alternative installation methods:")
        print("1. Try installing with --no-cache-dir:")
        for dep in failed_deps:
            print(f"   pip install --no-cache-dir {dep}")
        print("\n2. Try installing with --force-reinstall:")
        for dep in failed_deps:
            print(f"   pip install --force-reinstall {dep}")
        print("\n3. Use conda instead of pip:")
        print("   conda install -c conda-forge fastapi uvicorn paho-mqtt pydantic")
        
        return False
    else:
        print("\n🎉 All dependencies installed successfully!")
        print("You can now run: python3 start_backend.py")
        return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
