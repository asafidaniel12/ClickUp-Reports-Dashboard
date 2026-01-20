import { clsx, type ClassValue } from 'clsx';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  subWeeks,
  subMonths,
  format,
  parseISO,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TimeEntry, TimeTrackingReport, DateRangePreset } from './types';

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

// Safely parse duration - handles both number and string inputs
export function parseDuration(duration: number | string): number {
  const ms = typeof duration === 'string' ? parseInt(duration, 10) : duration;
  // Sanity check: if duration is absurdly large, it's likely in wrong format
  // Max reasonable duration per entry is 24 hours = 86400000 ms
  if (isNaN(ms) || ms < 0) {
    return 0;
  }
  if (ms > 86400000 * 365) {
    console.warn('Duration seems too large, might be incorrect format:', ms);
    return 0;
  }
  return ms;
}

// Convert milliseconds to hours (returns a number)
export function msToHours(ms: number | string): number {
  const milliseconds = parseDuration(ms);
  return milliseconds / (1000 * 60 * 60);
}

// Duration formatting - "Xh Ymin" format
export function formatDuration(ms: number | string): string {
  const milliseconds = parseDuration(ms);
  const totalMinutes = Math.floor(milliseconds / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}min`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}min`;
}

// Format hours (number) to display string "Xh Ymin"
export function formatHoursDisplay(hours: number): string {
  if (isNaN(hours) || hours < 0) return '0min';
  if (hours < 0.1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}min`;
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) {
    return `${m}min`;
  }
  if (m === 0) {
    return `${h}h`;
  }
  return `${h}h ${m}min`;
}

// Format hours as decimal with Brazilian locale (comma as decimal separator)
export function formatHoursDecimal(hours: number): string {
  if (isNaN(hours) || hours < 0) return '0,0h';
  return hours.toFixed(1).replace('.', ',') + 'h';
}

// Format hours for chart axis
export function formatHoursAxis(value: number): string {
  if (isNaN(value) || value <= 0) return '0h';
  if (value < 1) return `${Math.round(value * 60)}min`;
  return `${Math.round(value)}h`;
}

// Safely parse timestamp string to Date
export function parseTimestamp(timestamp: string | number): Date {
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  const parsed = parseInt(timestamp, 10);
  return isNaN(parsed) ? new Date() : new Date(parsed);
}

// Date formatting
export function formatDate(date: Date | string | number): string {
  let d: Date;
  if (typeof date === 'string') {
    // Check if it's a timestamp string
    if (/^\d+$/.test(date)) {
      d = new Date(parseInt(date, 10));
    } else {
      d = parseISO(date);
    }
  } else if (typeof date === 'number') {
    d = new Date(date);
  } else {
    d = date;
  }
  return format(d, 'dd/MM/yyyy', { locale: ptBR });
}

export function formatDateTime(date: Date | string | number): string {
  let d: Date;
  if (typeof date === 'string') {
    if (/^\d+$/.test(date)) {
      d = new Date(parseInt(date, 10));
    } else {
      d = parseISO(date);
    }
  } else if (typeof date === 'number') {
    d = new Date(date);
  } else {
    d = date;
  }
  return format(d, 'dd/MM/yyyy HH:mm', { locale: ptBR });
}

export function formatShortDate(date: Date | string | number): string {
  let d: Date;
  if (typeof date === 'string') {
    if (/^\d+$/.test(date)) {
      d = new Date(parseInt(date, 10));
    } else {
      d = parseISO(date);
    }
  } else if (typeof date === 'number') {
    d = new Date(date);
  } else {
    d = date;
  }
  return format(d, 'dd MMM', { locale: ptBR });
}

export function formatDateForInput(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

// Date range presets
export function getDateRangeFromPreset(preset: DateRangePreset): { start: Date; end: Date } {
  const now = new Date();

  switch (preset) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'yesterday':
      const yesterday = subDays(now, 1);
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
    case 'thisWeek':
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case 'lastWeek':
      const lastWeek = subWeeks(now, 1);
      return {
        start: startOfWeek(lastWeek, { weekStartsOn: 1 }),
        end: endOfWeek(lastWeek, { weekStartsOn: 1 }),
      };
    case 'thisMonth':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'lastMonth':
      const lastMonth = subMonths(now, 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    default:
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfDay(now) };
  }
}

// Process time entries into report data
export function processTimeEntries(entries: TimeEntry[]): TimeTrackingReport {
  // Calculate total duration - safely parse each entry's duration
  const totalDuration = entries.reduce((acc, entry) => {
    return acc + parseDuration(entry.duration);
  }, 0);

  // Group by member
  const memberMap = new Map<number, {
    memberId: number;
    memberName: string;
    profilePicture: string | null;
    totalMs: number;
    entries: TimeEntry[];
  }>();

  entries.forEach(entry => {
    const duration = parseDuration(entry.duration);
    const existing = memberMap.get(entry.user.id);
    if (existing) {
      existing.totalMs += duration;
      existing.entries.push(entry);
    } else {
      memberMap.set(entry.user.id, {
        memberId: entry.user.id,
        memberName: entry.user.username,
        profilePicture: entry.user.profilePicture,
        totalMs: duration,
        entries: [entry],
      });
    }
  });

  // Group by project/space
  const projectMap = new Map<string, {
    projectId: string;
    projectName: string;
    totalMs: number;
    color: string;
  }>();

  entries.forEach(entry => {
    const duration = parseDuration(entry.duration);
    const projectName = entry.task_location?.space_name || entry.task?.name || 'Sem projeto';
    const projectId = entry.task_location?.space_id || entry.task?.id || 'no-project';

    const existing = projectMap.get(projectId);
    if (existing) {
      existing.totalMs += duration;
    } else {
      projectMap.set(projectId, {
        projectId,
        projectName,
        totalMs: duration,
        color: getColorForIndex(projectMap.size),
      });
    }
  });

  // Group by day
  const dayMap = new Map<string, number>();

  entries.forEach(entry => {
    const duration = parseDuration(entry.duration);
    const timestamp = parseTimestamp(entry.start);
    const date = format(timestamp, 'yyyy-MM-dd');
    const existing = dayMap.get(date) || 0;
    dayMap.set(date, existing + duration);
  });

  // Sort days chronologically
  const sortedDays = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, ms]) => ({
      date,
      hours: msToHours(ms),
    }));

  return {
    totalHours: msToHours(totalDuration),
    totalEntries: entries.length,
    byMember: Array.from(memberMap.values())
      .map(m => ({
        memberId: m.memberId,
        memberName: m.memberName,
        profilePicture: m.profilePicture,
        hours: msToHours(m.totalMs),
        entries: m.entries,
      }))
      .sort((a, b) => b.hours - a.hours),
    byProject: Array.from(projectMap.values())
      .map(p => ({
        projectId: p.projectId,
        projectName: p.projectName,
        hours: msToHours(p.totalMs),
        color: p.color,
      }))
      .sort((a, b) => b.hours - a.hours),
    byDay: sortedDays,
  };
}

// Chart colors
const CHART_COLORS = [
  '#0ea5e9', // sky-500
  '#8b5cf6', // violet-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#ef4444', // red-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#84cc16', // lime-500
  '#6366f1', // indigo-500
];

export function getColorForIndex(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

// CSV Export
export function exportToCSV(entries: TimeEntry[], filename: string): void {
  const headers = ['Usuário', 'Tarefa', 'Descrição', 'Data', 'Início', 'Fim', 'Duração', 'Billable'];

  const rows = entries.map(entry => {
    const startDate = parseTimestamp(entry.start);
    const endDate = parseTimestamp(entry.end);
    return [
      entry.user.username,
      entry.task?.name || 'Sem tarefa',
      entry.description || '',
      formatDate(startDate),
      format(startDate, 'HH:mm'),
      format(endDate, 'HH:mm'),
      formatDuration(entry.duration),
      entry.billable ? 'Sim' : 'Não',
    ];
  });

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(';')),
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
