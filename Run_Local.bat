@echo off
setlocal enabledelayedexpansion
echo ==========================================
echo    FLIPPIT SCENARIO TESTER (V4)
echo ==========================================

:: Check for npx
where npx >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js/npx is not installed.
    echo Please install Node from https://nodejs.org/
    pause
    exit /b
)

echo [1] Launch Local Version (index.html)
echo [2] Launch Production Version (index_production.html)
set /p choice="Select version (1/2): "

if "%choice%"=="2" (
    set "TARGET=index_production.html"
) else (
    set "TARGET=index.html"
)

echo.
echo Select Test Scenario:
echo [1] Valid Access (Today's Date + City)
echo [2] Access Denied (Missing City/Date)
echo [3] Link Expired (Old Date)
set /p scenario="Select scenario (1/2/3): "

:: Use Powershell to get the date in YYYYMMDD format reliably
for /f "tokens=*" %%a in ('powershell -Command "Get-Date -Format 'yyyyMMdd'"') do set "YYYYMMDD=%%a"

if "%scenario%"=="1" (
    set "QUERY=city=Mumbai&date=!YYYYMMDD!"
    echo [INFO] Simulation: VALID ACCESS
)
if "%scenario%"=="2" (
    set "QUERY="
    echo [INFO] Simulation: ACCESS DENIED (No params)
)
if "%scenario%"=="3" (
    set "QUERY=city=Mumbai&date=20240101"
    echo [INFO] Simulation: LINK EXPIRED (Past date)
)

echo.
echo [1] Normal Mode
echo [2] Test Mode (Enabled detailed console logging)
set /p mode="Select mode (1/2): "

if "%mode%"=="2" (
    if "!QUERY!"=="" (
        set "QUERY=test=true"
    ) else (
        set "QUERY=!QUERY!&test=true"
    )
)

:: Construct final URL
if not "!QUERY!"=="" (
    set "URL_SUFFIX=?!QUERY!"
) else (
    set "URL_SUFFIX="
)

:: Serve the current directory
echo.
echo [INFO] Launching http-server (Redirect-free)...
echo [INFO] URL: http://127.0.0.1:3000/!TARGET!!URL_SUFFIX!

:: Open browser using 127.0.0.1 to avoid some 'localhost' redirect quirks
start "" "http://127.0.0.1:3000/!TARGET!!URL_SUFFIX!"

:: Run http-server (No-cache, No-redirects)
:: -c-1 disables caching to ensure you see latest changes
npx -y http-server -p 3000 -c-1 .

pause
