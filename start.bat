@echo off
echo ========================================
echo ServerNova Admin Panel
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo ERROR: .env file not found!
    echo Please run install.bat first or copy .env.example to .env
    pause
    exit /b 1
)

REM Check if running as Administrator
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Not running as Administrator!
    echo Some features may not work properly.
    echo.
    echo Please right-click this file and select "Run as Administrator"
    echo.
    echo Continue anyway? (Press Ctrl+C to cancel)
    pause
)

echo Starting ServerNova Admin Panel...
echo.
echo Press Ctrl+C to stop the server
echo.

node server/index.js
