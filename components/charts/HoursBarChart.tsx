'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { MemberTimeData } from '@/lib/types';
import { getColorForIndex, formatHoursDisplay } from '@/lib/utils';

interface HoursBarChartProps {
  data: MemberTimeData[];
}

export function HoursBarChart({ data }: HoursBarChartProps) {
  // Sort by hours descending and prepare chart data
  const chartData = [...data]
    .sort((a, b) => b.hours - a.hours)
    .map((item, index) => ({
      name: item.memberName,
      hours: Math.round(item.hours * 10) / 10, // Round to 1 decimal
      displayHours: formatHoursDisplay(item.hours),
      color: getColorForIndex(index),
    }));

  // Calculate max value for domain
  const maxHours = Math.max(...chartData.map(d => d.hours), 1);
  const domainMax = Math.ceil(maxHours * 1.2); // Add 20% padding

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 60, left: 80, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
        <XAxis
          type="number"
          domain={[0, domainMax]}
          tickFormatter={(value) => `${Math.round(value)}h`}
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis
          type="category"
          dataKey="name"
          fontSize={12}
          width={75}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          formatter={(value: number) => [formatHoursDisplay(value), 'Horas']}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
          }}
        />
        <Bar dataKey="hours" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
          <LabelList
            dataKey="displayHours"
            position="right"
            fill="#374151"
            fontSize={11}
            fontWeight={500}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
