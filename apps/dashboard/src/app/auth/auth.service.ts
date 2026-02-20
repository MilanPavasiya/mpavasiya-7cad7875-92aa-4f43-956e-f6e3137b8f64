import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, of } from 'rxjs';
import { AuthResponse, User, Organization } from '@org/data';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(null);
  private _orgs = signal<Organization[]>([]);
  private _selectedOrgId = signal<string | null>(null);

  user = this._user.asReadonly();
  isLoggedIn = computed(() => !!this._token());
  orgs = this._orgs.asReadonly();
  selectedOrgId = this._selectedOrgId.asReadonly();

  constructor(private http: HttpClient, private router: Router) {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this._token.set(parsed.token);
        this._user.set(parsed.user);
        this._selectedOrgId.set(parsed.orgId ?? null);
      } catch { /* ignore corrupt storage */ }
    }
  }

  getToken(): string | null {
    return this._token();
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>('/api/auth/login', { email, password }).pipe(
      tap((res) => this.handleAuth(res)),
    );
  }

  register(email: string, password: string) {
    return this.http.post<AuthResponse>('/api/auth/register', { email, password }).pipe(
      tap((res) => this.handleAuth(res)),
    );
  }

  loadOrgs() {
    return this.http.get<Organization[]>('/api/orgs').pipe(
      tap((orgs) => {
        this._orgs.set(orgs);
        if (orgs.length > 0 && !this._selectedOrgId()) {
          this.selectOrg(orgs[0].id);
        }
      }),
      catchError(() => of([])),
    );
  }

  selectOrg(orgId: string) {
    this._selectedOrgId.set(orgId);
    this.persist();
  }

  logout() {
    this._token.set(null);
    this._user.set(null);
    this._orgs.set([]);
    this._selectedOrgId.set(null);
    localStorage.removeItem('auth');
    this.router.navigate(['/login']);
  }

  private handleAuth(res: AuthResponse) {
    this._token.set(res.access_token);
    this._user.set(res.user);
    this.persist();
  }

  private persist() {
    localStorage.setItem('auth', JSON.stringify({
      token: this._token(),
      user: this._user(),
      orgId: this._selectedOrgId(),
    }));
  }
}
