@echo off
title VitaWatch Spectra - Launcher
echo ===================================================
echo        VitaWatch Spectra - Full-Stack Launcher
echo ===================================================
echo.
echo Starting Flask Backend on http://127.0.0.1:5000 ...
start "VitaWatch Spectra - Flask Backend" cmd /k "py app.py"

echo.
echo Starting Next.js Frontend on http://localhost:3000 ...
cd frontend
start "VitaWatch Spectra - Next.js Frontend" cmd /k "npm run dev"

echo.
echo ===================================================
echo  VitaWatch Spectra servers launched successfully!
echo  Backend:  http://127.0.0.1:5000/api/health
echo  Frontend: http://localhost:3000
echo ===================================================
pause
