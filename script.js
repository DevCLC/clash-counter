// === КОНФИГУРАЦИЯ FIREBASE ===
// Ваша конфигурация из Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyBgYm1QG6AmxWPgcqOtvdyyRs7RL8sFnTg",
    authDomain: "stream-counter-666.firebaseapp.com",
    databaseURL: "https://stream-counter-666-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "stream-counter-666",
    storageBucket: "stream-counter-666.firebasestorage.app",
    messagingSenderId: "280356263000",
    appId: "1:280356263000:web:e6affe74f44a776d7de62d"
};

// Инициализация Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// Состояние счетчика
let state = {
    wins: 0,
    losses: 0
};

// Элементы DOM
const elements = {
    wins: document.getElementById('wins'),
    losses: document.getElementById('losses'),
    total: document.getElementById('total'),
    winrate: document.getElementById('winrate')
};

// === ТАЙМЕР ===
let timer = {
    totalSeconds: 300, // 5 минут по умолчанию
    remainingSeconds: 300,
    isRunning: false,
    interval: null,
    totalTime: 300
};

// Элементы DOM для таймера
const timerElements = {
    display: document.getElementById('timerDisplay'),
    progress: document.getElementById('timerProgress'),
    modal: document.getElementById('timePickerModal'),
    hoursInput: document.getElementById('hoursInput'),
    minutesInput: document.getElementById('minutesInput'),
    secondsInput: document.getElementById('secondsInput')
};

// === СИНХРОНИЗАЦИЯ С FIREBASE ===

// Загрузить данные из Firebase
function loadFromFirebase() {
    const counterRef = database.ref('counter');
    
    counterRef.on('value', (snapshot) => {
        const data = snapshot.val();
        
        if (data) {
            state.wins = data.wins || 0;
            state.losses = data.losses || 0;
            updateDisplay();
            console.log('✅ Данные загружены из Firebase');
        } else {
            // Если данных нет, создаем начальные
            saveToFirebase();
        }
    }, (error) => {
        console.error('❌ Ошибка загрузки из Firebase:', error);
        loadFromLocalStorage(); // Загружаем из локального хранилища
    });
}

// Сохранить в Firebase
function saveToFirebase() {
    const counterRef = database.ref('counter');
    
    counterRef.set({
        wins: state.wins,
        losses: state.losses,
        lastUpdate: firebase.database.ServerValue.TIMESTAMP
    })
    .then(() => {
        console.log('✅ Данные сохранены в Firebase');
        saveToLocalStorage(); // Также сохраняем локально
    })
    .catch((error) => {
        console.error('❌ Ошибка сохранения в Firebase:', error);
        saveToLocalStorage(); // Сохраняем хотя бы локально
    });
}

// === ЛОКАЛЬНОЕ ХРАНИЛИЩЕ (резервное) ===

function saveToLocalStorage() {
    localStorage.setItem('counterBackup', JSON.stringify({
        wins: state.wins,
        losses: state.losses,
        timestamp: Date.now()
    }));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('counterBackup');
    if (saved) {
        const data = JSON.parse(saved);
        state.wins = data.wins || 0;
        state.losses = data.losses || 0;
        updateDisplay();
        console.log('✅ Данные загружены из локального хранилища');
    }
}

// === ОСНОВНЫЕ ФУНКЦИИ ===

// Обновить отображение
function updateDisplay() {
    // Обновляем числа
    elements.wins.textContent = state.wins;
    elements.losses.textContent = state.losses;
    
    // Рассчитываем статистику
    const total = state.wins + state.losses;
    const winrate = total > 0 ? Math.round((state.wins / total) * 100) : 0;
    
    elements.total.textContent = total;
    elements.winrate.textContent = winrate + '%';
    
    // Динамический цвет винрейта
    if (winrate >= 70) {
        elements.winrate.style.color = '#2ecc71';
    } else if (winrate >= 50) {
        elements.winrate.style.color = '#f39c12';
    } else {
        elements.winrate.style.color = '#e74c3c';
    }
}

// Изменить счетчик
function changeCounter(type, delta) {
    const element = document.getElementById(type);
    
    // Анимация изменения числа
    element.classList.remove('number-change');
    void element.offsetWidth;
    element.classList.add('number-change');
    
    // Обновление значения
    state[type] = Math.max(0, state[type] + delta);
    
    updateDisplay();
    saveToFirebase(); // Сохраняем в Firebase
}

// Сбросить счетчик
function resetCounter() {
    state.wins = 0;
    state.losses = 0;
    
    // Анимация сброса
    document.getElementById('wins').classList.add('number-change');
    document.getElementById('losses').classList.add('number-change');
    
    updateDisplay();
    saveToFirebase(); // Сохраняем в Firebase
}

// === ФУНКЦИИ ТАЙМЕРА ===

