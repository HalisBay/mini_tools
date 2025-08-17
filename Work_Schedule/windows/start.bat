@echo off
REM Proje ana dizinine geç
cd ..

REM Gerekli log klasörlerini oluştur
if not exist .logs\pid mkdir .logs\pid
if not exist .logs\logs mkdir .logs\logs

set ACTION=%1
if "%ACTION%"=="" set ACTION=start
set PID_BACKEND=.logs\pid\backend_server.pid
set PID_FRONTEND=.logs\pid\frontend_server.pid

REM Python ve pip kontrolü
where python >nul 2>nul || (
    echo Python yüklü değil! https://www.python.org/downloads/ adresinden kurun ve PATH'e ekleyin.
    exit /b 1
)
where pip >nul 2>nul || (
    echo pip yüklü değil! Python'u tekrar kurun veya pip'i ekleyin.
    exit /b 1
)

REM venv kontrolü ve oluşturma
if not exist venv (
    python -m venv venv
)

REM venv'i aktive et
call venv\Scripts\activate.bat
pip install --upgrade pip
pip install flask flask-cors

if "%ACTION%"=="start" (
    REM Backend sunucusunu başlat
    pushd backend
    start /b python server.py > ..\.logs\logs\backend_server.log 2>&1
    powershell -Command "Get-Process -Name python | Sort-Object StartTime -Descending | Select-Object -First 1 | ForEach-Object { $_.Id }" > ..\.logs\pid\backend_server.pid
    popd

    REM Frontend sunucusunu başlat
    pushd frontend
    start /b python -m http.server > ..\.logs\logs\frontend_server.log 2>&1
    powershell -Command "Get-Process -Name python | Sort-Object StartTime -Descending | Select-Object -First 1 | ForEach-Object { $_.Id }" > ..\.logs\pid\frontend_server.pid
    popd

    REM Tarayıcıda aç
    start http://localhost:8000/work.html
    echo Sunucular başlatıldı. Durdurmak için: start.bat stop
) else if "%ACTION%"=="stop" (
    REM Backend sunucusunu durdur
    if exist %PID_BACKEND% (
        set /p PID_B=<%PID_BACKEND%
        taskkill /PID %PID_B% /F
        del %PID_BACKEND%
        echo Backend sunucusu durduruldu.
    ) else (
        echo Backend sunucusu zaten çalışmıyor (PID dosyası yok).
    )
    REM Frontend sunucusunu durdur
    if exist %PID_FRONTEND% (
        set /p PID_F=<%PID_FRONTEND%
        taskkill /PID %PID_F% /F
        del %PID_FRONTEND%
        echo Frontend sunucusu durduruldu.
    ) else (
        echo Frontend sunucusu zaten çalışmıyor (PID dosyası yok).
    )
) else (
    echo Kullanım: start.bat [start|stop]
    exit /b 1
)
