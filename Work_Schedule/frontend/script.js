// Global variables
let currentDate = new Date();
let selectedDate = null;
let workData = {
    workHours: {},
    monthlyTotals: {},
    settings: {
        dailyTarget: 2,
        weeklyTarget: 10
    }
};

// Load data from JSON file and localStorage
async function loadData() {
    let dataLoaded = false;

    try {
        // Sunucudan veri yükle
        console.log('🔄 Sunucudan veri okunuyor...');
        const response = await fetch('http://localhost:5000/api/data');
        console.log('📡 Fetch response:', response.status, response.ok);

        if (response.ok) {
            const jsonData = await response.json();
            console.log('📄 JSON içeriği:', JSON.stringify(jsonData).substring(0, 200) + '...');

            workData = jsonData;
            console.log('✅ Veriler sunucudan yüklendi');
            console.log('📊 Yüklenen gün sayısı:', Object.keys(workData.workHours).length);
            console.log('📅 Yüklenen günler:', Object.keys(workData.workHours));
            dataLoaded = true;

            // Sunucudan yüklenen veriyi localStorage'a da kaydet (senkronizasyon)
            localStorage.setItem('workHours', JSON.stringify(workData));
        }
    } catch (error) {
        console.log('⚠️ Sunucudan veri okunamadı:', error.message);
    }

    // Eğer JSON'dan veri yüklenmediyse localStorage'dan yükle
    if (!dataLoaded) {
        const saved = localStorage.getItem('workHours');
        if (saved) {
            workData = JSON.parse(saved);
            console.log('✅ Veriler localStorage\'dan yüklendi');
            console.log('📊 localStorage gün sayısı:', Object.keys(workData.workHours).length);
            dataLoaded = true;
        }
    }

    if (!dataLoaded) {
        console.log('ℹ️ Yeni kullanıcı - varsayılan veriler kullanılıyor');
    }
}

// Save data to both localStorage and generate JSON download
function saveData() {
    // localStorage'a kaydet (anlık yedek)
    localStorage.setItem('workHours', JSON.stringify(workData));

    // Sunucuya kaydet
    fetch('http://localhost:5000/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workData)
    }).then(res => {
        if (res.ok) {
            console.log('💾 Veriler sunucuya kaydedildi');
        } else {
            console.log('⚠️ Sunucuya kaydedilemedi');
        }
    });

    // Status göstergesi ekle
    showSaveStatus();

}


// Kayıt durumu göstergesi
function showSaveStatus() {
    const statusDiv = document.createElement('div');
    statusDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1001;
        font-weight: bold;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    statusDiv.textContent = '✓ Veriler kaydedildi!';
    document.body.appendChild(statusDiv);

    setTimeout(() => {
        statusDiv.remove();
    }, 2000);
}

// Veri durumu kontrolü
function checkDataStatus() {
    const localData = localStorage.getItem('workHours');
    const hasLocalData = localData && JSON.parse(localData).workHours;
    const localHours = hasLocalData ? Object.keys(JSON.parse(localData).workHours).length : 0;

    console.log(`📊 Veri Durumu Raporu:`);
    console.log(`   💽 localStorage: ${localHours} gün veri`);
    console.log(`   📄 JSON dosyası: ${Object.keys(workData.workHours).length} gün veri`);

    if (localHours > Object.keys(workData.workHours).length) {
        console.log(`   ⚠️ localStorage'da daha fazla veri var!`);
    }
}

// JSON dosyasını kaydet (manuel)
function saveToJson() {
    const dataStr = JSON.stringify(workData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hours.json';
    link.click();
    URL.revokeObjectURL(url);

    alert('JSON dosyası indirildi! Bu dosyayı aynı klasöre koyarak verilerinizi kalıcı hale getirebilirsiniz.');
}

// Initialize the app
async function init() {
    await loadData();
    checkDataStatus(); // Veri durumu raporu
    renderCalendar();
    updateStats();
}

// Change month
function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    renderCalendar();
    updateStats();
}

