#!/bin/bash


# Proje ana dizinine geç
cd "$(dirname "$0")/.."

# Gerekli log klasörlerini oluştur
mkdir -p .logs/pid
mkdir -p .logs/logs
ACTION=${1:-start}
PID_BACKEND=".logs/pid/backend_server.pid"
PID_FRONTEND=".logs/pid/frontend_server.pid"

function check_requirements() {
    if ! command -v python3 &> /dev/null; then
        echo "Python3 yüklü değil! Lütfen sisteminize python3 kurun."
        exit 1
    fi
    if ! command -v pip3 &> /dev/null; then
        echo "pip3 yüklü değil! Mac'te Homebrew ile yükleyebilirsiniz: brew install python3"
        exit 1
    fi
    if ! python3 -m venv --help &> /dev/null; then
        echo "python3-venv yüklü değil! Mac'te Homebrew ile yükleyebilirsiniz: brew install python3"
        exit 1
    fi
}

function start_servers() {
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    OPEN_CMD="open http://localhost:8000/work.html"
    source venv/bin/activate
    venv/bin/pip install --upgrade pip --quiet
    venv/bin/pip install flask flask-cors --quiet
    cd backend
    nohup ../venv/bin/python server.py > ../.logs/logs/backend_server.log 2>&1 & echo $! > ../.logs/pid/backend_server.pid
    cd ../frontend
    nohup ../venv/bin/python -m http.server > ../.logs/logs/frontend_server.log 2>&1 & echo $! > ../.logs/pid/frontend_server.pid
    cd ..
    sleep 1
    eval $OPEN_CMD
    echo "Sunucular başlatıldı. Durdurmak için: ./start.sh stop"
}

function stop_servers() {
    if [ -f "$PID_BACKEND" ]; then
        PID_B=$(cat $PID_BACKEND)
        if ps -p $PID_B > /dev/null 2>&1; then
            kill $PID_B && echo "Backend sunucusu durduruldu."
        else
            echo "Backend sunucusu zaten çalışmıyor (PID $PID_B aktif değil)."
        fi
        rm -f $PID_BACKEND
    else
        echo "Backend sunucusu zaten çalışmıyor (PID dosyası yok)."
    fi
    if [ -f "$PID_FRONTEND" ]; then
        PID_F=$(cat $PID_FRONTEND)
        if ps -p $PID_F > /dev/null 2>&1; then
            kill $PID_F && echo "Frontend sunucusu durduruldu."
        else
            echo "Frontend sunucusu zaten çalışmıyor (PID $PID_F aktif değil)."
        fi
        rm -f $PID_FRONTEND
    else
        echo "Frontend sunucusu zaten çalışmıyor (PID dosyası yok)."
    fi
}

check_requirements

if [ "$ACTION" == "start" ]; then
    start_servers
elif [ "$ACTION" == "stop" ]; then
    stop_servers
else
    echo "Kullanım: ./start.sh [start|stop]"
    exit 1
fi
