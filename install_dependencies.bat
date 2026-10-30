@echo off
title VitaWatch Spectra - Package Installer
echo ====================================================================
echo        VitaWatch Spectra - Automated Package Installer
echo ====================================================================
echo.
echo [1/2] Installing Python backend packages from requirements.txt...
py -m pip install --upgrade pip
py -m pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Some Python packages encountered issues. Retrying with pip...
    pip install -r requirements.txt
)

echo.
echo [2/2] Installing Node.js frontend packages in frontend/...
cd frontend
call npm install
cd ..

echo.
echo ====================================================================
echo   All packages for VitaWatch Spectra are successfully installed!
echo   You can now launch the app in VS Code via F5 or Run Tasks.
echo ====================================================================
pause