// Go to today
function goToToday() {
    currentDate = new Date();
    renderCalendar();
    updateStats();
}

// Render calendar
function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const monthYear = document.getElementById('currentMonth');

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Set month/year header
    const monthNames = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    monthYear.textContent = `${monthNames[month]} ${year}`;

    // Clear calendar
    calendar.innerHTML = '';

    // Add day headers
    const dayHeaders = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.textContent = day;
        calendar.appendChild(header);
    });

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Get starting day (Monday = 0)
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    // Add previous month's trailing days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startDay - 1; i >= 0; i--) {
        const day = prevMonth.getDate() - i;
        const dayElement = createDayElement(day, true, year, month - 1);
        calendar.appendChild(dayElement);
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = createDayElement(day, false, year, month);
        calendar.appendChild(dayElement);
    }

    // Add next month's leading days
    const totalCells = calendar.children.length - 7; // Subtract headers
    const remainingCells = 42 - totalCells; // 6 rows * 7 days
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, true, year, month + 1);
        calendar.appendChild(dayElement);
    }
}

// Create day element
function createDayElement(day, isOtherMonth, year, month) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';

    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }

    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const today = new Date().toISOString().split('T')[0];
    const selectedDateObj = new Date(dateStr);
    const todayObj = new Date(today);

    if (dateStr === today && !isOtherMonth) {
        dayElement.classList.add('today');
    } else if (selectedDateObj < todayObj && !isOtherMonth) {
        dayElement.classList.add('past-day');
    } else if (selectedDateObj > todayObj && !isOtherMonth) {
        dayElement.classList.add('future-day');
    }

    const workHours = workData.workHours[dateStr];
    if (workHours && workHours.hours > 0) {
        dayElement.classList.add('has-hours');
    }

    // Tooltip ekle
    let tooltipText = `${day} ${getMonthName(month)} ${year}`;
    if (workHours) {
        tooltipText += `\n${workHours.hours} saat çalışıldı`;
        if (workHours.description) {
            tooltipText += `\n${workHours.description}`;
        }
    } else if (selectedDateObj < todayObj && !isOtherMonth) {
        tooltipText += '\nGeçmiş gün - veri ekleyebilirsiniz';
    } else if (selectedDateObj > todayObj && !isOtherMonth) {
        tooltipText += '\nGelecek gün - planlama yapabilirsiniz';
    }

    dayElement.title = tooltipText;

    dayElement.innerHTML = `
        <div class="day-number">${day}</div>
        ${workHours ? `<div class="day-hours">${workHours.hours}h</div>` : ''}
    `;

    dayElement.onclick = () => openModal(dateStr);

    return dayElement;
}

// Ay adını getir
function getMonthName(monthIndex) {
    const monthNames = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return monthNames[monthIndex];
}

