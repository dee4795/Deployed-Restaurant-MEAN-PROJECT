import { environment } from './../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { COUNTRY_LIST,Country } from '../shared/interfaces/country.interface';

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
  isLoading: boolean = false;
  private baseUrl = environment.apiUrl;

  countries: Country[] = COUNTRY_LIST;
  filteredCountries: Country[] = [];
  showCountryDropdown: boolean = false;
  countrySearchTerm: string = '';

  constructor(
    private formbuilder: FormBuilder, 
    private _http: HttpClient, 
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.signupForm = this.formbuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      countryCode: ['+1', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.pattern('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[/ @#$%^&+=]).{8,}$')]],
    });
  }

  searchCountries(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.countrySearchTerm = searchTerm;
    
    if (!searchTerm) {
      this.filteredCountries = this.countries;
    } else {
      this.filteredCountries = this.countries.filter(country => 
        country.name.toLowerCase().includes(searchTerm) || 
        country.dialCode.includes(searchTerm)
      );
    }
  }

  selectCountry(country: Country): void {
    this.signupForm.patchValue({ countryCode: country.dialCode });
    this.showCountryDropdown = false;
    this.countrySearchTerm = '';
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onMobileInput(event: any) {
    let input = event.target;
    if (input.value.length > 10) {
      input.value = input.value.slice(0, 10);
      this.signupForm.patchValue({ mobile: input.value });
    }
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

    this.isLoading = true;

    this._http.post<any>(`${this.baseUrl}/signup`, this.signupForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Signup successful:', response);
        alert('Signup Successfully');
        this.signupForm.reset();
        this._router.navigate(['/login']);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
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