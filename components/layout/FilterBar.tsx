'use client';

import { Select, DatePicker, Button } from '@/components/ui';
import { DateRangePreset, Member } from '@/lib/types';
import { formatDateForInput, getDateRangeFromPreset } from '@/lib/utils';
import { Filter, X } from 'lucide-react';

interface FilterBarProps {
  members: Member[];
  selectedMember: string | null;
  onMemberChange: (memberId: string | null) => void;
  datePreset: DateRangePreset;
  onDatePresetChange: (preset: DateRangePreset) => void;
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onClearFilters: () => void;
}

const datePresetOptions = [
  { value: 'today', label: 'Hoje' },
  { value: 'yesterday', label: 'Ontem' },
  { value: 'thisWeek', label: 'Esta semana' },
  { value: 'lastWeek', label: 'Semana passada' },
  { value: 'thisMonth', label: 'Este mês' },
  { value: 'lastMonth', label: 'Mês passado' },
  { value: 'custom', label: 'Personalizado' },
];

export function FilterBar({
  members,
  selectedMember,
  onMemberChange,
  datePreset,
  onDatePresetChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClearFilters,
}: FilterBarProps) {
  const memberOptions = [
    { value: '', label: 'Todos os membros' },
    ...members.map((m) => ({
      value: m.user.id.toString(),
      label: m.user.username,
    })),
  ];

  const handlePresetChange = (value: string) => {
    const preset = value as DateRangePreset;
    onDatePresetChange(preset);

    if (preset !== 'custom') {
      const { start, end } = getDateRangeFromPreset(preset);
      onStartDateChange(start);
      onEndDateChange(end);
    }
  };

  const hasActiveFilters = selectedMember !== null;

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filtros</span>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="ml-auto text-gray-500"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Date preset */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Período
          </label>
          <Select
            options={datePresetOptions}
            value={datePreset}
            onChange={(e) => handlePresetChange(e.target.value)}
          />
        </div>

        {/* Start date */}
        <div>
          <DatePicker
            label="Data inicial"
            value={formatDateForInput(startDate)}
            onChange={(e) => {
              onStartDateChange(new Date(e.target.value + 'T00:00:00'));
              if (datePreset !== 'custom') {
                onDatePresetChange('custom');
              }
            }}
          />
        </div>

        {/* End date */}
        <div>
          <DatePicker
            label="Data final"
            value={formatDateForInput(endDate)}
            onChange={(e) => {
              onEndDateChange(new Date(e.target.value + 'T23:59:59'));
              if (datePreset !== 'custom') {
                onDatePresetChange('custom');
              }
            }}
          />
        </div>

        {/* Member filter */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Membro
          </label>
          <Select
            options={memberOptions}
            value={selectedMember || ''}
            onChange={(e) =>
              onMemberChange(e.target.value || null)
            }
          />
        </div>
      </div>
    </div>
  );
}
