@echo off
setlocal
title Flippit Production Verification Suite

echo ==========================================================
echo    TOI FLIPPIT: PRODUCTION VERIFICATION SUITE
echo ==========================================================
echo.

:: Step 1: Run Node.js Logic Verification
echo [1/2] RUNNING CORE LOGIC TESTS (Node.js)...
echo ----------------------------------------------------------
node Documentation\verify_logic.js
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] CORE LOGIC TESTS FAILED. Please check the output above.
    pause
    exit /b %ERRORLEVEL%
)
echo.

:: Step 2: Run Browser UI Verification
echo [2/2] STARTING LOCAL SERVER & UI TESTER...
echo ----------------------------------------------------------
echo.

:: Start our custom lightweight server
echo Starting local test server on port 8080...
start /b node Documentation\test_server.js >nul 2>&1

:: Wait a few seconds for server to spin up
timeout /t 2 /nobreak >nul

echo Launching automated tests in Chrome Incognito...
echo.

:: Attempt to find Chrome path
set "CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME_PATH%" set "CHROME_PATH=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

set "TEST_URL=http://localhost:8080/Documentation/Verification_Runner.html"

if exist "%CHROME_PATH%" (
    start "" "%CHROME_PATH%" --incognito "%TEST_URL%"
) else (
    echo [!] Chrome not found in standard paths. Opening in default browser...
    start "" "%TEST_URL%"
)

echo.
echo ==========================================================
echo    VERIFICATION TRIGGERED. CHECK BROWSER FOR SUMMARY.
echo    (Close this window when finished to stop the server)
echo ==========================================================
echo.
pause

:: Cleanup: Kill the node server process on exit
taskkill /f /im node.exe >nul 2>&1
echo Test server stopped.