// Открыть окно установки времени
function openTimePicker() {
    if (timer.isRunning) return;
    
    // Установить текущие значения
    const hours = Math.floor(timer.totalSeconds / 3600);
    const minutes = Math.floor((timer.totalSeconds % 3600) / 60);
    const seconds = timer.totalSeconds % 60;
    
    timerElements.hoursInput.value = hours;
    timerElements.minutesInput.value = minutes;
    timerElements.secondsInput.value = seconds;
    
    timerElements.modal.style.display = 'flex';
    timerElements.hoursInput.focus();
}

// Закрыть окно установки времени
function closeTimePicker() {
    timerElements.modal.style.display = 'none';
}

// Установить пользовательское время
function setCustomTime() {
    const hours = parseInt(timerElements.hoursInput.value) || 0;
    const minutes = parseInt(timerElements.minutesInput.value) || 0;
    const seconds = parseInt(timerElements.secondsInput.value) || 0;
    
    // Валидация ввода
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
        alert('Пожалуйста, введите корректное время:\nЧасы: 0-23\nМинуты: 0-59\nСекунды: 0-59');
        return;
    }
    
    timer.totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    timer.remainingSeconds = timer.totalSeconds;
    timer.totalTime = timer.totalSeconds;
    
    updateTimerDisplay();
    closeTimePicker();
}

// Обновить отображение таймера
function updateTimerDisplay() {
    const hours = Math.floor(timer.remainingSeconds / 3600);
    const minutes = Math.floor((timer.remainingSeconds % 3600) / 60);
    const seconds = timer.remainingSeconds % 60;
    
    if (hours > 0) {
        timerElements.display.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        timerElements.display.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Обновить прогресс
    const progressPercentage = timer.totalTime > 0 ? 
        ((timer.totalTime - timer.remainingSeconds) / timer.totalTime) * 100 : 0;
    timerElements.progress.style.width = `${progressPercentage}%`;
    
    // Изменить цвет при малом времени
    if (timer.remainingSeconds <= 60) {
        timerElements.display.style.color = '#e74c3c';
        timerElements.progress.style.background = '#e74c3c';
    } else if (timer.remainingSeconds <= 300) {
        timerElements.display.style.color = '#f39c12';
        timerElements.progress.style.background = '#f39c12';
    } else {
        timerElements.display.style.color = '#3498db';
        timerElements.progress.style.background = '#3498db';
    }
}

// Запустить/остановить таймер
function toggleTimer(event) {
    if (event) event.stopPropagation();
    
    if (!timer.isRunning) {
        startTimer();
    } else {
        pauseTimer();
    }
}

// Запустить таймер
function startTimer() {
    if (timer.remainingSeconds <= 0) {
        // Если таймер завершен, сбросить
        resetTimer();
        return;
    }
    
    timer.isRunning = true;
    timerElements.display.parentElement.classList.add('timer-running');
    
    timer.interval = setInterval(() => {
        timer.remainingSeconds--;
        updateTimerDisplay();
        
        if (timer.remainingSeconds <= 0) {
            timerFinished();
        }
    }, 1000);
    
    // Поменять иконку на паузу
    const startBtn = document.querySelector('.start-btn');
    startBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M6 5H10V19H6V5Z" fill="currentColor"/>
            <path d="M14 5H18V19H14V5Z" fill="currentColor"/>
        </svg>
    `;
    startBtn.classList.remove('start-btn');
    startBtn.classList.add('pause-btn');
    startBtn.setAttribute('onclick', 'pauseTimer(event)');
}

// Остановить таймер
function pauseTimer(event) {
    if (event) event.stopPropagation();
    
    timer.isRunning = false;
    clearInterval(timer.interval);
    timerElements.display.parentElement.classList.remove('timer-running');
    
    // Поменять иконку на старт
    const pauseBtn = document.querySelector('.pause-btn');
    pauseBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
        </svg>
    `;
    pauseBtn.classList.remove('pause-btn');
    pauseBtn.classList.add('start-btn');
    pauseBtn.setAttribute('onclick', 'startTimer(event)');
}

// Сбросить таймер
function resetTimer(event) {
    if (event) event.stopPropagation();
    
    timer.isRunning = false;
    clearInterval(timer.interval);
    timer.remainingSeconds = timer.totalSeconds;
    timerElements.display.parentElement.classList.remove('timer-running');
    
    // Поменять иконку на старт (если была пауза)
    const pauseBtn = document.querySelector('.pause-btn');
    if (pauseBtn) {
        pauseBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
            </svg>
        `;
        pauseBtn.classList.remove('pause-btn');
        pauseBtn.classList.add('start-btn');
        pauseBtn.setAttribute('onclick', 'startTimer(event)');
    }
    
    updateTimerDisplay();
}

// Таймер завершен
function timerFinished() {
    timer.isRunning = false;
    clearInterval(timer.interval);
    timerElements.display.parentElement.classList.remove('timer-running');
    
    // Поменять иконку на старт
    const pauseBtn = document.querySelector('.pause-btn');
    if (pauseBtn) {
        pauseBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
            </svg>
        `;
        pauseBtn.classList.remove('pause-btn');
        pauseBtn.classList.add('start-btn');
        pauseBtn.setAttribute('onclick', 'startTimer(event)');
    }
    
    // Воспроизвести звук
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
    } catch (e) {
        console.log('Audio context not supported');
    }
    
    // Мигание таймера
    let blinkCount = 0;
    const blinkInterval = setInterval(() => {
        timerElements.display.style.visibility = 
            timerElements.display.style.visibility === 'hidden' ? 'visible' : 'hidden';
        blinkCount++;
        
        if (blinkCount >= 10) {
            clearInterval(blinkInterval);
            timerElements.display.style.visibility = 'visible';
        }
    }, 500);
}

