@echo off
echo ========================================
echo       Starting Local SMTP Backend
echo ========================================
echo.
echo [1/2] Installing/Updating dependencies...
pip install fastapi uvicorn pydantic email-validator
echo.
echo [2/2] Starting Server (Using logic from smtp.py)...
python server.py
pause
