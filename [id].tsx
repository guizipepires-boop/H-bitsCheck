import React, { useState } from 'react';
import { Habit, Entry } from './AppContext';
import { useAppContext } from './AppContext';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import AddEntryModal from './AddEntryModal';

interface HabitCardProps {
  habit: Habit;
  entries: Entry[];
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, entries }) => {
  const { addEntry } = useAppContext();
  const router = useRouter();
  const [showEntry, setShowEntry] = useState(false);

  const today = dayjs().format('YYYY-MM-DD');
  const todayTotal = entries
    .filter((e) => e.habitId === habit.id && e.date === today)
    .reduce((sum, e) => sum + e.value, 0);
  const total = entries
    .filter((e) => e.habitId === habit.id)
    .reduce((sum, e) => sum + e.value, 0);

  const handleQuickAdd = (value: number) => {
    addEntry(habit.id, value);
  };

  return (
    <div
      className="relative mb-4 cursor-pointer rounded-lg bg-card p-4 shadow-md hover:bg-gray-800"
      onClick={() => router.push(`/habit/${habit.id}`)}
    >
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{habit.name}</h3>
          <p className="text-sm text-gray-400">Total: {total} {habit.unit}</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400">Hoje</span>
          <div className="text-2xl font-bold text-primary">{todayTotal}</div>
        </div>
      </div>
      <div className="mt-2 flex items-center space-x-2">
        {habit.quickAddValues.map((v) => (
          <button
            key={v}
            onClick={(e) => {
              e.stopPropagation();
              handleQuickAdd(v);
            }}
            className="rounded-md border border-primary px-3 py-1 text-sm text-primary hover:bg-primary hover:text-black"
          >
            +{v}
          </button>
        ))}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowEntry(true);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-primary text-primary hover:bg-primary hover:text-black"
        >
          +
        </button>
      </div>
      <AddEntryModal
        visible={showEntry}
        habitName={habit.name}
        onClose={() => setShowEntry(false)}
        onSubmit={(value) => addEntry(habit.id, value)}
      />
    </div>
  );
};

export default HabitCard;