import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task, TASK_STATUSES } from '@org/data';
import { AuthService } from '../auth/auth.service';

export interface TaskFilter {
  search: string;
  category: string;
  sortBy: 'newest' | 'oldest' | 'title';
}

@Injectable({ providedIn: 'root' })
export class TaskStore {
  private _tasks = signal<Task[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _filter = signal<TaskFilter>({ search: '', category: 'all', sortBy: 'newest' });

  /**
   * Stable mutable column arrays for CDK drag-drop.
   * Rebuilt only when _tasks or _filter change, keeping the same
   * array references between change-detection cycles so CDK's
   * transferArrayItem / moveItemInArray can mutate them in-place.
   */
  private _columns: Record<string, Task[]> = {};
  private _columnsVersion = signal(0);

  loading = this._loading.asReadonly();
  error = this._error.asReadonly();
  filter = this._filter.asReadonly();

  filteredTasks = computed(() => {
    let tasks = [...this._tasks()];
    const f = this._filter();

    if (f.search) {
      const q = f.search.toLowerCase();
      tasks = tasks.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q),
      );
    }

    if (f.category !== 'all') {
      tasks = tasks.filter((t) => t.category === f.category);
    }

    switch (f.sortBy) {
      case 'newest':
        tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        tasks.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'title':
        tasks.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return tasks;
  });

  tasksByStatus = computed(() => {
    this._columnsVersion();
    return this._columns;
  });

  constructor(private http: HttpClient, private auth: AuthService) {
    effect(() => {
      const tasks = this.filteredTasks();
      const cols: Record<string, Task[]> = {};
      for (const s of TASK_STATUSES) {
        cols[s] = tasks.filter((t) => t.status === s);
      }
      this._columns = cols;
      this._columnsVersion.update((v) => v + 1);
    });
  }

  setFilter(partial: Partial<TaskFilter>) {
    this._filter.update((f) => ({ ...f, ...partial }));
  }

  loadTasks() {
    this._loading.set(true);
    this._error.set(null);
    this.http.get<Task[]>('/api/tasks').subscribe({
      next: (tasks) => {
        this._tasks.set(tasks);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err.error?.message || 'Failed to load tasks');
        this._loading.set(false);
      },
    });
  }

  createTask(data: { title: string; description?: string; category?: string }) {
    const orgId = this.auth.selectedOrgId();
    if (!orgId) return;

    this._loading.set(true);
    this.http.post<Task>('/api/tasks', { ...data, orgId }).subscribe({
      next: (task) => {
        this._tasks.update((ts) => [task, ...ts]);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err.error?.message || 'Failed to create task');
        this._loading.set(false);
      },
    });
  }

  updateTask(id: string, data: Partial<Pick<Task, 'title' | 'description' | 'status' | 'category'>>) {
    this.http.put<Task>(`/api/tasks/${id}`, data).subscribe({
      next: (updated) => {
        this._tasks.update((ts) => ts.map((t) => (t.id === id ? updated : t)));
      },
      error: (err) => {
        this._error.set(err.error?.message || 'Failed to update task');
      },
    });
  }

  deleteTask(id: string) {
    this.http.delete(`/api/tasks/${id}`).subscribe({
      next: () => {
        this._tasks.update((ts) => ts.filter((t) => t.id !== id));
      },
      error: (err) => {
        this._error.set(err.error?.message || 'Failed to delete task');
      },
    });
  }

  moveTask(taskId: string, newStatus: string) {
    this._tasks.update((ts) =>
      ts.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );
    this.updateTask(taskId, { status: newStatus });
  }
}
