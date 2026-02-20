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

export interface Role {
  id: string;
  name: string;
  description: string | null;
  orgId: string;
}

export interface Permission {
  id: string;
  key: string;
  description: string | null;
}

export interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  userId: string;
  userEmail: string | null;
  orgId: string | null;
  details: string | null;
  timestamp: string;
}

export type TaskStatus = 'open' | 'in-progress' | 'done';
export const TASK_STATUSES: TaskStatus[] = ['open', 'in-progress', 'done'];
export const CATEGORIES = ['General', 'Work', 'Personal', 'Urgent'];

export interface CreateTaskDto {
  title: string;
  description?: string;
  orgId: string;
  category?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: string;
  category?: string;
}
