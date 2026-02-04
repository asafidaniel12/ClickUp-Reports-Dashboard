'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Avatar, LoadingSpinner } from '@/components/ui';
import { useTimeEntries, useMembers } from '@/hooks';
import {
  processTimeEntries,
  formatHoursDisplay,
  formatDate,
  formatDuration,
  formatDateForInput,
  parseTimestamp,
  exportToCSV,
} from '@/lib/utils';
import { MemberTimeData, TimeEntry } from '@/lib/types';
import {
  Clock,
  Users,
  Calendar,
  Download,
  RefreshCw,
  ChevronRight,
  FolderOpen,
  FileText,
  ArrowLeft,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { HoursBarChart, HoursPieChart } from '@/components/charts';

export default function DashboardPage() {
  // Date range - default to Jan 5 to Feb 5, 2025
  const [startDate, setStartDate] = useState(() => new Date(2025, 0, 5));
  const [endDate, setEndDate] = useState(() => new Date(2025, 1, 5));

  // Selected member for detail view
  const [selectedMember, setSelectedMember] = useState<MemberTimeData | null>(null);

  // Data fetching
  const { data: members = [], isLoading: loadingMembers } = useMembers();
  const {
    data: entries = [],
    isLoading: loadingEntries,
    refetch,
    isFetching,
  } = useTimeEntries({
    startDate,
    endDate,
  });

  // Process data
  const report = useMemo(() => processTimeEntries(entries), [entries]);

  // Get entries for selected member
  const memberEntries = useMemo(() => {
    if (!selectedMember) return [];
    return entries.filter((e) => e.user.id === selectedMember.memberId);
  }, [entries, selectedMember]);

  // Get projects for selected member
  const memberProjects = useMemo(() => {
    if (!selectedMember) return [];
    const projectMap = new Map<string, { name: string; hours: number; color: string }>();

    memberEntries.forEach((entry) => {
      const projectName = entry.task_location?.space_name || entry.task?.name || 'Sem projeto';
      const projectId = entry.task_location?.space_id || entry.task?.id || 'no-project';
      const duration = typeof entry.duration === 'string' ? parseInt(entry.duration, 10) : entry.duration;

      const existing = projectMap.get(projectId);
      if (existing) {
        existing.hours += duration / (1000 * 60 * 60);
      } else {
        projectMap.set(projectId, {
          name: projectName,
          hours: duration / (1000 * 60 * 60),
          color: getColorForIndex(projectMap.size),
        });
      }
    });

    return Array.from(projectMap.values()).sort((a, b) => b.hours - a.hours);
  }, [memberEntries]);

  const isLoading = loadingMembers || loadingEntries;

  const handleExport = () => {
    const dataToExport = selectedMember ? memberEntries : entries;
    const filename = selectedMember
      ? `horas_${selectedMember.memberName}_${format(startDate, 'dd-MM-yyyy')}_${format(endDate, 'dd-MM-yyyy')}`
      : `horas_equipe_${format(startDate, 'dd-MM-yyyy')}_${format(endDate, 'dd-MM-yyyy')}`;
    exportToCSV(dataToExport, filename);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="lg:pl-12">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            {selectedMember ? (
              <button
                onClick={() => setSelectedMember(null)}
                className="flex items-center gap-2 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
                {selectedMember.memberName}
              </button>
            ) : (
              'Painel de Controle'
            )}
          </h1>
          <p className="mt-1 text-slate-500">
            {selectedMember
              ? 'Detalhamento de horas do membro'
              : 'Controle de horas da equipe'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-slate-300"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            disabled={entries.length === 0}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-md border-0 lg:ml-0">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Período:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={formatDateForInput(startDate)}
                onChange={(e) => setStartDate(new Date(e.target.value + 'T00:00:00'))}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-slate-400">até</span>
              <input
                type="date"
                value={formatDateForInput(endDate)}
                onChange={(e) => setEndDate(new Date(e.target.value + 'T23:59:59'))}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="ml-auto text-sm text-slate-500">
              {format(startDate, "dd 'de' MMMM", { locale: ptBR })} - {format(endDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-slate-500">Carregando dados...</p>
          </div>
        </div>
      ) : selectedMember ? (
        /* Member Detail View */
        <MemberDetailView
          member={selectedMember}
          entries={memberEntries}
          projects={memberProjects}
        />
      ) : (
        /* Team Overview */
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              icon={Clock}
              label="Total de Horas"
              value={formatHoursDisplay(report.totalHours)}
              color="blue"
            />
            <SummaryCard
              icon={FileText}
              label="Registros"
              value={report.totalEntries.toString()}
              color="emerald"
            />
            <SummaryCard
              icon={Users}
              label="Membros Ativos"
              value={report.byMember.length.toString()}
              subtitle={`Média: ${formatHoursDisplay(report.byMember.length > 0 ? report.totalHours / report.byMember.length : 0)}/pessoa`}
              color="violet"
            />
            <SummaryCard
              icon={FolderOpen}
              label="Projetos"
              value={report.byProject.length.toString()}
              color="amber"
            />
          </div>

          {/* Members List */}
          <Card className="shadow-md border-0">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Horas por Membro
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {report.byMember.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Clock className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>Nenhum registro de horas encontrado para este período.</p>
                  <p className="text-sm mt-1">Tente ajustar as datas do filtro.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {report.byMember.map((member, index) => (
                    <button
                      key={member.memberId}
                      onClick={() => setSelectedMember(member)}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                          {index + 1}
                        </span>
                        <Avatar
                          src={member.profilePicture}
                          name={member.memberName}
                          size="md"
                        />
                        <div>
                          <p className="font-medium text-slate-900">{member.memberName}</p>
                          <p className="text-sm text-slate-500">{member.entries.length} registros</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-900">
                            {formatHoursDisplay(member.hours)}
                          </p>
                          <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                              style={{
                                width: `${Math.min((member.hours / (report.byMember[0]?.hours || 1)) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Charts */}
          {report.byProject.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-md border-0">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle>Distribuição por Membro</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <HoursBarChart data={report.byMember.slice(0, 8)} />
                </CardContent>
              </Card>

              <Card className="shadow-md border-0">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle>Distribuição por Projeto</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <HoursPieChart data={report.byProject} />
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Summary Card Component
function SummaryCard({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtitle?: string;
  color: 'blue' | 'emerald' | 'violet' | 'amber';
}) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    violet: 'from-violet-500 to-violet-600',
    amber: 'from-amber-500 to-amber-600',
  };

  return (
    <Card className="shadow-md border-0 overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-stretch">
          <div className={`w-2 bg-gradient-to-b ${colors[color]}`} />
          <div className="flex-1 p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${colors[color]}`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Member Detail View Component
function MemberDetailView({
  member,
  entries,
  projects,
}: {
  member: MemberTimeData;
  entries: TimeEntry[];
  projects: { name: string; hours: number; color: string }[];
}) {
  return (
    <div className="space-y-6">
      {/* Member Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-md border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total de Horas</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatHoursDisplay(member.hours)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Registros</p>
                <p className="text-2xl font-bold text-slate-900">{entries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600">
                <FolderOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Projetos</p>
                <p className="text-2xl font-bold text-slate-900">{projects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Breakdown */}
      {projects.length > 0 && (
        <Card className="shadow-md border-0">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-blue-600" />
              Horas por Projeto
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {projects.map((project, index) => (
                <div key={index} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="font-medium text-slate-900">{project.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: project.color,
                          width: `${Math.min((project.hours / (projects[0]?.hours || 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="font-semibold text-slate-900 w-20 text-right">
                      {formatHoursDisplay(project.hours)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity List */}
      <Card className="shadow-md border-0">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Extrato de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {entries.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Nenhuma atividade encontrada.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                      Data
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                      Tarefa
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                      Projeto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                      Descrição
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">
                      Duração
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {entries
                    .sort((a, b) => parseTimestamp(b.start).getTime() - parseTimestamp(a.start).getTime())
                    .map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-900 whitespace-nowrap">
                          {formatDate(parseTimestamp(entry.start))}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          <div className="max-w-xs truncate">
                            {entry.task?.name || 'Sem tarefa'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">
                          {entry.task_location?.space_name || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">
                          <div className="max-w-xs truncate">
                            {entry.description || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <span className="inline-flex px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-xs">
                            {formatDuration(entry.duration)}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function for colors
function getColorForIndex(index: number): string {
  const colors = [
    '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444',
    '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1',
  ];
  return colors[index % colors.length];
}
