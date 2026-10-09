@echo off
title Build Navonmesh Coordinator APK
echo ========================================================
echo    NAVONMESH 2026 - COORDINATOR ANDROID APK BUILDER
echo ========================================================
echo.

echo [1/3] Building Web Production Assets...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Web build failed.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Syncing Capacitor Android Project...
call npx cap sync android
if %errorlevel% neq 0 (
    echo [ERROR] Capacitor sync failed.
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] Building Native Android APK...
cd android
if exist gradlew.bat (
    call gradlew.bat assembleDebug
    if %errorlevel% equ 0 (
        echo.
        echo ========================================================
        echo  SUCCESS: APK Generated Successfully!
        echo  Location: android\app\build\outputs\apk\debug\app-debug.apk
        echo ========================================================
        explorer app\build\outputs\apk\debug
        pause
        exit /b 0
    ) else (
        echo.
        echo [NOTICE] Local Gradle compilation requires Android SDK and Java 17.
        echo If you have Android Studio installed, opening it now...
        cd ..
        call npx cap open android
    )
) else (
    echo [ERROR] gradlew.bat not found in android directory.
)

pause
