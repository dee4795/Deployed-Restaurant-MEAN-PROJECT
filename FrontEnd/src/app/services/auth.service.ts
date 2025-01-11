import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  private logoutInProgress = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkTokenValidity();
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expired = Date.now() >= payload.exp * 1000;
      return !expired;
    } catch {
      return false;
    }
  }

  private checkTokenValidity() {
    if (!this.hasValidToken()) {
      this.performLogout();
    }
  }

  login(credentials: {email: string, password: string}): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/login`, credentials)
      .pipe(
        map(response => {
          if (response.token) {
            localStorage.setItem('token', response.token);
            this.isLoggedInSubject.next(true);
          }
          return response;
        })
      );
  }

  logout() {
    if (this.logoutInProgress) return;
    this.logoutInProgress = true;

    const token = localStorage.getItem('token');
    if (!token) {
      this.performLogout();
      return;
    }

    // Call backend logout endpoint
    this.http.post(`${environment.apiUrl}/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).pipe(
      catchError(error => {
        console.error('Logout error:', error);
        return throwError(() => error);
      }),
      finalize(() => {
        this.performLogout();
        this.logoutInProgress = false;
      })
    ).subscribe();
  }

  private performLogout() {
    localStorage.clear();
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.hasValidToken();
  }
}