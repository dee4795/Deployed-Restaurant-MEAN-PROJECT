import { environment } from './../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: false
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  showNamePopup: boolean = false;
  showEmailPopup: boolean = false;
  showMobilePopup: boolean = false;
  showPasswordPopup: boolean = false;
  showPassword: boolean = false;
  private baseUrl = environment.apiUrl; // Updated API endpoint

  constructor(private formbuilder: FormBuilder, private _http: HttpClient, private _router: Router) {}

  ngOnInit(): void {
    this.signupForm = this.formbuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.pattern('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[/ @#$%^&+=]).{8,}$')]],
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  signUp() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      
      if (!this.signupForm.controls['name'].valid) {
        this.showNamePopup = true;
        setTimeout(() => this.showNamePopup = false, 5000);
      }

      if (!this.signupForm.controls['email'].valid) {
        this.showEmailPopup = true;
        setTimeout(() => this.showEmailPopup = false, 5000);
      }

      if (!this.signupForm.controls['mobile'].valid) {
        this.showMobilePopup = true;
        setTimeout(() => this.showMobilePopup = false, 5000);
      }

      if (!this.signupForm.controls['password'].valid) {
        this.showPasswordPopup = true;
        setTimeout(() => this.showPasswordPopup = false, 8000);
      }

      alert('Please fill all the required fields correctly before submitting');
      return;
    }

    // Updated to use new API endpoint with error handling
    this._http.post<any>(`${this.baseUrl}/signup`, this.signupForm.value).subscribe({
      next: (response) => {
        console.log('Signup successful:', response);
        alert('Signup Successfully');
        this.signupForm.reset();
        this._router.navigate(['/login']);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Signup error:', error);
        
        if (error.status === 400) {
          if (error.error.message.includes('duplicate')) {
            alert('Email already exists. Please use a different email address.');
          } else {
            alert('Signup failed: ' + error.error.message);
          }
        } else {
          alert('Signup failed. Please try again later.');
        }
      }
    });
  }
}