// Open modal
function openModal(dateStr) {
    selectedDate = dateStr;
    const modal = document.getElementById('modal');
    const hoursInput = document.getElementById('hoursInput');
    const descriptionInput = document.getElementById('descriptionInput');
    const deleteBtn = document.getElementById('deleteBtn');
    const modalTitle = document.getElementById('modalTitle');

    const existingData = workData.workHours[dateStr];
    const selectedDateObj = new Date(dateStr);
    const today = new Date();
    const isToday = dateStr === today.toISOString().split('T')[0];
    const isPast = selectedDateObj < today;
    const isFuture = selectedDateObj > today;

    let titleText = 'Çalışma Saati Ekle';
    if (existingData) {
        titleText = 'Çalışma Saatini Düzenle';
    } else if (isPast) {
        titleText = 'Geçmiş Güne Saat Ekle';
    } else if (isFuture) {
        titleText = 'Gelecek Güne Saat Ekle';
    } else if (isToday) {
        titleText = 'Bugüne Saat Ekle';
    }

    modalTitle.textContent = titleText;

    // Tarih bilgisini modal'a ekle
    const dateInfo = document.getElementById('dateInfo');
    const formattedDate = selectedDateObj.toLocaleDateString('tr-TR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    dateInfo.textContent = formattedDate;

    if (existingData) {
        hoursInput.value = existingData.hours;
        descriptionInput.value = existingData.description || '';
        deleteBtn.style.display = 'inline-block';
    } else {
        hoursInput.value = '';
        descriptionInput.value = '';
        deleteBtn.style.display = 'none';
    }

    modal.style.display = 'flex';
    hoursInput.focus();
}

// Close modal
function closeModal() {
    document.getElementById('modal').style.display = 'none';
    selectedDate = null;
}

// Save hours
function saveHours() {
    const hours = parseFloat(document.getElementById('hoursInput').value);
    const description = document.getElementById('descriptionInput').value;

    if (isNaN(hours) || hours < 0) {
        alert('Lütfen geçerli bir saat değeri girin!');
        return;
    }

    if (!workData.workHours[selectedDate]) {
        workData.workHours[selectedDate] = {};
    }

    workData.workHours[selectedDate].hours = hours;
    workData.workHours[selectedDate].description = description;

    saveData();
    closeModal();
    renderCalendar();
    updateStats();
}

// Delete hours
function deleteHours() {
    if (confirm('Bu günün çalışma saatini silmek istediğinizden emin misiniz?')) {
        fetch(`http://localhost:5000/api/workhours/${selectedDate}`, {
            method: 'DELETE'
        }).then(res => {
            if (res.ok) {
                delete workData.workHours[selectedDate];
                saveData();
                closeModal();
                renderCalendar();
                updateStats();
            } else {
                alert('Sunucudan silinemedi!');
            }
        });
    }
}

// Update statistics
function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = currentDate.toISOString().substring(0, 7);

    // Today's hours
    const todayHours = workData.workHours[today]?.hours || 0;
    document.getElementById('todayTotal').textContent = `${todayHours}h`;

    // Monthly total
    let monthlyTotal = 0;
    Object.keys(workData.workHours).forEach(date => {
        if (date.startsWith(currentMonth)) {
            monthlyTotal += workData.workHours[date].hours || 0;
        }
    });
    document.getElementById('monthlyTotal').textContent = `${monthlyTotal}h`;

    // Weekly total (current week)
    const weeklyTotal = getWeeklyTotal();
    document.getElementById('weeklyTotal').textContent = `${weeklyTotal}h`;

}

// Get weekly total
function getWeeklyTotal() {
    // Takvimde gösterilen ay ve yıl üzerinden haftanın Pazartesi'sini bul
    const shownDate = new Date(currentDate);
    // Haftanın gününü bul (Pazartesi = 1, Pazar = 0)
    let dayOfWeek = shownDate.getDay();
    if (dayOfWeek === 0) dayOfWeek = 7; // Pazar için düzeltme
    // Haftanın başı (Pazartesi)
    const startOfWeek = new Date(shownDate);
    startOfWeek.setDate(shownDate.getDate() - dayOfWeek + 1);

    let total = 0;
    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        total += workData.workHours[dateStr]?.hours || 0;
    }
    return total;
}

// Export data
function exportData() {
    const dataStr = JSON.stringify(workData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calisma-saatleri-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Close modal on outside click
document.getElementById('modal').onclick = function (e) {
    if (e.target === this) {
        closeModal();
    }
};

// Keyboard shortcuts
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Tema geçişi
function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('themeToggleBtn');
    const isDark = body.classList.toggle('dark-theme');
    btn.textContent = isDark ? '☀️ Gündüz Modu' : '🌙 Gece Modu';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Sayfa yüklenince tema ayarını uygula
window.onload = function () {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
        document.getElementById('themeToggleBtn').textContent = '☀️ Gündüz Modu';
    }
    init();
};
