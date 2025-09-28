#!/usr/bin/env python3
"""
Backend startup wrapper that handles Windows console encoding
"""
import sys
import os

# Handle Windows console encoding for emoji support
if sys.platform == "win32":
    # Set UTF-8 encoding for Windows console
    os.system("chcp 65001 > nul")
    # Set environment variable for Python to use UTF-8
    os.environ['PYTHONIOENCODING'] = 'utf-8'

# Import and run the main server
if __name__ == "__main__":
    import mqtt_fastapi_server
    # The server will run when imported due to the if __name__ == "__main__" block
