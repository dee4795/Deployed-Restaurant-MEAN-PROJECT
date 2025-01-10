import { environment } from './../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RestaurentData } from '../restaurent-dash/restaurent.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private _http: HttpClient) { }

  postRestaurent(data: RestaurentData): Observable<RestaurentData> {
    // Remove _id when posting new restaurant
    const { _id, ...postData } = data;
    return this._http.post<RestaurentData>(
      `${this.baseUrl}/restaurants`, 
      postData,
      this.httpOptions
    ).pipe(catchError(this.handleError));
  }

  getRestaurent(): Observable<RestaurentData[]> {
    return this._http.get<RestaurentData[]>(
      `${this.baseUrl}/restaurants`,
      this.httpOptions
    ).pipe(catchError(this.handleError));
  }

  deleteRestaurant(id: string): Observable<any> {
    return this._http.delete<any>(
      `${this.baseUrl}/restaurants/${id}`,
      this.httpOptions
    ).pipe(catchError(this.handleError));
  }

  updateRestaurant(id: string, data: RestaurentData): Observable<RestaurentData> {
    return this._http.put<RestaurentData>(
      `${this.baseUrl}/restaurants/${id}`,
      data,
      this.httpOptions
    ).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
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