@echo off
echo ========================================
echo   EmotiSense - Installation Script
echo ========================================
echo.

echo [1/4] Creating Python virtual environment...
cd backend
python -m venv venv
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)

echo [2/4] Installing Python dependencies...
call venv\Scripts\activate
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)
cd ..

echo [3/4] Installing Node.js dependencies...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install Node.js dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Run 'start.bat' to launch the application
echo   2. Open http://localhost:3000 in your browser
echo.
echo ========================================
pause
