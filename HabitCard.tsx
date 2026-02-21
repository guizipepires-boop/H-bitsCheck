import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

// Type definitions for habits, entries and goals
export interface Habit {
  id: string;
  name: string;
  unit: string;
  quickAddValues: number[];
  createdAt: string;
}

export interface Entry {
  id: string;
  habitId: string;
  date: string; // format YYYY-MM-DD
  value: number;
  createdAt: string;
}

export type GoalStatus = 'active' | 'completed' | 'canceled';

export interface Goal {
  id: string;
  habitId: string;
  targetValue: number;
  startDate: string;
  endDate: string;
  status: GoalStatus;
  createdAt: string;
}

interface AppContextValue {
  habits: Habit[];
  entries: Entry[];
  goals: Goal[];
  addHabit: (name: string, unit: string, quickAddValues: number[]) => void;
  deleteHabit: (habitId: string) => void;
  addEntry: (habitId: string, value: number) => void;
  undoLastEntry: (habitId: string) => void;
  createGoal: (habitId: string, targetValue: number, duration: number) => void;
  updateGoalStatus: (goalId: string, status: GoalStatus) => void;
}

const defaultCtx: AppContextValue = {
  habits: [],
  entries: [],
  goals: [],
  addHabit: () => {},
  deleteHabit: () => {},
  addEntry: () => {},
  undoLastEntry: () => {},
  createGoal: () => {},
  updateGoalStatus: () => {},
};

const AppContext = createContext<AppContextValue>(defaultCtx);

/**
 * Persist state in localStorage under a given key. The setter updates both
 * the state and the localStorage value.
 */
function usePersistentState<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initial;
    } catch (e) {
      console.error(e);
      return initial;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.error(e);
    }
  }, [key, state]);
  return [state, setState];
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [habits, setHabits] = usePersistentState<Habit[]>('zona_habits', []);
  const [entries, setEntries] = usePersistentState<Entry[]>('zona_entries', []);
  const [goals, setGoals] = usePersistentState<Goal[]>('zona_goals', []);

  // Helper to compute next id (uuid)
  const newId = () => uuidv4();

  const addHabit = (name: string, unit: string, quickAddValues: number[]) => {
    const habit: Habit = {
      id: newId(),
      name: name.trim(),
      unit: unit.trim(),
      quickAddValues: quickAddValues,
      createdAt: new Date().toISOString(),
    };
    setHabits((prev) => [...prev, habit]);
  };

  const deleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    setEntries((prev) => prev.filter((e) => e.habitId !== habitId));
    setGoals((prev) => prev.filter((g) => g.habitId !== habitId));
  };

  const addEntry = (habitId: string, value: number) => {
    const entry: Entry = {
      id: newId(),
      habitId,
      date: dayjs().format('YYYY-MM-DD'),
      value,
      createdAt: new Date().toISOString(),
    };
    setEntries((prev) => [...prev, entry]);
  };

  const undoLastEntry = (habitId: string) => {
    // Find the most recent entry for this habit (by createdAt) and remove it
    setEntries((prev) => {
      const idx = prev
        .map((e, i) => ({ ...e, idx: i }))
        .filter((e) => e.habitId === habitId)
        .sort((a, b) => (dayjs(b.createdAt).isAfter(dayjs(a.createdAt)) ? 1 : -1))[0]?.idx;
      if (idx === undefined) return prev;
      const copy = [...prev];
      copy.splice(idx, 1);
      return copy;
    });
  };

  const createGoal = (habitId: string, targetValue: number, duration: number) => {
    const startDate = dayjs().format('YYYY-MM-DD');
    const endDate = dayjs().add(duration, 'day').format('YYYY-MM-DD');
    const goal: Goal = {
      id: newId(),
      habitId,
      targetValue,
      startDate,
      endDate,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    // Before adding new goal, mark existing active goal as completed
    setGoals((prev) => {
      const updated = prev.map((g) =>
        g.habitId === habitId && g.status === 'active' ? { ...g, status: 'completed' } : g
      );
      return [...updated, goal];
    });
  };

  const updateGoalStatus = (goalId: string, status: GoalStatus) => {
    setGoals((prev) => prev.map((g) => (g.id === goalId ? { ...g, status } : g)));
  };

  return (
    <AppContext.Provider
      value={{
        habits,
        entries,
        goals,
        addHabit,
        deleteHabit,
        addEntry,
        undoLastEntry,
        createGoal,
        updateGoalStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useAppContext() {
  return useContext(AppContext);
}