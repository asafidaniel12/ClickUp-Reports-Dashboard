'use client';

import { useState, useMemo } from 'react';
import { startOfWeek, endOfDay, endOfWeek } from 'date-fns';
import { Header, FilterBar } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent, LoadingPage } from '@/components/ui';
import { HoursBarChart, HoursPieChart, HoursLineChart } from '@/components/charts';
import { TeamSummary, MemberRanking, ExportButtons } from '@/components/reports';
import { useTimeEntries, useMembers } from '@/hooks';
import { processTimeEntries, getDateRangeFromPreset } from '@/lib/utils';
import { DateRangePreset } from '@/lib/types';

export default function DashboardPage() {
  const [datePreset, setDatePreset] = useState<DateRangePreset>('thisWeek');
  const [startDate, setStartDate] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [endDate, setEndDate] = useState(() => endOfDay(new Date()));
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const { data: members = [], isLoading: loadingMembers } = useMembers();
  const {
    data: entries = [],
    isLoading: loadingEntries,
    refetch,
    isFetching,
  } = useTimeEntries({
    startDate,
    endDate,
    assignee: selectedMember,
  });

  const report = useMemo(() => processTimeEntries(entries), [entries]);

  const handleClearFilters = () => {
    setSelectedMember(null);
    const { start, end } = getDateRangeFromPreset('thisWeek');
    setStartDate(start);
    setEndDate(end);
    setDatePreset('thisWeek');
  };

  const isLoading = loadingMembers || loadingEntries;

  return (
    <>
      <Header
        title="Dashboard"
        description="Visão geral das horas trabalhadas pela equipe"
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
        actions={
          <ExportButtons entries={entries} startDate={startDate} endDate={endDate} />
        }
      />

      <FilterBar
        members={members}
        selectedMember={selectedMember}
        onMemberChange={setSelectedMember}
        datePreset={datePreset}
        onDatePresetChange={setDatePreset}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onClearFilters={handleClearFilters}
      />

      {isLoading ? (
        <LoadingPage />
      ) : (
        <>
          {/* Summary Cards */}
          <TeamSummary report={report} />

          {/* Charts */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Hours by Member */}
            <Card>
              <CardHeader>
                <CardTitle>Horas por Membro</CardTitle>
              </CardHeader>
              <CardContent>
                {report.byMember.length > 0 ? (
                  <HoursBarChart data={report.byMember} />
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-gray-500">
                    Sem dados para exibir
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hours by Project */}
            <Card>
              <CardHeader>
                <CardTitle>Horas por Projeto</CardTitle>
              </CardHeader>
              <CardContent>
                {report.byProject.length > 0 ? (
                  <HoursPieChart data={report.byProject} />
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-gray-500">
                    Sem dados para exibir
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Daily Hours Chart */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Evolução Diária</CardTitle>
            </CardHeader>
            <CardContent>
              {report.byDay.length > 0 ? (
                <HoursLineChart data={report.byDay} />
              ) : (
                <div className="flex h-[300px] items-center justify-center text-gray-500">
                  Sem dados para exibir
                </div>
              )}
            </CardContent>
          </Card>

          {/* Member Ranking */}
          <MemberRanking report={report} />
        </>
      )}
    </>
  );
}
