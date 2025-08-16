#!/bin/bash

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

    OS=$(uname)

    # pip kontrolü
    if [[ "$OS" == "Linux" ]]; then
        if ! command -v pip3 &> /dev/null; then
            echo "pip3 yüklü değil, yükleniyor..."
            sudo apt update && sudo apt install -y python3-pip
        fi
    elif [[ "$OS" == "Darwin" ]]; then
        if ! command -v pip3 &> /dev/null; then
            echo "pip3 yüklü değil! Mac'te Homebrew ile yükleyebilirsiniz: brew install python3"
            exit 1
        fi
    elif [[ "$OS" == MINGW* || "$OS" == CYGWIN* || "$OS" == MSYS* ]]; then
        if ! command -v pip &> /dev/null; then
            echo "pip yüklü değil! Windows'ta https://www.python.org/downloads/ adresinden Python'u kurun. Kurulumda 'Add Python to PATH' seçili olmalı."
            exit 1
        fi
    fi

    # venv modülü kontrolü
    if [[ "$OS" == "Linux" ]]; then
        if ! python3 -m venv --help &> /dev/null; then
            echo "python3-venv yüklü değil, yükleniyor..."
            sudo apt update && sudo apt install -y python3-venv
        fi
    elif [[ "$OS" == "Darwin" ]]; then
        if ! python3 -m venv --help &> /dev/null; then
            echo "python3-venv yüklü değil! Mac'te Homebrew ile yükleyebilirsiniz: brew install python3"
            exit 1
        fi
    elif [[ "$OS" == MINGW* || "$OS" == CYGWIN* || "$OS" == MSYS* ]]; then
        # Windows'ta venv genellikle Python ile gelir
        if ! python -m venv --help &> /dev/null; then
            echo "venv modülü eksik! Windows'ta https://www.python.org/downloads/ adresinden Python'u kurun."
            exit 1
        fi
    fi
}

function start_servers() {
    cd "$(dirname "$0")"
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi

    OS=$(uname)
    if [[ "$OS" == "Linux" ]]; then
        PIP=pip3
        ACTIVATE="source venv/bin/activate"
        OPEN_CMD="xdg-open http://localhost:8000/work.html"
    elif [[ "$OS" == "Darwin" ]]; then
        PIP=pip3
        ACTIVATE="source venv/bin/activate"
        OPEN_CMD="open http://localhost:8000/work.html"
    elif [[ "$OS" == MINGW* || "$OS" == CYGWIN* || "$OS" == MSYS* ]]; then
        PIP=python -m pip
        ACTIVATE="venv\\Scripts\\activate"
        OPEN_CMD="start http://localhost:8000/work.html"
    else
        echo "Desteklenmeyen işletim sistemi: $OS"
        exit 1
    fi

    eval $ACTIVATE
    $PIP install --upgrade pip --quiet
    $PIP install flask flask-cors --quiet

    cd backend
    nohup python server.py > ../.logs/logs/backend_server.log 2>&1 & echo $! > ../$PID_BACKEND
    cd ../frontend
    nohup python -m http.server > ../.logs/logs/frontend_server.log 2>&1 & echo $! > ../$PID_FRONTEND

    sleep 1
    eval $OPEN_CMD
    echo "Sunucular başlatıldı. Durdurmak için: ./start.sh stop"
}

function stop_servers() {
    cd "$(dirname "$0")"
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