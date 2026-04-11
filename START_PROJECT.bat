@echo off
echo ========================================
echo     Local SMTP Hub - Unified Startup
echo ========================================
echo.
echo [1/3] Checking Node.js dependencies...
call npm install
echo.
echo [2/3] Starting Unified Development Servers...
echo.
echo * Website (Vite): http://localhost:5173
echo * Backend (API):  http://localhost:8000
echo.
echo Press Ctrl+C to stop both servers.
echo.
npm run start-all
pause
