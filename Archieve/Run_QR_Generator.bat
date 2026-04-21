@echo off
echo ==========================================
echo    FLIPPIT: DAILY QR GENERATOR
echo ==========================================

:: Check if python is installed
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed.
    pause
    exit /b
)

:: Required library
echo [INFO] Ensuring qrcode library is installed...
pip install qrcode[pil] >nul 2>nul

:: Run the generator
python generate_daily_qr.py

pause
