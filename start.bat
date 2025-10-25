@echo off
echo ======================================
echo   EmotiSense - Starting Application
echo ======================================
echo.

echo Starting Backend Server...
start cmd /k "cd /d C:\Users\tanma\OneDrive\Desktop\aiverse_model\emotion_detection && venv\Scripts\activate && cd backend && python app.py"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start cmd /k "cd frontend && npm run dev"

echo.
echo ======================================
echo   Application Started!
echo ======================================
echo   Backend: http://localhost:5000
echo   Frontend: http://localhost:3000
echo ======================================
echo.
echo Press any key to exit this window...
pause > nul
