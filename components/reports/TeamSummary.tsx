'use client';

import { TimeTrackingReport } from '@/lib/types';
import { Card, CardContent, Avatar } from '@/components/ui';
import { Clock, Users, FolderOpen, TrendingUp } from 'lucide-react';
import { formatHoursDisplay } from '@/lib/utils';

interface TeamSummaryProps {
  report: TimeTrackingReport;
}

export function TeamSummary({ report }: TeamSummaryProps) {
  const averageHoursPerMember =
    report.byMember.length > 0
      ? report.totalHours / report.byMember.length
      : 0;

  const topProject = report.byProject[0];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Hours */}
      <Card>
        <CardContent className="flex items-center gap-4 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
            <Clock className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total de Horas</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatHoursDisplay(report.totalHours)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Total Entries */}
      <Card>
        <CardContent className="flex items-center gap-4 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
            <TrendingUp className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Registros</p>
            <p className="text-2xl font-bold text-gray-900">
              {report.totalEntries}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Members Count */}
      <Card>
        <CardContent className="flex items-center gap-4 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100">
            <Users className="h-6 w-6 text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Membros Ativos</p>
            <p className="text-2xl font-bold text-gray-900">
              {report.byMember.length}
            </p>
            <p className="text-xs text-gray-500">
              Média: {formatHoursDisplay(averageHoursPerMember)}/pessoa
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Top Project */}
      <Card>
        <CardContent className="flex items-center gap-4 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
            <FolderOpen className="h-6 w-6 text-amber-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-500">Top Projeto</p>
            <p className="text-lg font-bold text-gray-900 truncate">
              {topProject?.projectName || '-'}
            </p>
            {topProject && (
              <p className="text-xs text-gray-500">
                {formatHoursDisplay(topProject.hours)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function MemberRanking({ report }: TeamSummaryProps) {
  if (report.byMember.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Ranking de Membros
        </h3>
      </div>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {report.byMember.slice(0, 5).map((member, index) => (
            <div
              key={member.memberId}
              className="flex items-center justify-between px-6 py-3 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                  {index + 1}
                </span>
                <Avatar
                  src={member.profilePicture}
                  name={member.memberName}
                  size="sm"
                />
                <span className="text-sm font-medium text-gray-900">
                  {member.memberName}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-gray-900">
                  {formatHoursDisplay(member.hours)}
                </span>
                <span className="ml-2 text-xs text-gray-500">
                  ({member.entries.length} registros)
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
