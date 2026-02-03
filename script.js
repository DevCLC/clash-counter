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

// Горячие клавиши
document.addEventListener('keydown', (e) => {
    if (e.altKey) {
        switch (e.key.toLowerCase()) {
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
        }
    }
});

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Сначала загружаем из локального хранилища для быстрого отображения
    loadFromLocalStorage();
    
    // Затем загружаем из Firebase (обновится, если есть новые данные)
    loadFromFirebase();
    
    console.log('🎮 Горячие клавиши:');
    console.log('Alt+W — победа');
    console.log('Alt+L — поражение');
    console.log('Alt+R — сброс');
    console.log('Alt+1 — +2 победы');
    console.log('Alt+2 — +2 поражения');
    
    // Автосохранение в Firebase каждые 30 секунд (на всякий случай)
    setInterval(() => {
        if (state.wins > 0 || state.losses > 0) {
            saveToFirebase();
        }
    }, 30000);
});