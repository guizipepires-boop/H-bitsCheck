import React, { useState } from 'react';
import { useAppContext } from '@/components/AppContext';
import HabitCard from '@/components/HabitCard';
import AddHabitModal from '@/components/AddHabitModal';

const HomePage: React.FC = () => {
  const { habits, entries, addHabit } = useAppContext();
  const [showAddHabit, setShowAddHabit] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">⚡</span>
          <h1 className="text-2xl font-bold text-white">Zona de Foco</h1>
        </div>
        <span className="text-sm uppercase text-gray-400">Hoje</span>
      </header>
      {/* Habit list */}
      <section>
        {habits.length === 0 ? (
          <p className="text-center text-gray-400">Nenhum hábito cadastrado. Clique no botão "+" para adicionar.</p>
        ) : (
          habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} entries={entries} />
          ))
        )}
      </section>
      {/* Floating Add Habit Button */}
      <button
        className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-2xl font-bold text-black shadow-lg transition hover:opacity-90"
        onClick={() => setShowAddHabit(true)}
      >
        +
      </button>
      <AddHabitModal
        visible={showAddHabit}
        onClose={() => setShowAddHabit(false)}
        onSubmit={(name, unit, quick) => addHabit(name, unit, quick)}
      />
    </div>
  );
};

export default HomePage;