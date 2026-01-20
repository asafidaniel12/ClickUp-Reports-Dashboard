import { NextRequest, NextResponse } from 'next/server';
import { getTasks, getDefaultWorkspaceId } from '@/lib/clickup';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const teamId = searchParams.get('team_id');
  const assignees = searchParams.get('assignees')?.split(',').filter(Boolean);
  const statuses = searchParams.get('statuses')?.split(',').filter(Boolean);
  const dateUpdatedGt = searchParams.get('date_updated_gt');
  const page = searchParams.get('page');

  try {
    const workspaceId = teamId || await getDefaultWorkspaceId();
    const data = await getTasks(workspaceId, {
      assignees,
      statuses,
      dateUpdatedGt: dateUpdatedGt ? parseInt(dateUpdatedGt) : undefined,
      page: page ? parseInt(page) : undefined,
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
