// State
let habits = JSON.parse(localStorage.getItem('habits')) || [
    { id: 1697523, name: 'Beber 2L de água', checks: {} },
    { id: 1697524, name: 'Ler 30 min', checks: {} }
];

let currentWeekOffset = 0; // 0 = current week

// DOM Elements
const habitsBody = document.getElementById('habits-body');
const weekDisplay = document.getElementById('week-display');
const weekDates = document.getElementById('week-dates');
const modalOverlay = document.getElementById('habit-modal');
const habitNameInput = document.getElementById('habit-name-input');
const emptyState = document.getElementById('empty-state');
const contextMenu = document.getElementById('context-menu');
let currentHabitIdForMenu = null;
let longPressTimer;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    updateWeekDisplay();
    renderHabits();
    setupEventListeners();
    setupContextMenuListeners();
});

// --- Core Logic ---

function getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}

function getDatesForWeek(offset) {
    const today = new Date();
    // Calculate start date (Monday) based on offset
    const monday = getMonday(today);
    monday.setDate(monday.getDate() + (offset * 7));

    const dates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        dates.push(date.toISOString().split('T')[0]); // YYYY-MM-DD
    }
    return dates;
}

function getWeekLabel(dates) {
    const start = new Date(dates[0]);
    const end = new Date(dates[6]);

    const options = { day: 'numeric', month: 'short' };
    const startStr = start.toLocaleDateString('pt-BR', options);
    const endStr = end.toLocaleDateString('pt-BR', options);

    return `${startStr} - ${endStr}`;
}

// --- Rendering ---

function renderHabits() {
    habitsBody.innerHTML = '';

    if (habits.length === 0) {
        emptyState.classList.remove('hidden');
        document.querySelector('.habits-table').classList.add('hidden');
        return;
    } else {
        emptyState.classList.add('hidden');
        document.querySelector('.habits-table').classList.remove('hidden');
    }

    const currentWeekDates = getDatesForWeek(currentWeekOffset);

    habits.forEach(habit => {
        const row = document.createElement('tr');

        // Name Cell (Click for Context Menu)
        const nameCell = document.createElement('td');
        nameCell.className = 'habit-name-cell';
        nameCell.innerHTML = `<span class="habit-name">${habit.name}</span>`;
        nameCell.onclick = (e) => showContextMenu(e, habit.id);

        row.appendChild(nameCell);

        // Days Cells
        currentWeekDates.forEach(dateStr => {
            const cell = document.createElement('td');
            const status = habit.checks[dateStr] || 'empty';

            let icon = '';
            let className = 'habit-check';

            if (status === 'checked') {
                className += ' checked';
                icon = '<i class="fa-solid fa-check"></i>';
            } else if (status === 'crossed') {
                className += ' crossed';
                icon = '<i class="fa-solid fa-xmark"></i>';
            }

            cell.innerHTML = `
                <div class="${className}" onclick="toggleCheck(${habit.id}, '${dateStr}')">
                    ${icon}
                </div>
            `;
            row.appendChild(cell);
        });

        habitsBody.appendChild(row);
    });
}

function showContextMenu(event, habitId) {
    currentHabitIdForMenu = habitId;
    event.stopPropagation(); // Stop bubbling (important for click interaction)

    let x, y;
    if (event.touches) {
        x = event.touches[0].clientX;
        y = event.touches[0].clientY;
    } else {
        x = event.clientX;
        y = event.clientY;
    }

    // Adjust if too close to right edge
    if (x > window.innerWidth - 130) x = window.innerWidth - 130;
    // Adjust if too close to bottom
    if (y > window.innerHeight - 100) y = window.innerHeight - 100;

    // Position menu
    contextMenu.style.top = `${y}px`;
    contextMenu.style.left = `${x}px`;
    contextMenu.classList.add('open');

    if (navigator.vibrate) navigator.vibrate(50);
}


function updateWeekDisplay() {
    const dates = getDatesForWeek(currentWeekOffset);
    weekDates.textContent = getWeekLabel(dates);

    // Update "Current Week" label logic if needed, simplify for now
    const label = document.querySelector('.week-label');
    if (currentWeekOffset === 0) label.textContent = 'Semana Atual';
    else if (currentWeekOffset === -1) label.textContent = 'Semana Passada';
    else if (currentWeekOffset === 1) label.textContent = 'Próxima Semana';
    else label.textContent = currentWeekOffset < 0 ? `${Math.abs(currentWeekOffset)} semanas atrás` : `Em ${currentWeekOffset} semanas`;
}

