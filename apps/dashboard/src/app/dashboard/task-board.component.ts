import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Task, TASK_STATUSES } from '@org/data';
import { TaskCardComponent } from './task-card.component';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, CdkDropList, CdkDrag, TaskCardComponent],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
      @for (status of statuses; track status) {
        <div class="flex flex-col min-h-[200px]">
          <div class="flex items-center gap-2 mb-3 px-1">
            <span class="w-2.5 h-2.5 rounded-full" [ngClass]="dotColor(status)"></span>
            <h3 class="font-semibold text-sm text-gray-700 uppercase tracking-wide">
              {{ statusLabel(status) }}
            </h3>
            <span class="ml-auto text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {{ getColumn(status).length }}
            </span>
          </div>

          <div
            cdkDropList
            [id]="status"
            [cdkDropListData]="getColumn(status)"
            [cdkDropListConnectedTo]="statuses"
            (cdkDropListDropped)="onDrop($event, status)"
            class="flex-1 space-y-3 p-2 rounded-xl min-h-[120px] transition"
            [ngClass]="columnBg(status)">

            @for (task of getColumn(status); track task.id) {
              <div cdkDrag [cdkDragData]="task">
                <app-task-card
                  [task]="task"
                  (edit)="editTask.emit($event)"
                  (remove)="deleteTask.emit($event)" />
              </div>
            } @empty {
              <div class="flex items-center justify-center h-24 text-xs text-gray-400">
                Drop tasks here
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class TaskBoardComponent {
  tasksByStatus = input.required<Record<string, Task[]>>();
  editTask = output<Task>();
  deleteTask = output<Task>();
  moveTask = output<{ taskId: string; newStatus: string }>();
  reorder = output<{ status: string; tasks: Task[] }>();

  statuses = TASK_STATUSES;

  getColumn(status: string): Task[] {
    return this.tasksByStatus()[status] || [];
  }

  statusLabel(s: string): string {
    const labels: Record<string, string> = {
      'open': 'Open',
      'in-progress': 'In Progress',
      'done': 'Done',
    };
    return labels[s] ?? s;
  }

  dotColor(s: string): Record<string, boolean> {
    return {
      'bg-blue-500': s === 'open',
      'bg-amber-500': s === 'in-progress',
      'bg-emerald-500': s === 'done',
    };
  }

  columnBg(s: string): Record<string, boolean> {
    return {
      'bg-blue-50/50': s === 'open',
      'bg-amber-50/50': s === 'in-progress',
      'bg-emerald-50/50': s === 'done',
    };
  }

  onDrop(event: CdkDragDrop<Task[]>, targetStatus: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.reorder.emit({ status: targetStatus, tasks: [...event.container.data] });
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      const task: Task = event.container.data[event.currentIndex];
      this.moveTask.emit({ taskId: task.id, newStatus: targetStatus });
    }
  }
}
