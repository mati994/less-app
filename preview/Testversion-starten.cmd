@echo off
cd /d "%~dp0"
echo less. Testversion - dieses Fenster geoeffnet lassen.
echo Am Rechner: http://localhost:8000/
echo Auf dem iPhone im selben WLAN: http://IPv4-Adresse-des-Rechners:8000/
echo Die IPv4-Adresse findest du mit ipconfig beim WLAN-Adapter.
echo.
where py >nul 2>nul
if %errorlevel%==0 (
    py -3 -m http.server 8000 --bind 0.0.0.0 --directory "%~dp0."
) else (
    python -m http.server 8000 --bind 0.0.0.0 --directory "%~dp0."
)
pause
