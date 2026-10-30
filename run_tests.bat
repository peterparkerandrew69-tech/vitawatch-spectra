@echo off
title VitaWatch Spectra - Test Runner
echo ===================================================
echo   VitaWatch Spectra - Backend Test Suite
echo ===================================================
echo.
py -m unittest backend\tests\test_api.py
echo.
echo ===================================================
pause
