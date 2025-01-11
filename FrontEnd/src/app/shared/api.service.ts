import { environment } from './../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RestaurentData } from '../restaurent-dash/restaurent.model';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(
    private _http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) { }

  // Get HTTP options with current auth token
  private get httpOptions() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  postRestaurent(data: RestaurentData): Observable<RestaurentData> {
    const { _id, ...postData } = data;
    return this._http.post<RestaurentData>(
      `${this.baseUrl}/restaurants`, 
      postData,
      this.httpOptions
    ).pipe(catchError(error => this.handleError(error)));
  }

  getRestaurent(): Observable<RestaurentData[]> {
    return this._http.get<RestaurentData[]>(
      `${this.baseUrl}/restaurants`,
      this.httpOptions
    ).pipe(catchError(error => this.handleError(error)));
  }

  deleteRestaurant(id: string): Observable<any> {
    return this._http.delete<any>(
      `${this.baseUrl}/restaurants/${id}`,
      this.httpOptions
    ).pipe(catchError(error => this.handleError(error)));
  }

  updateRestaurant(id: string, data: RestaurentData): Observable<RestaurentData> {
    return this._http.put<RestaurentData>(
      `${this.baseUrl}/restaurants/${id}`,
      data,
      this.httpOptions
    ).pipe(catchError(error => this.handleError(error)));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 401) {
      // Token is invalid or expired
      this.authService.logout();
      this.router.navigate(['/login']);
      return throwError(() => new Error('Session expired. Please login again.'));
    }

    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      errorMessage = `Server Error: ${error.status}\nMessage: ${error.error?.message || error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}