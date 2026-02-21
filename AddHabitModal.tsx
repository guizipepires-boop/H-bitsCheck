import dayjs from 'dayjs';
import React from 'react';
import { Entry, Goal } from './AppContext';

interface GoalProgressProps {
  goal: Goal;
  entries: Entry[];
}

const GoalProgress: React.FC<GoalProgressProps> = ({ goal, entries }) => {
  // filter entries belonging to this habit and within goal period
  const progress = entries
    .filter((e) => e.habitId === goal.habitId)
    .filter((e) => dayjs(e.date).isBetween(goal.startDate, goal.endDate, 'day', '[]'))
    .reduce((sum, e) => sum + e.value, 0);
  const target = goal.targetValue;
  const pct = Math.min(1, progress / target);
  const today = dayjs();
  const start = dayjs(goal.startDate);
  const end = dayjs(goal.endDate);
  const daysPassed = Math.max(1, today.diff(start, 'day') + 1);
  const daysRemaining = Math.max(0, end.diff(today, 'day'));
  const requiredPerDay = daysRemaining > 0 ? (target - progress) / daysRemaining : 0;
  const currentPerDay = progress / daysPassed;
  let status: string;
  if (progress >= target) {
    status = 'Concluída';
  } else if (currentPerDay >= requiredPerDay) {
    status = daysRemaining > 0 ? 'No ritmo' : 'Atrasado';
  } else {
    status = 'Atrasado';
  }
  return (
    <div className="my-4 w-full rounded-lg bg-surface p-4">
      <div className="mb-2 flex justify-between text-sm font-medium text-gray-300">
        <span>
          Progresso: {progress} / {target}
        </span>
        <span>{Math.round(pct * 100)}%</span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded bg-card">
        <div
          className="absolute left-0 top-0 h-full rounded bg-primary"
          style={{ width: `${pct * 100}%` }}
        ></div>
      </div>
      <div className="mt-2 text-sm text-gray-400">
        <p>Dias restantes: {daysRemaining}</p>
        <p>Ritmo necessário: {requiredPerDay.toFixed(1)} / dia</p>
        <p>Ritmo atual: {currentPerDay.toFixed(1)} / dia</p>
        <p>Status: {status}</p>
      </div>
    </div>
  );
};

export default GoalProgress;