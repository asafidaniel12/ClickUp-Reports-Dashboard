import { NextRequest, NextResponse } from 'next/server';
import { getTimeEntries, getDefaultWorkspaceId, getTeamMembers } from '@/lib/clickup';
import { TimeEntry } from '@/lib/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');
  const assignee = searchParams.get('assignee') || undefined;
  const teamId = searchParams.get('team_id');

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: 'start_date and end_date are required' },
      { status: 400 }
    );
  }

  try {
    const workspaceId = teamId || await getDefaultWorkspaceId();

    // If no specific assignee, fetch time entries for all members
    if (!assignee) {
      const { members } = await getTeamMembers(workspaceId);

      // Fetch time entries for each member in parallel
      const allEntriesPromises = members.map(member =>
        getTimeEntries(
          workspaceId,
          parseInt(startDate),
          parseInt(endDate),
          member.user.id.toString()
        ).catch(() => ({ data: [] })) // Handle individual failures gracefully
      );

      const results = await Promise.all(allEntriesPromises);

      // Combine all entries and remove duplicates by id
      const entriesMap = new Map<string, TimeEntry>();
      results.forEach(result => {
        result.data.forEach(entry => {
          entriesMap.set(entry.id, entry);
        });
      });

      const allEntries = Array.from(entriesMap.values());

      return NextResponse.json({ data: allEntries });
    }

    // If specific assignee, fetch only their entries
    const data = await getTimeEntries(
      workspaceId,
      parseInt(startDate),
      parseInt(endDate),
      assignee
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time entries' },
      { status: 500 }
    );
  }
}
