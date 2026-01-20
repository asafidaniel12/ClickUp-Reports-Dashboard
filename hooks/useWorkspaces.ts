'use client';

import { useQuery } from '@tanstack/react-query';
import { Workspace } from '@/lib/types';

export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const response = await fetch('/api/clickup/workspaces');
      if (!response.ok) {
        throw new Error('Failed to fetch workspaces');
      }
      const data = await response.json();
      return data.teams as Workspace[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });
}
