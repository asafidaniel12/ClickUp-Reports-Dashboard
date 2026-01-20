'use client';

import { TimeEntry } from '@/lib/types';
import { formatDate, formatDuration, parseTimestamp, parseDuration } from '@/lib/utils';
import { Avatar } from '@/components/ui';
import { format } from 'date-fns';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TimeTrackingTableProps {
  entries: TimeEntry[];
}

type SortField = 'user' | 'task' | 'date' | 'duration';
type SortDirection = 'asc' | 'desc';

export function TimeTrackingTable({ entries }: TimeTrackingTableProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedEntries = [...entries].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'user':
        comparison = a.user.username.localeCompare(b.user.username);
        break;
      case 'task':
        comparison = (a.task?.name || '').localeCompare(b.task?.name || '');
        break;
      case 'date':
        comparison = parseTimestamp(a.start).getTime() - parseTimestamp(b.start).getTime();
        break;
      case 'duration':
        comparison = parseDuration(a.duration) - parseDuration(b.duration);
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-primary-600" />
    ) : (
      <ChevronDown className="h-4 w-4 text-primary-600" />
    );
  };

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">Nenhum registro de tempo encontrado para o período selecionado.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100"
                onClick={() => handleSort('user')}
              >
                <div className="flex items-center gap-1">
                  Usuário
                  <SortIcon field="user" />
                </div>
              </th>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100"
                onClick={() => handleSort('task')}
              >
                <div className="flex items-center gap-1">
                  Tarefa
                  <SortIcon field="task" />
                </div>
              </th>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-1">
                  Data
                  <SortIcon field="date" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Horário
              </th>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100"
                onClick={() => handleSort('duration')}
              >
                <div className="flex items-center gap-1">
                  Duração
                  <SortIcon field="duration" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Descrição
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {sortedEntries.map((entry) => {
              const startDate = parseTimestamp(entry.start);
              const endDate = parseTimestamp(entry.end);

              return (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={entry.user.profilePicture}
                        name={entry.user.username}
                        size="sm"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {entry.user.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <span className="text-sm text-gray-900 line-clamp-1">
                        {entry.task?.name || 'Sem tarefa'}
                      </span>
                      {entry.task_location?.space_name && (
                        <span className="text-xs text-gray-500 block">
                          {entry.task_location.space_name}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {formatDate(startDate)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-700">
                      {formatDuration(entry.duration)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                      {entry.description || '-'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
