import { Injectable, computed, signal } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  name: string;
  email: string;
}

export const DEMO_CREDENTIALS = { email: 'demo@loja.dev', password: 'demo1234' } as const;
const USER_KEY = 'ng_ecommerce_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<User | null>(this.load());
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);

  login(email: string, password: string): Observable<User> {
    if (email.trim().toLowerCase() !== DEMO_CREDENTIALS.email || password !== DEMO_CREDENTIALS.password) {
      return throwError(() => new Error('E-mail ou senha inválidos.')).pipe(delay(500));
    }
    const user: User = { name: 'Conta Demo', email: DEMO_CREDENTIALS.email };
    return of(user).pipe(
      delay(500),
      tap((u) => {
        this._user.set(u);
        try {
          localStorage.setItem(USER_KEY, JSON.stringify(u));
        } catch {
          /* ignore */
        }
      }),
    );
  }

  logout(): void {
    this._user.set(null);
    try {
      localStorage.removeItem(USER_KEY);
    } catch {
      /* ignore */
    }
  }

  private load(): User | null {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null') as User | null;
    } catch {
      return null;
    }
  }
}
