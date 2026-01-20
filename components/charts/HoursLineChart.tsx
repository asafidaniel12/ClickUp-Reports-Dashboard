'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { DayTimeData } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatHoursDisplay } from '@/lib/utils';

interface HoursLineChartProps {
  data: DayTimeData[];
}

export function HoursLineChart({ data }: HoursLineChartProps) {
  const chartData = data.map((item) => ({
    date: item.date,
    hours: Math.round(item.hours * 10) / 10,
    displayHours: formatHoursDisplay(item.hours),
    formattedDate: format(parseISO(item.date), 'dd/MM', { locale: ptBR }),
    dayOfWeek: format(parseISO(item.date), 'EEE', { locale: ptBR }),
  }));

  // Calculate average for reference line
  const totalHours = chartData.reduce((acc, d) => acc + d.hours, 0);
  const avgHours = chartData.length > 0 ? totalHours / chartData.length : 0;

  // Calculate max for domain
  const maxHours = Math.max(...chartData.map(d => d.hours), avgHours, 1);
  const domainMax = Math.ceil(maxHours * 1.2);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis
          dataKey="formattedDate"
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
          tick={{ fill: '#6b7280' }}
        />
        <YAxis
          domain={[0, domainMax]}
          tickFormatter={(value) => `${Math.round(value)}h`}
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#6b7280' }}
          width={40}
        />
        <Tooltip
          formatter={(value: number) => [formatHoursDisplay(value), 'Horas']}
          labelFormatter={(_, payload) => {
            if (payload && payload[0]) {
              const data = payload[0].payload;
              return format(parseISO(data.date), "EEEE, dd 'de' MMMM", {
                locale: ptBR,
              });
            }
            return '';
          }}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '13px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        />
        {avgHours > 0 && (
          <ReferenceLine
            y={avgHours}
            stroke="#9ca3af"
            strokeDasharray="5 5"
            label={{
              value: `Média: ${formatHoursDisplay(avgHours)}`,
              position: 'right',
              fill: '#6b7280',
              fontSize: 10,
            }}
          />
        )}
        <Line
          type="monotone"
          dataKey="hours"
          stroke="#0ea5e9"
          strokeWidth={2}
          dot={{ fill: '#0ea5e9', r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#0284c7', strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
