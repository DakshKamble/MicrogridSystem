@echo off
echo 🚀 Microgrid Dashboard - PC Startup
echo ====================================

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo ❌ Virtual environment not found!
    echo Please run: python -m venv venv
    echo Then: venv\Scripts\activate
    echo Then: pip install -r requirements.txt
    pause
    exit /b 1
)

REM Activate virtual environment
echo 🔧 Activating Python virtual environment...
call venv\Scripts\activate.bat

REM Check if node_modules exists
if not exist "node_modules" (
    echo ❌ Node modules not found!
    echo Please run: npm install
    pause
    exit /b 1
)

REM Start the system
echo 🚀 Starting Microgrid Dashboard System...
python start_system.py

pause
