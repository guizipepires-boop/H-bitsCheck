import React from 'react';
import { Entry } from './AppContext';
import dayjs from 'dayjs';
import localePtBr from 'dayjs/locale/pt-br';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Ensure dayjs uses pt-br locale for day names
dayjs.locale(localePtBr);

interface HistoryChartProps {
  habitId: string;
  entries: Entry[];
  days?: number;
}

const HistoryChart: React.FC<HistoryChartProps> = ({ habitId, entries, days = 7 }) => {
  const today = dayjs();
  const data = [] as { name: string; value: number }[];
  for (let i = days - 1; i >= 0; i--) {
    const date = today.subtract(i, 'day');
    const dateStr = date.format('YYYY-MM-DD');
    const sum = entries
      .filter((e) => e.habitId === habitId && e.date === dateStr)
      .reduce((s, e) => s + e.value, 0);
    // Use first letter of the weekday (Portuguese), e.g. S T Q Q S S D (we can use date.format('ddd'))
    const name = date.format('dd');
    data.push({ name, value: sum });
  }
  return (
    <div className="mt-4 w-full">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
          <XAxis dataKey="name" stroke="#bbb" tickLine={false} axisLine={false} />
          <YAxis stroke="#bbb" tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#2a2a2a', border: 'none', borderRadius: '0.5rem' }}
            cursor={{ fill: 'rgba(56, 255, 58, 0.2)' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#38FF3A" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoryChart;