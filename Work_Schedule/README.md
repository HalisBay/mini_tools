# Çalışma Takvimi Takip Uygulaması

Bu uygulama ile çalışma saatlerinizi takvim üzerinden kaydedebilir, düzenleyebilir ve istatistiklerinizi görebilirsiniz. Tüm verileriniz yerel bir JSON dosyasında saklanır ve basit bir web arayüzü ile yönetilir.

## Kurulum ve Çalıştırma

### 1. Gereksinimler
- Python 3 (Linux, Mac, Windows)
- Bash terminal (Linux/Mac, Windows için WSL veya Git Bash önerilir)

### 2. Başlatma ve Durdurma

## Platforma Göre Başlatma ve Durdurma

Her işletim sistemi için ayrı başlatma dosyası kullanmalısınız:

- **Linux (Ubuntu vb.):**
   - `linux/start.sh start` ile başlatılır
   - `linux/start.sh stop` ile durdurulur
   - Gerekirse çalıştırma izni verin: `chmod +x linux/start.sh`

- **MacOS:**
   - `macos/start.sh start` ile başlatılır
   - `macos/start.sh stop` ile durdurulur
   - Gerekirse çalıştırma izni verin: `chmod +x macos/start.sh`

- **Windows:**
   - Komut istemcisinde `windows` klasörüne girin
   - `start.bat start` ile başlatılır
   - `start.bat stop` ile durdurulur

Her dosya ilgili platforma özel komutlarla çalışır ve ana işlevlerin tamamını destekler.

**Not:** Ana `start.sh` dosyası kaldırılmıştır. Lütfen yukarıdaki platforma özel dosyaları kullanın.

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

