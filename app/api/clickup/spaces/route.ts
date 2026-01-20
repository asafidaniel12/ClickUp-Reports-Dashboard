import { NextRequest, NextResponse } from 'next/server';
import { getSpaces, getDefaultWorkspaceId } from '@/lib/clickup';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const teamId = searchParams.get('team_id');

  try {
    const workspaceId = teamId || await getDefaultWorkspaceId();
    const data = await getSpaces(workspaceId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching spaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spaces' },
      { status: 500 }
    );
  }
}
