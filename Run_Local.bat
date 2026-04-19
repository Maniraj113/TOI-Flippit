@echo off
setlocal
echo ==========================================
echo    STARTING FLIPPIT (LOCAL TEST SERVER)
echo ==========================================

:: Check for npx
where npx >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js/npx is not installed.
    echo Please install Node from https://nodejs.org/
    pause
    exit /b
)

:: Serve the current directory
echo [INFO] Launching local server...
echo [INFO] Access via http://localhost:3000
echo [INFO] Complete end-to-end flow: Login > OTP > Game > Result > Share

:: Open browser with clean production URL (no test flags)
start http://localhost:3000

:: Run the server
npx -y serve -p 3000 .

pause
