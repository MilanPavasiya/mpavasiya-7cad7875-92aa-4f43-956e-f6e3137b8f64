import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-2xl shadow-2xl p-8">
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
              <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-gray-900">Task Manager</h1>
            <p class="text-gray-500 mt-1">
              {{ isRegisterMode() ? 'Create a new account' : 'Sign in to your account' }}
            </p>
          </div>

          @if (error()) {
            <div class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {{ error() }}
            </div>
          }

          @if (success()) {
            <div class="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              {{ success() }}
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" [(ngModel)]="email" name="email" required
                class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="you@example.com" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" [(ngModel)]="password" name="password" required
                [minlength]="isRegisterMode() ? 6 : 1"
                class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="••••••••" />
            </div>

            @if (isRegisterMode()) {
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input type="password" [(ngModel)]="confirmPassword" name="confirmPassword" required
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="••••••••" />
              </div>
            }

            <button type="submit" [disabled]="loading()"
              class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-lg transition shadow-lg shadow-indigo-200">
              @if (loading()) {
                <span class="inline-flex items-center gap-2">
                  <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  {{ isRegisterMode() ? 'Creating account...' : 'Signing in...' }}
                </span>
              } @else {
                {{ isRegisterMode() ? 'Create Account' : 'Sign In' }}
              }
            </button>
          </form>

          @if (isRegisterMode()) {
            <div class="mt-4 flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <svg class="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"/>
              </svg>
              <p class="text-xs text-amber-700">
                New accounts are assigned the <span class="font-semibold">Viewer</span> role by default.
                You'll have read-only access to tasks. Contact an Owner or Admin to upgrade your role.
              </p>
            </div>
          }

          <!-- Toggle between Login and Register -->
          <div class="mt-5 text-center">
            <p class="text-sm text-gray-600">
              @if (isRegisterMode()) {
                Already have an account?
                <button (click)="toggleMode()" class="text-indigo-600 hover:text-indigo-800 font-medium transition cursor-pointer">
                  Sign In
                </button>
              } @else {
                Don't have an account?
                <button (click)="toggleMode()" class="text-indigo-600 hover:text-indigo-800 font-medium transition cursor-pointer">
                  Register
                </button>
              }
            </p>
          </div>

          @if (!isRegisterMode()) {
            <div class="mt-5 p-4 bg-gray-50 rounded-lg">
              <p class="text-xs text-gray-500 font-medium mb-2">Demo accounts (run seed first):</p>
              <div class="space-y-1 text-xs text-gray-600">
                <button (click)="fillDemo('owner')" class="block hover:text-indigo-600 transition cursor-pointer">
                  <span class="font-medium">Owner:</span> owner&#64;demo.com / owner123
                </button>
                <button (click)="fillDemo('admin')" class="block hover:text-indigo-600 transition cursor-pointer">
                  <span class="font-medium">Admin:</span> admin&#64;demo.com / admin123
                </button>
                <button (click)="fillDemo('viewer')" class="block hover:text-indigo-600 transition cursor-pointer">
                  <span class="font-medium">Viewer:</span> viewer&#64;demo.com / viewer123
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  confirmPassword = '';
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  isRegisterMode = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  toggleMode() {
    this.isRegisterMode.update((v) => !v);
    this.error.set(null);
    this.success.set(null);
    this.confirmPassword = '';
  }

  fillDemo(role: 'owner' | 'admin' | 'viewer') {
    const creds: Record<string, { email: string; password: string }> = {
      owner: { email: 'owner@demo.com', password: 'owner123' },
      admin: { email: 'admin@demo.com', password: 'admin123' },
      viewer: { email: 'viewer@demo.com', password: 'viewer123' },
    };
    this.email = creds[role].email;
    this.password = creds[role].password;
  }

  onSubmit() {
    if (!this.email || !this.password) return;

    if (this.isRegisterMode()) {
      this.handleRegister();
    } else {
      this.handleLogin();
    }
  }

  private handleLogin() {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.auth.loadOrgs().subscribe(() => {
          this.loading.set(false);
          this.router.navigate(['/']);
        });
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Login failed');
        this.loading.set(false);
      },
    });
  }

  private handleRegister() {
    if (this.password !== this.confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('Password must be at least 6 characters');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    this.auth.register(this.email, this.password).subscribe({
      next: () => {
        this.auth.loadOrgs().subscribe(() => {
          this.loading.set(false);
          this.router.navigate(['/']);
        });
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Registration failed');
        this.loading.set(false);
      },
    });
  }
}
