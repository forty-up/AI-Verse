@echo off
echo ======================================
echo   EmotiSense - Starting Application
echo ======================================
echo.

REM Change to project directory
cd /d "%~dp0"

echo [1/3] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.10+ from python.org
    pause
    exit /b 1
)
echo Python found!
echo.

echo [2/3] Starting Backend Server...
echo This may take a moment as the model loads...
start "EmotiSense Backend" cmd /k "cd /d %~dp0 && venv\Scripts\activate && cd backend && echo Starting Flask server... && python app.py"

echo Waiting for backend to initialize (15 seconds)...
timeout /t 15 /nobreak > nul

echo.
echo [3/3] Starting Frontend Server...
start "EmotiSense Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ======================================
echo   Application Started Successfully!
echo ======================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo IMPORTANT: Wait for both servers to fully start
echo before opening the frontend URL in your browser.
echo.
echo ======================================
echo.
echo You can now close this window.
echo The servers will continue running in separate windows.
echo.
pause
