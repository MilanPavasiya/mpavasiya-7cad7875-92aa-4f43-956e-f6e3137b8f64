export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  category: string;
  orgId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  parentId: string | null;
}

export type TaskStatus = 'open' | 'in-progress' | 'done';
export const TASK_STATUSES: TaskStatus[] = ['open', 'in-progress', 'done'];
export const CATEGORIES = ['General', 'Work', 'Personal', 'Urgent'];
