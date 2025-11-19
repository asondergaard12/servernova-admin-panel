@echo off
echo ========================================
echo ServerNova Admin Panel - Installation
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not installed!
    pause
    exit /b 1
)

echo npm version:
npm --version
echo.

REM Install backend dependencies
echo ========================================
echo Installing backend dependencies...
echo ========================================
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install backend dependencies!
    pause
    exit /b 1
)
echo.

REM Install frontend dependencies
echo ========================================
echo Installing frontend dependencies...
echo ========================================
cd client
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install frontend dependencies!
    pause
    exit /b 1
)
echo.

REM Build frontend
echo ========================================
echo Building frontend...
echo ========================================
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to build frontend!
    pause
    exit /b 1
)
cd ..
echo.

REM Create .env file if it doesn't exist
if not exist .env (
    echo ========================================
    echo Creating .env file...
    echo ========================================
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit .env and change:
    echo   - ADMIN_ACCESS_CODE
    echo   - SESSION_SECRET
    echo.
)

echo ========================================
echo Installation completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env file and change ADMIN_ACCESS_CODE and SESSION_SECRET
echo 2. Run the application with: npm start
echo 3. Access the panel at http://localhost:3001
echo.
echo NOTE: Run as Administrator for full functionality!
echo.
pause
