'use client';

import { useQuery } from '@tanstack/react-query';
import { Space } from '@/lib/types';

export function useSpaces(teamId?: string) {
  return useQuery({
    queryKey: ['spaces', teamId],
    queryFn: async () => {
      const url = teamId
        ? `/api/clickup/spaces?team_id=${teamId}`
        : '/api/clickup/spaces';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch spaces');
      }
      const data = await response.json();
      return data.spaces as Space[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });
}
