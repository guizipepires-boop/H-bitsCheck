// Zona de Foco – MVP (daily accumulation)
// -------------------------------------------------
// Data model (stored in localStorage)
// Habit: { id, name, unit, quickAddValues, createdAt, entries: [{date, value}] }

const STORAGE_KEY = 'zonaDeFocoHabits';
let habits = [];
let undoStack = [];
let currentHabitIdForEntry = null;

// -------------------------------------------------
// Initialization
// -------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    loadHabits();
    renderHabits();
    setupGlobalListeners();
});

function loadHabits() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        habits = JSON.parse(stored);
    } else {
        // Sample data on first access
        habits = [
            { id: Date.now() + 1, name: 'Flexões', unit: 'reps', quickAddValues: [5, 10, 20], createdAt: new Date().toISOString(), entries: [] },
            { id: Date.now() + 2, name: 'Leitura', unit: 'páginas', quickAddValues: [5, 15, 30], createdAt: new Date().toISOString(), entries: [] },
            { id: Date.now() + 3, name: 'Água', unit: 'ml', quickAddValues: [200, 500, 1000], createdAt: new Date().toISOString(), entries: [] },
        ];
        saveHabits();
    }
}

function saveHabits() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

// -------------------------------------------------
// Rendering
// -------------------------------------------------
function renderHabits() {
    const container = document.getElementById('habit-list');
    container.innerHTML = '';
    const today = new Date().toISOString().split('T')[0];

    habits.forEach(habit => {
        const todayTotal = habit.entries
            .filter(e => e.date === today)
            .reduce((sum, e) => sum + e.value, 0);
        const lifetimeTotal = habit.entries.reduce((sum, e) => sum + e.value, 0);

        const card = document.createElement('div');
        card.className = 'habit-card';
        card.innerHTML = `
      <div class="habit-title">${habit.name}</div>
      <div class="habit-stats">
        <span>Hoje: ${todayTotal} ${habit.unit}</span>
        <span>Total: ${lifetimeTotal} ${habit.unit}</span>
      </div>
      <div class="quick-buttons">
        ${habit.quickAddValues.map(v => `<button class="quick-btn" data-value="${v}">+${v}</button>`).join('')}
        <button class="quick-btn custom-btn" data-habit-id="${habit.id}">+</button>
      </div>
    `;

        // Quick add listeners
        card.querySelectorAll('.quick-btn[data-value]').forEach(btn => {
            btn.addEventListener('click', () => addEntry(habit.id, Number(btn.dataset.value)));
        });
        // Custom button opens entry modal
        card.querySelector('.custom-btn').addEventListener('click', () => openEntryModal(habit.id));

        container.appendChild(card);
    });
}

// -------------------------------------------------
// Entry handling
// -------------------------------------------------
function addEntry(habitId, value) {
    if (value <= 0) return; // rule: only positive values
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    const today = new Date().toISOString().split('T')[0];
    const entry = { date: today, value };
    habit.entries.push(entry);
    // push to undo stack (store habitId and entry index)
    undoStack.push({ habitId, entryIndex: habit.entries.length - 1 });
    saveHabits();
    renderHabits();
}

function undoLastEntry() {
    const last = undoStack.pop();
    if (!last) return alert('Nenhuma entrada para desfazer.');
    const habit = habits.find(h => h.id === last.habitId);
    if (!habit) return;
    habit.entries.splice(last.entryIndex, 1);
    saveHabits();
    renderHabits();
}

// -------------------------------------------------
// Modal for custom entry
// -------------------------------------------------
function openEntryModal(habitId) {
    currentHabitIdForEntry = habitId;
    document.getElementById('entry-value-input').value = '';
    document.getElementById('entry-modal').classList.remove('hidden');
    document.getElementById('entry-modal').classList.add('open');
    document.getElementById('entry-value-input').focus();
}

function closeEntryModal() {
    document.getElementById('entry-modal').classList.remove('open');
    document.getElementById('entry-modal').classList.add('hidden');
    currentHabitIdForEntry = null;
}

function confirmEntry() {
    const val = Number(document.getElementById('entry-value-input').value);
    if (isNaN(val) || val <= 0) return alert('Informe um valor positivo.');
    addEntry(currentHabitIdForEntry, val);
    closeEntryModal();
}

// -------------------------------------------------
// Global listeners (header buttons, modal controls)
// -------------------------------------------------
function setupGlobalListeners() {
    // Undo button
    const undoBtn = document.getElementById('undo-btn');
    if (undoBtn) undoBtn.addEventListener('click', undoLastEntry);

    // Entry modal controls
    document.getElementById('close-entry-modal').addEventListener('click', closeEntryModal);
    document.getElementById('cancel-entry').addEventListener('click', closeEntryModal);
    document.getElementById('confirm-entry').addEventListener('click', confirmEntry);

    // Close modal on overlay click
    document.getElementById('entry-modal').addEventListener('click', e => {
        if (e.target.id === 'entry-modal') closeEntryModal();
    });
}

// -------------------------------------------------
// Utility – format date (optional, for future extensions)
// -------------------------------------------------
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR');
}

// End of script
