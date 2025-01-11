// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import {
        ActivatedRouteSnapshot, 
        RouterStateSnapshot,
        UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return this.router.createUrlTree(['/login'], { 
        queryParams: { returnUrl: state.url }
      });
    }
  
    try {
      // Check token expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (Date.now() >= payload.exp * 1000) {
        this.authService.logout();
        return this.router.createUrlTree(['/login'], { 
          queryParams: { returnUrl: state.url }
        });
      }
      return true;
    } catch {
      this.authService.logout();
      return this.router.createUrlTree(['/login']);
    }
  }
}