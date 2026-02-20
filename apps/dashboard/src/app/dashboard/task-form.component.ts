import { Component, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, CATEGORIES, TASK_STATUSES } from '@org/data';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (visible()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" (click)="close.emit()"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-10">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-bold text-gray-900">
              {{ editTask() ? 'Edit Task' : 'New Task' }}
            </h2>
            <button (click)="close.emit()" class="p-1 rounded-lg hover:bg-gray-100 transition">
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" [(ngModel)]="title" name="title" required
                class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea [(ngModel)]="description" name="description" rows="3"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm resize-none"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select [(ngModel)]="category" name="category"
                  class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm">
                  @for (cat of categories; track cat) {
                    <option [value]="cat">{{ cat }}</option>
                  }
                </select>
              </div>

              @if (editTask()) {
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select [(ngModel)]="status" name="status"
                    class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm">
                    @for (s of statuses; track s) {
                      <option [value]="s">{{ statusLabel(s) }}</option>
                    }
                  </select>
                </div>
              }
            </div>

            <div class="flex gap-3 pt-2">
              <button type="button" (click)="close.emit()"
                class="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm transition">
                Cancel
              </button>
              <button type="submit"
                class="flex-1 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-sm">
                {{ editTask() ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class TaskFormComponent {
  visible = input(false);
  editTask = input<Task | null>(null);
  close = output<void>();
  save = output<{ title: string; description: string; category: string; status: string }>();

  title = '';
  description = '';
  category = 'General';
  status = 'open';
  categories = CATEGORIES;
  statuses = TASK_STATUSES;

  constructor() {
    effect(() => {
      const task = this.editTask();
      if (task) {
        this.title = task.title;
        this.description = task.description ?? '';
        this.category = task.category;
        this.status = task.status;
      } else {
        this.title = '';
        this.description = '';
        this.category = 'General';
        this.status = 'open';
      }
    });
  }

  statusLabel(s: string): string {
    const labels: Record<string, string> = {
      'open': 'Open',
      'in-progress': 'In Progress',
      'done': 'Done',
    };
    return labels[s] ?? s;
  }

  onSubmit() {
    if (!this.title.trim()) return;
    this.save.emit({
      title: this.title.trim(),
      description: this.description.trim(),
      category: this.category,
      status: this.status,
    });
  }
}
