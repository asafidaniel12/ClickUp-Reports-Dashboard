import { Workspace, Member, Space, TimeEntry, Task } from './types';

const CLICKUP_API_TOKEN = process.env.CLICKUP_API_TOKEN;
const BASE_URL = process.env.CLICKUP_API_BASE_URL || 'https://api.clickup.com/api/v2';

interface RequestOptions {
  method?: string;
  body?: unknown;
  params?: Record<string, string>;
}

export class ClickUpAPIError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ClickUpAPIError';
    this.status = status;
  }
}

export async function clickupFetch<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, params } = options;

  if (!CLICKUP_API_TOKEN) {
    throw new ClickUpAPIError('CLICKUP_API_TOKEN is not configured', 500);
  }

  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': CLICKUP_API_TOKEN,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`ClickUp API error: ${response.status} - ${errorText}`);
    throw new ClickUpAPIError(
      `ClickUp API error: ${response.status} - ${errorText}`,
      response.status
    );
  }

  return response.json();
}

// Workspace/Team functions
export async function getWorkspaces(): Promise<{ teams: Workspace[] }> {
  return clickupFetch<{ teams: Workspace[] }>('/team');
}

export async function getWorkspace(teamId: string): Promise<Workspace> {
  const { teams } = await getWorkspaces();
  const team = teams.find(t => t.id === teamId);
  if (!team) {
    throw new ClickUpAPIError(`Workspace ${teamId} not found`, 404);
  }
  return team;
}

// Member functions
export async function getTeamMembers(teamId: string): Promise<{ members: Member[] }> {
  // The members endpoint doesn't exist in ClickUp API v2
  // Members are included in the team response
  const { teams } = await getWorkspaces();
  const team = teams.find(t => t.id === teamId);
  if (!team) {
    throw new ClickUpAPIError(`Workspace ${teamId} not found`, 404);
  }
  return {
    members: team.members.map(m => ({ user: m.user }))
  };
}

// Space functions
export async function getSpaces(teamId: string): Promise<{ spaces: Space[] }> {
  return clickupFetch<{ spaces: Space[] }>(`/team/${teamId}/space`);
}

// Time Entry functions
export async function getTimeEntries(
  teamId: string,
  startDate: number,
  endDate: number,
  assignee?: string
): Promise<{ data: TimeEntry[] }> {
  const params: Record<string, string> = {
    start_date: startDate.toString(),
    end_date: endDate.toString(),
  };
  if (assignee) {
    params.assignee = assignee;
  }

  return clickupFetch<{ data: TimeEntry[] }>(
    `/team/${teamId}/time_entries`,
    { params }
  );
}

// Task functions
export async function getTasks(
  teamId: string,
  options?: {
    assignees?: string[];
    statuses?: string[];
    dateUpdatedGt?: number;
    page?: number;
  }
): Promise<{ tasks: Task[] }> {
  const params: Record<string, string> = {};

  if (options?.assignees?.length) {
    params.assignees = options.assignees.join(',');
  }
  if (options?.statuses?.length) {
    params.statuses = options.statuses.join(',');
  }
  if (options?.dateUpdatedGt) {
    params.date_updated_gt = options.dateUpdatedGt.toString();
  }
  if (options?.page) {
    params.page = options.page.toString();
  }

  return clickupFetch<{ tasks: Task[] }>(
    `/team/${teamId}/task`,
    { params }
  );
}

// Helper function to get the first workspace
export async function getDefaultWorkspaceId(): Promise<string> {
  const { teams } = await getWorkspaces();
  if (teams.length === 0) {
    throw new ClickUpAPIError('No workspaces found', 404);
  }
  return teams[0].id;
}
