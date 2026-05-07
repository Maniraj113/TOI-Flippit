@echo off
setlocal
echo ==========================================
echo    PUSHING FLIPPIT TO GITHUB
echo ==========================================

:: Check if git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed.
    pause
    exit /b
)

:: Stage all files (honoring .gitignore)
echo [INFO] Staging files...
git add .

echo [INFO] PRE-PUSH CHECK: Console logs are auto-silenced in index.html (non-test mode).
echo [INFO] Ensure all debug alert() calls are removed before proceeding.
echo.


:: Optional: add other core directories if needed
:: git add flippit-next/

:: Commit changes
set /p msg="Enter commit message (or press enter for default): "
if "%msg%"=="" set msg="Production Release: Finalized Flippit game experience"

echo [INFO] Committing changes...
git commit -m "%msg%"

:: Push to remote
echo [INFO] Pushing to GitHub...
git push origin main

if %errorlevel% neq 0 (
    echo [ERROR] Push failed. 
) else (
    echo [SUCCESS] Code pushed successfully!
)

pause
