import React from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const Charts = ({ series }) => {
  if (!series || series.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Performance Trends
          </p>
          <h2 className="mt-2 text-lg font-bold text-slate-900">
            Engagement and quiz score over time
          </h2>
        </div>
        <div className="h-72 w-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50">
          <p className="text-sm text-slate-400 italic">Waiting for interaction data...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Performance Trends
        </p>
        <h2 className="mt-2 text-lg font-bold text-slate-900">
          Engagement and quiz score over time
        </h2>
      </div>

      <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <YAxis
            domain={[0, 1]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
            }}
          />
          <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: '12px' }} />
          <Line
            type="monotone"
            dataKey="engagement"
            name="Engagement"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 3, fill: '#2563eb' }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="quizScore"
            name="Quiz Score"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 3, fill: '#10b981' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
    </section>
  );
};

export default Charts;
