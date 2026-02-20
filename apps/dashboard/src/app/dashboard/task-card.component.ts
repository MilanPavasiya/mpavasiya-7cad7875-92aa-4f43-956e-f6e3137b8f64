import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '@org/data';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition cursor-grab active:cursor-grabbing">
      <div class="flex items-start justify-between gap-2">
        <h4 class="font-medium text-gray-900 text-sm leading-snug flex-1">{{ task().title }}</h4>
        <div class="flex gap-1 shrink-0">
          <button (click)="edit.emit(task())" title="Edit"
            class="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button (click)="remove.emit(task())" title="Delete"
            class="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-600 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>

      @if (task().description) {
        <p class="text-xs text-gray-500 mt-2 line-clamp-2">{{ task().description }}</p>
      }

      <div class="flex items-center gap-2 mt-3">
        <span class="text-[10px] font-medium px-2 py-0.5 rounded-full"
          [ngClass]="categoryClass(task().category)">
          {{ task().category }}
        </span>
        <span class="text-[10px] text-gray-400 ml-auto">
          {{ task().createdAt | date:'MMM d' }}
        </span>
      </div>
    </div>
  `,
})
export class TaskCardComponent {
  task = input.required<Task>();
  edit = output<Task>();
  remove = output<Task>();

  categoryClass(cat: string): Record<string, boolean> {
    return {
      'bg-blue-100 text-blue-700': cat === 'Work',
      'bg-green-100 text-green-700': cat === 'Personal',
      'bg-red-100 text-red-700': cat === 'Urgent',
      'bg-gray-100 text-gray-700': cat === 'General',
    };
  }
}
