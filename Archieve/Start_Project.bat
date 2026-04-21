@echo off
setlocal
echo ==========================================
echo    STARTING TOI FLIPPIT GAME PROJECT
echo ==========================================

:: Change directory to the project folder
cd flippit-next

:: Check if node_modules exists
if not exist node_modules (
    echo [INFO] node_modules not found. Installing dependencies...
    call npm install
)

:: Start the Next.js development server
echo [INFO] Launching Next.js project on http://localhost:3000...
start http://localhost:3000
npm run dev

pause
