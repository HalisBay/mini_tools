# Çalışma Takvimi Takip Uygulaması

Bu uygulama ile çalışma saatlerinizi takvim üzerinden kaydedebilir, düzenleyebilir ve istatistiklerinizi görebilirsiniz. Tüm verileriniz yerel bir JSON dosyasında saklanır ve basit bir web arayüzü ile yönetilir.

## Kurulum ve Çalıştırma

### 1. Gereksinimler
- Python 3 (Linux, Mac, Windows)
- Bash terminal (Linux/Mac, Windows için WSL veya Git Bash önerilir)

### 2. Başlatma ve Durdurma

1. Proje klasöründe terminal açın.
2. `start.sh` dosyasına çalıştırma izni verin:
   ```bash
   chmod +x start.sh
   ```
3. Sunucuları başlatmak için:
   ```bash
   ./start.sh start
   ```
4. Sunucuları durdurmak için:
   ```bash
   ./start.sh stop
   ```

Script şunları otomatik yapar:
- Python, pip ve venv kontrolü (Linux'ta eksikse otomatik kurulum, Mac/Windows'ta rehberlik)
- Sanal ortam oluşturur ve etkinleştirir
- Gerekli Python paketlerini yükler (Flask, flask-cors)
- Backend (API) ve frontend (web arayüzü) sunucularını başlatır
- Web arayüzünü varsayılan tarayıcıda açar
- Arka planda çalışan sunucuların PID dosyalarını `.logs/pid/` klasörüne, log dosyalarını `.logs/logs/` klasörüne kaydeder

### 3. Kullanım
- Web arayüzünde gün ekleyip/silebilirsiniz.
- Tüm verileriniz `data/hours.json` dosyasında saklanır.
- Backend kodları `backend/`, frontend dosyaları `frontend/` klasöründedir.

### 4. Notlar ve Platform Uyumluluğu
- Script Linux, Mac ve Windows (Git Bash/WSL ile) sistemlerinde çalışır.
- Windows ve Mac'te Python/pip/venv eksikse script size ne yapmanız gerektiğini söyler.
- Windows'ta Bash terminal (ör. Git Bash veya WSL) ile çalıştırmanız önerilir.
- Sunucular arka planda çalışır, durdurmak için `./start.sh stop` komutunu kullanabilirsiniz.
- Tüm loglar ve PID dosyaları `.logs` klasöründe tutulur.