// --- Context Menu Actions ---

function setupContextMenuListeners() {
    document.getElementById('ctx-rename').addEventListener('click', () => {
        const id = currentHabitIdForMenu;
        closeContextMenu();
        renameHabit(id);
    });

    document.getElementById('ctx-delete').addEventListener('click', () => {
        const id = currentHabitIdForMenu;
        closeContextMenu();
        deleteHabit(id);
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!contextMenu.contains(e.target)) {
            closeContextMenu();
        }
    });

    // Close on scroll
    window.addEventListener('scroll', closeContextMenu);
}

function closeContextMenu() {
    contextMenu.classList.remove('open');
    currentHabitIdForMenu = null;
}

function renameHabit(id) {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const newName = prompt("Renomear hábito:", habit.name);
    if (newName && newName.trim() !== "") {
        habit.name = newName.trim();
        saveHabits();
        renderHabits();
    }
}

// --- Actions ---

window.toggleCheck = function (habitId, dateStr) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    // Cycle: empty -> checked -> crossed -> empty
    const currentStatus = habit.checks[dateStr];
    let newStatus;

    if (!currentStatus || currentStatus === 'empty') newStatus = 'checked';
    else if (currentStatus === 'checked') newStatus = 'crossed';
    else newStatus = 'empty'; // Remove key

    if (newStatus === 'empty') {
        delete habit.checks[dateStr];
    } else {
        habit.checks[dateStr] = newStatus;
    }

    saveHabits();
    renderHabits();
};

window.addNewHabit = function () {
    modalOverlay.classList.add('open');
    habitNameInput.focus();
};

window.deleteHabit = function (id) {
    if (confirm('Tem certeza que deseja excluir este hábito?')) {
        habits = habits.filter(h => h.id !== id);
        saveHabits();
        renderHabits();
    }
};

window.setHabitName = function (name) {
    habitNameInput.value = name;
};

function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

// --- Event Listeners ---

function setupEventListeners() {
    // Navigation
    document.getElementById('prev-week').addEventListener('click', () => {
        currentWeekOffset--;
        updateUpdateAll();
    });

    document.getElementById('next-week').addEventListener('click', () => {
        currentWeekOffset++;
        updateUpdateAll();
    });

    document.getElementById('add-habit-btn').addEventListener('click', window.addNewHabit);

    // Modal
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('cancel-habit').addEventListener('click', closeModal);
    document.getElementById('save-habit').addEventListener('click', saveNewHabit);

    // Close modal on outside click
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    // Keyboard support for Modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
            closeModal();
        }
        if (e.key === 'Enter' && modalOverlay.classList.contains('open')) {
            saveNewHabit();
        }
    });

    // Arrow keys navigation
    document.addEventListener('keydown', (e) => {
        if (modalOverlay.classList.contains('open')) return;
        if (e.key === 'ArrowLeft') {
            currentWeekOffset--;
            updateUpdateAll();
        } else if (e.key === 'ArrowRight') {
            currentWeekOffset++;
            updateUpdateAll();
        }
    });

    // Swipe Support
    let touchStartX = 0;

    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    document.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].screenX;
        handleSwipe(touchStartX, touchEndX);
    }, false);
}

function handleSwipe(start, end) {
    const threshold = 50;
    const diff = start - end;

    if (Math.abs(diff) > threshold) {
        if (diff > 0) {
            // Swipe Left -> Next Week
            currentWeekOffset++;
        } else {
            // Swipe Right -> Prev Week
            currentWeekOffset--;
        }
        updateUpdateAll();
    }
}

function updateUpdateAll() {
    updateWeekDisplay();
    renderHabits();
}

function closeModal() {
    modalOverlay.classList.remove('open');
    habitNameInput.value = '';
}

function saveNewHabit() {
    const name = habitNameInput.value.trim();
    if (!name) return;

    const newHabit = {
        id: Date.now(),
        name: name,
        checks: {}
    };

    habits.push(newHabit);
    saveHabits();
    renderHabits();
    closeModal();
}

// Helper to support "Enter" key in modal input specifically (if button wasn't default)
habitNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveNewHabit();
});
