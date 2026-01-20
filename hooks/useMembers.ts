'use client';

import { useQuery } from '@tanstack/react-query';
import { Member } from '@/lib/types';

export function useMembers(teamId?: string) {
  return useQuery({
    queryKey: ['members', teamId],
    queryFn: async () => {
      const url = teamId
        ? `/api/clickup/members?team_id=${teamId}`
        : '/api/clickup/members';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }
      const data = await response.json();
      return data.members as Member[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });
}
