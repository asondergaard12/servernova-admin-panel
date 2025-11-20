@echo off
echo ========================================
echo ServerNova Admin Panel
echo ========================================
echo.

REM Check if .env exists
if not exist ".env" (
    echo WARNING: .env file not found!
    echo.
    echo Attempting to create from .env.example...
    if exist ".env.example" (
        copy .env.example .env >nul 2>&1
        if exist ".env" (
            echo SUCCESS: .env file created!
            echo IMPORTANT: Please edit .env and change ADMIN_ACCESS_CODE and SESSION_SECRET
            echo.
        ) else (
            echo ERROR: Could not create .env file automatically.
            echo.
            echo Please create .env manually with these contents:
            echo PORT=3001
            echo NODE_ENV=production
            echo ADMIN_ACCESS_CODE=ChangeThisSecureCode123!
            echo SESSION_SECRET=ChangeThisRandomSecretKey456!
            echo.
            pause
            exit /b 1
        )
    ) else (
        echo ERROR: .env.example not found either!
        pause
        exit /b 1
    )
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

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js found. Starting server...
echo Press Ctrl+C to stop the server
echo.

node server/index.js

REM If we get here, the server stopped - show why
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Server failed to start!
    echo Please check the error messages above.
    echo.
    echo Common issues:
    echo - Dependencies not installed (run: npm install)
    echo - Port 3001 already in use
    echo - Missing configuration
    echo.
)
pause
