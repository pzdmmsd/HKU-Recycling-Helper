@echo off
setlocal
cd /d "%~dp0"
echo HKU Recycling Helper - Group 73
if exist ".venv\Scripts\python.exe" goto checkdeps
py -3.12 --version >nul 2>&1
if not errorlevel 1 (
    py -3.12 -m venv .venv
) else (
    python --version >nul 2>&1
    if errorlevel 1 goto nopython
    python -c "import sys; sys.exit(0 if sys.version_info >= (3,12) else 1)"
    if errorlevel 1 goto nopython
    python -m venv .venv
)
if errorlevel 1 goto failed
:checkdeps
if not exist ".venv\hku-requirements.sha256" goto installdeps
".venv\Scripts\python.exe" -c "from pathlib import Path; import hashlib,sys; sys.exit(0 if Path('.venv/hku-requirements.sha256').read_text().strip()==hashlib.sha256(Path('requirements.txt').read_bytes()).hexdigest() else 1)"
if not errorlevel 1 goto start
:installdeps
echo Installing project dependencies. Internet access is needed for first setup.
".venv\Scripts\python.exe" -m pip install -r requirements.txt
if errorlevel 1 goto failed
".venv\Scripts\python.exe" -c "from pathlib import Path; import hashlib; Path('.venv/hku-requirements.sha256').write_text(hashlib.sha256(Path('requirements.txt').read_bytes()).hexdigest())"
:start
if not exist .env copy .env.example .env >nul
".venv\Scripts\python.exe" launch.py
if errorlevel 1 goto failed
goto done
:nopython
echo Install Python 3.12 or newer from https://www.python.org/downloads/
echo Select "Add Python to PATH" during installation, then double-click start.bat again.
goto failed
:failed
echo Setup or startup failed. See the message above and README.md.
pause
exit /b 1
:done
endlocal

