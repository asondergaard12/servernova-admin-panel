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
echo Press Ctrl+C to stop the server
echo.

node server/index.js
