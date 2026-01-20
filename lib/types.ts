export interface Workspace {
  id: string;
  name: string;
  color: string;
  avatar: string | null;
  members: WorkspaceMember[];
}

export interface WorkspaceMember {
  user: User;
}

export interface User {
  id: number;
  username: string;
  email: string;
  color: string;
  profilePicture: string | null;
  initials: string;
}

export interface Member {
  user: User;
  invited_by?: User;
}

export interface Space {
  id: string;
  name: string;
  private: boolean;
  color: string | null;
  avatar: string | null;
  statuses: Status[];
}

export interface Status {
  id: string;
  status: string;
  type: string;
  orderindex: number;
  color: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  status: Status;
  assignees: User[];
  due_date: string | null;
  start_date: string | null;
  time_estimate: number | null;
  list: {
    id: string;
    name: string;
  };
  folder: {
    id: string;
    name: string;
  };
  space: {
    id: string;
  };
}

export interface TimeEntry {
  id: string;
  task: {
    id: string;
    name: string;
    status: Status;
  } | null;
  wid: string;
  user: User;
  billable: boolean;
  start: string;
  end: string;
  duration: number;
  description: string;
  tags: { name: string; tag_bg: string; tag_fg: string }[];
  source: string;
  at: string;
  task_location?: {
    list_id: string;
    folder_id: string;
    space_id: string;
    list_name: string;
    folder_name: string;
    space_name: string;
  };
}

export interface TimeTrackingReport {
  totalHours: number;
  totalEntries: number;
  byMember: MemberTimeData[];
  byProject: ProjectTimeData[];
  byDay: DayTimeData[];
}

export interface MemberTimeData {
  memberId: number;
  memberName: string;
  profilePicture: string | null;
  hours: number;
  entries: TimeEntry[];
}

export interface ProjectTimeData {
  projectId: string;
  projectName: string;
  hours: number;
  color: string;
}

export interface DayTimeData {
  date: string;
  hours: number;
}

export interface FilterState {
  startDate: Date;
  endDate: Date;
  assignee: string | null;
  spaceId: string | null;
}

export type DateRangePreset = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'custom';