// === ГЛОБАЛЬНЫЕ ГОРЯЧИЕ КЛАВИШИ ===
document.addEventListener('keydown', (e) => {
    if (e.altKey) {
        switch (e.key.toLowerCase()) {
            // Счетчик
            case 'w':
            case 'ц': // Русская W
                changeCounter('wins', 1);
                e.preventDefault();
                break;
                
            case 'l':
            case 'д': // Русская L
                changeCounter('losses', 1);
                e.preventDefault();
                break;
                
            case 'r':
            case 'к': // Русская R
                resetCounter();
                e.preventDefault();
                break;
                
            case '1':
                changeCounter('wins', 2);
                e.preventDefault();
                break;
                
            case '2':
                changeCounter('losses', 2);
                e.preventDefault();
                break;
            
            // Таймер
            case 't':
            case 'е': // Русская T
                toggleTimer();
                e.preventDefault();
                break;
                
            case ' ': // Пробел
                if (timerElements.modal.style.display === 'flex') {
                    setCustomTime();
                } else {
                    toggleTimer();
                }
                e.preventDefault();
                break;
        }
    }
    
    // Escape для закрытия модального окна
    if (e.key === 'Escape' && timerElements.modal.style.display === 'flex') {
        closeTimePicker();
        e.preventDefault();
    }
    
    // Enter для установки времени
    if (e.key === 'Enter' && timerElements.modal.style.display === 'flex') {
        setCustomTime();
        e.preventDefault();
    }
});

// Закрыть модальное окно при клике вне его
window.addEventListener('click', (e) => {
    if (e.target === timerElements.modal) {
        closeTimePicker();
    }
});

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Сначала загружаем из локального хранилища для быстрого отображения
    loadFromLocalStorage();
    
    // Затем загружаем из Firebase (обновится, если есть новые данные)
    loadFromFirebase();
    
    // Инициализация таймера
    updateTimerDisplay();
    
    console.log('🎮 Горячие клавиши:');
    console.log('=== Счетчик ===');
    console.log('Alt+W — победа');
    console.log('Alt+L — поражение');
    console.log('Alt+R — сброс');
    console.log('Alt+1 — +2 победы');
    console.log('Alt+2 — +2 поражения');
    console.log('');
    console.log('=== Таймер ===');
    console.log('Клик по таймеру — установить время');
    console.log('Alt+T — запуск/пауза таймера');
    console.log('Alt+Пробел — запуск/пауза таймера');
    console.log('Esc — закрыть окно установки времени');
    console.log('Enter — установить выбранное время');
    
    // Автосохранение в Firebase каждые 30 секунд (на всякий случай)
    setInterval(() => {
        if (state.wins > 0 || state.losses > 0) {
            saveToFirebase();
        }
    }, 30000);
    
    // Сохранение состояния таймера в localStorage
    setInterval(() => {
        if (timer.totalSeconds > 0) {
            localStorage.setItem('timerBackup', JSON.stringify({
                totalSeconds: timer.totalSeconds,
                remainingSeconds: timer.remainingSeconds,
                isRunning: timer.isRunning,
                totalTime: timer.totalTime
            }));
        }
    }, 10000);
    
    // Восстановление таймера из localStorage
    const savedTimer = localStorage.getItem('timerBackup');
    if (savedTimer) {
        const timerData = JSON.parse(savedTimer);
        timer.totalSeconds = timerData.totalSeconds || 300;
        timer.remainingSeconds = timerData.remainingSeconds || timer.totalSeconds;
        timer.totalTime = timerData.totalTime || timer.totalSeconds;
        updateTimerDisplay();
        
        // Если таймер был запущен, продолжить (с корректировкой времени)
        if (timerData.isRunning && timer.remainingSeconds > 0) {
            setTimeout(() => startTimer(), 100);
        }
    }
});