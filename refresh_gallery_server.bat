@echo off
setlocal
cd /d "%~dp0"

echo Refreshing gallery...
node generate_gallery.js

echo.
echo Starting local preview server on http://localhost:8000
python -m http.server 8000
