import { NextResponse } from 'next/server';
import { getWorkspaces } from '@/lib/clickup';

export async function GET() {
  try {
    const data = await getWorkspaces();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspaces' },
      { status: 500 }
    );
  }
}
