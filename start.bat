@echo off
title SAFEWATCH - Team Neuronex
echo ========================================================
echo   SAFEWATCH: Smart Women Safety Wearable Prototype
echo   Team: Neuronex
echo ========================================================
echo.
echo Starting Vite Development Server...
set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
start http://localhost:3000
npm run dev
pause
