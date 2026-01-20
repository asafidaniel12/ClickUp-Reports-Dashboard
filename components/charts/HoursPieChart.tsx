'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { ProjectTimeData } from '@/lib/types';
import { formatHoursDisplay } from '@/lib/utils';

interface HoursPieChartProps {
  data: ProjectTimeData[];
}

export function HoursPieChart({ data }: HoursPieChartProps) {
  // Limit to 5 projects, group rest as "Outros"
  const MAX_PROJECTS = 5;

  const chartData = data.slice(0, MAX_PROJECTS).map((item) => ({
    name: item.projectName,
    fullName: item.projectName,
    value: Math.round(item.hours * 10) / 10,
    displayValue: formatHoursDisplay(item.hours),
    color: item.color,
  }));

  // If there are more than MAX_PROJECTS projects, group the rest as "Others"
  if (data.length > MAX_PROJECTS) {
    const othersHours = data
      .slice(MAX_PROJECTS)
      .reduce((acc, item) => acc + item.hours, 0);
    chartData.push({
      name: 'Outros',
      fullName: `Outros (${data.length - MAX_PROJECTS} projetos)`,
      value: Math.round(othersHours * 10) / 10,
      displayValue: formatHoursDisplay(othersHours),
      color: '#9ca3af',
    });
  }

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }) => {
    if (percent < 0.08) return null; // Hide labels for small slices

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom legend formatter to show name + hours
  const renderLegend = (value: any, entry: any) => {
    const hours = entry.payload?.displayValue || '';
    const fullName = entry.payload?.fullName || value;
    // Truncate long names
    const displayName = fullName.length > 20 ? fullName.substring(0, 18) + '...' : fullName;
    return (
      <span className="text-xs text-gray-700">
        {displayName} - <span className="font-semibold">{hours}</span>
      </span>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="40%"
          cy="50%"
          labelLine={false}
          label={renderCustomLabel}
          outerRadius={90}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [formatHoursDisplay(value), 'Horas']}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
          }}
        />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ paddingLeft: '10px' }}
          formatter={renderLegend}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
