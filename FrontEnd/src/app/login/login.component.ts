import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router,ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showLoginError: boolean = false;
  showPassword: boolean = false;
  returnUrl: string = '/restaurent';
  private baseUrl = environment.apiUrl; // Updated API endpoint

  constructor(
    private formbuilder: FormBuilder,
    private _http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formbuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/restaurent';
  
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  logIn() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      alert('Please fill all the required fields correctly before submitting');
      return;
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.showLoginError = true;
        setTimeout(() => this.showLoginError = false, 3000);
        
        if (error.status === 401) {
          alert('Invalid email or password');
        } else {
          alert('Login failed. Please try again later.');
        }
      }
    });
  }
}