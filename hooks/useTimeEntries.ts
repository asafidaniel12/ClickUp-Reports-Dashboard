'use client';

import { useQuery } from '@tanstack/react-query';
import { TimeEntry } from '@/lib/types';

interface UseTimeEntriesParams {
  startDate: Date;
  endDate: Date;
  assignee?: string | null;
  teamId?: string;
}

export function useTimeEntries({
  startDate,
  endDate,
  assignee,
  teamId,
}: UseTimeEntriesParams) {
  return useQuery({
    queryKey: ['time-entries', startDate.getTime(), endDate.getTime(), assignee, teamId],
    queryFn: async () => {
      const params = new URLSearchParams({
        start_date: startDate.getTime().toString(),
        end_date: endDate.getTime().toString(),
      });

      if (assignee) {
        params.append('assignee', assignee);
      }

      if (teamId) {
        params.append('team_id', teamId);
      }

      const response = await fetch(`/api/clickup/time-entries?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch time entries');
      }

      const data = await response.json();
      return data.data as TimeEntry[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}
