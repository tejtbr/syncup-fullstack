@echo off
REM SyncUp UML Diagrams - Batch Conversion Script (Windows)
REM Converts all .mmd files to PNG and SVG formats

setlocal enabledelayedexpansion

color 0A
echo.
echo ========================================
echo SyncUp UML Diagrams - Conversion Script
echo ========================================
echo.

REM Check if mermaid-cli is installed
where mmdc >nul 2>nul
if errorlevel 1 (
    color 0C
    echo Error: mermaid-cli is not installed
    echo.
    echo Install with:
    echo   npm install -g @mermaid-js/mermaid-cli
    echo.
    pause
    exit /b 1
)

echo [SUCCESS] mermaid-cli found
echo.

REM Get current directory
set "UML_DIR=%~dp0"

REM Create subdirectories
if not exist "%UML_DIR%png" mkdir "%UML_DIR%png"
if not exist "%UML_DIR%svg" mkdir "%UML_DIR%svg"

echo Converting diagrams...
echo.

REM Count and convert files
set COUNT=0
for %%F in ("%UML_DIR%*.mmd") do (
    set /a COUNT+=1
)

set CURRENT=0
for %%F in ("%UML_DIR%*.mmd") do (
    set /a CURRENT+=1
    set "filename=%%~nxF"
    set "basename=%%~nF"
    
    echo [!CURRENT!/%COUNT%] Converting: !filename!
    
    REM Convert to PNG
    mmdc -i "%%F" -o "%UML_DIR%png\!basename!.png" >nul 2>&1
    echo   [OK] PNG: png\!basename!.png
    
    REM Convert to SVG
    mmdc -i "%%F" -o "%UML_DIR%svg\!basename!.svg" >nul 2>&1
    echo   [OK] SVG: svg\!basename!.svg
    echo.
)

echo.
echo ========================================
echo Conversion completed successfully!
echo ========================================
echo.
echo Generated files:
echo   - PNG images: %UML_DIR%png\
echo   - SVG images: %UML_DIR%svg\
echo.
pause
