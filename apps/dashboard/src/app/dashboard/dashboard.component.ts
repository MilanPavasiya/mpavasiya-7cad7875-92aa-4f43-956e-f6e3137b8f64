import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { TaskStore } from '../store/task.store';
import { TaskBoardComponent } from './task-board.component';
import { TaskFormComponent } from './task-form.component';
import { Task, CATEGORIES } from '@org/data';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskBoardComponent, TaskFormComponent],
  template: `
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
            </div>
            <h1 class="text-lg font-bold text-gray-900 hidden sm:block">Task Manager</h1>
          </div>

          <div class="flex items-center gap-4">
            @if (auth.orgs().length > 1) {
              <select
                [ngModel]="auth.selectedOrgId()"
                (ngModelChange)="onOrgChange($event)"
                class="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none">
                @for (org of auth.orgs(); track org.id) {
                  <option [value]="org.id">{{ org.name }}</option>
                }
              </select>
            }

            <div class="flex items-center gap-2 text-sm text-gray-600">
              <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-xs">
                {{ userInitial() }}
              </div>
              <span class="hidden sm:inline">{{ auth.user()?.email }}</span>
            </div>

            <button (click)="auth.logout()"
              class="text-sm text-gray-500 hover:text-red-600 transition font-medium">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Toolbar -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <!-- Search -->
        <div class="relative flex-1 w-full sm:max-w-xs">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" placeholder="Search tasks..."
            [ngModel]="store.filter().search"
            (ngModelChange)="store.setFilter({ search: $event })"
            class="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
        </div>

        <!-- Category filter -->
        <select
          [ngModel]="store.filter().category"
          (ngModelChange)="store.setFilter({ category: $event })"
          class="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
          <option value="all">All Categories</option>
          @for (cat of categories; track cat) {
            <option [value]="cat">{{ cat }}</option>
          }
        </select>

        <!-- Sort -->
        <select
          [ngModel]="store.filter().sortBy"
          (ngModelChange)="store.setFilter({ sortBy: $event })"
          class="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="title">By Title</option>
        </select>

        <div class="flex-1"></div>

        <!-- New task button -->
        <button (click)="openCreateForm()"
          class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          New Task
        </button>
      </div>
    </div>

    <!-- Error -->
    @if (store.error()) {
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          {{ store.error() }}
          <button (click)="store.loadTasks()" class="text-red-600 underline text-xs ml-4">Retry</button>
        </div>
      </div>
    }

    <!-- Loading -->
    @if (store.loading()) {
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <svg class="animate-spin h-4 w-4 text-indigo-600" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Loading tasks...
        </div>
      </div>
    }

    <!-- Board -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <app-task-board
        [tasksByStatus]="store.tasksByStatus()"
        (editTask)="openEditForm($event)"
        (deleteTask)="onDelete($event)"
        (moveTask)="onMove($event)" />
    </div>

    <!-- Task Form Modal -->
    <app-task-form
      [visible]="formVisible()"
      [editTask]="editingTask()"
      (close)="closeForm()"
      (save)="onSave($event)" />
  `,
})
export class DashboardComponent implements OnInit {
  formVisible = signal(false);
  editingTask = signal<Task | null>(null);
  categories = CATEGORIES;

  constructor(public auth: AuthService, public store: TaskStore) {}

  ngOnInit() {
    this.auth.loadOrgs().subscribe(() => {
      this.store.loadTasks();
    });
  }

  userInitial(): string {
    const email = this.auth.user()?.email ?? '';
    return email.charAt(0).toUpperCase();
  }

  onOrgChange(orgId: string) {
    this.auth.selectOrg(orgId);
    this.store.loadTasks();
  }

  openCreateForm() {
    this.editingTask.set(null);
    this.formVisible.set(true);
  }

  openEditForm(task: Task) {
    this.editingTask.set(task);
    this.formVisible.set(true);
  }

  closeForm() {
    this.formVisible.set(false);
    this.editingTask.set(null);
  }

  onSave(data: { title: string; description: string; category: string; status: string }) {
    const existing = this.editingTask();
    if (existing) {
      this.store.updateTask(existing.id, data);
    } else {
      this.store.createTask(data);
    }
    this.closeForm();
  }

  onDelete(task: Task) {
    if (confirm(`Delete "${task.title}"?`)) {
      this.store.deleteTask(task.id);
    }
  }

  onMove(event: { taskId: string; newStatus: string }) {
    this.store.moveTask(event.taskId, event.newStatus);
  }
}
