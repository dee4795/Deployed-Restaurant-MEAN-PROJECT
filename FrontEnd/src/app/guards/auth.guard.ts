// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot,
  UrlTree 
} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const token = localStorage.getItem('token');
    
    if (token) {
      return true;
    }

    // Redirect to login page if not authenticated
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
    return false;
  }
}