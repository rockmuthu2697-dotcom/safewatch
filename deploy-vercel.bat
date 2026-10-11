@echo off
title Deploy SAFEWATCH to Vercel
echo ========================================================
echo   SAFEWATCH: Deploy to Vercel (Public URL Generator)
echo   Team: Neuronex
echo ========================================================
echo.
set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"

echo [1/3] Testing project build...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed! Please check code.
    pause
    exit /b %ERRORLEVEL%
)
echo [SUCCESS] Build completed error-free!
echo.
echo ========================================================
echo   [2/3] Vercel Login (First time only)
echo   - Terminal-la login prompt kekkum.
echo   - "Continue with GitHub" or Email select pannunga.
echo   - Browser-la verify/approve aana udane terminal-ku vaanga.
echo ========================================================
echo.
call npx vercel login
echo.
echo ========================================================
echo   [3/3] Deploying to Production...
echo   - Prompts ellathukum default [Enter] press pannunga.
echo ========================================================
echo.
call npx vercel --prod
echo.
echo ========================================================
echo   All done! Production URL mela generate aagirukkum.
echo   Athai copy panni use pannunga!
echo ========================================================
pause
