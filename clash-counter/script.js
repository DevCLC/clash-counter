// Состояние счетчика
let state = {
    wins: 0,
    losses: 0
};

// Загрузить из сохранения
function loadState() {
    const saved = localStorage.getItem('counterState');
    if (saved) {
        state = JSON.parse(saved);
    }
}

// Сохранить состояние
function saveState() {
    localStorage.setItem('counterState', JSON.stringify(state));
}

// Обновить отображение
function updateDisplay() {
    document.getElementById('wins').textContent = state.wins;
    document.getElementById('losses').textContent = state.losses;
    
    const total = state.wins + state.losses;
    const winrate = total > 0 ? Math.round((state.wins / total) * 100) : 0;
    
    document.getElementById('total').textContent = total;
    document.getElementById('winrate').textContent = winrate + '%';
    
    // Динамический цвет винрейта
    const winrateEl = document.getElementById('winrate');
    if (winrate >= 70) {
        winrateEl.style.color = '#2ecc71';
    } else if (winrate >= 50) {
        winrateEl.style.color = '#f39c12';
    } else {
        winrateEl.style.color = '#e74c3c';
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
    saveState();
}

// Сбросить счетчик
function resetCounter() {
        state.wins = 0;
        state.losses = 0;
        
        // Анимация сброса
        document.getElementById('wins').classList.add('number-change');
        document.getElementById('losses').classList.add('number-change');
        
        updateDisplay();
        saveState();
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
    loadState();
    updateDisplay();
    
    // Автосохранение
    setInterval(saveState, 10000);
    
    console.log('Горячие клавиши:');
    console.log('Alt+W — победа');
    console.log('Alt+L — поражение');
    console.log('Alt+R — сброс');
});