import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../shared/api.service';
import { RestaurentData } from './restaurent.model';
import  {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import { COUNTRY_LIST, Country } from '../shared/interfaces/country.interface';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-restaurent-dash',
  templateUrl: './restaurent-dash.component.html',
  styleUrls: ['./restaurent-dash.component.css'],
  standalone: false
})
export class RestaurentDashComponent implements OnInit {
  formValue!: FormGroup;
  restaurentModelObj: RestaurentData = new RestaurentData;
  allRestaurentData: any;
  showAdd: boolean = true;
  showBtn: boolean = false;
  showPopup: boolean = false;
  showEmailPopup: boolean = false;
  currentRestaurantId: string = '';

  searchForm!: FormGroup;
  filteredRestaurants: any[] = [];
  showPredictions: boolean = false;

  countries: Country[] = COUNTRY_LIST;
  filteredCountries: Country[] = [];
  showCountryDropdown: boolean = false;
  countrySearchTerm: string = '';
  
  // Loading states for different actions
  isAddLoading: boolean = false;
  isUpdateLoading: boolean = false;
  isDeleteLoading: Record<string, boolean> = {};
  isTableLoading: boolean = true;

  constructor(
    private formbuilder: FormBuilder, 
    private api: ApiService, 
    private authService:AuthService) { }

    onLogout() {
      this.authService.logout();
    }

  ngOnInit(): void {
    this.formValue = this.formbuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      countryCode: ['+1', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      services: ['', Validators.required],
    });

    this.searchForm = this.formbuilder.group({
      searchTerm: ['']
    });

    // Subscribe to search input changes
    this.searchForm.get('searchTerm')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(term => {
        this.searchRestaurants(term);
      });



    this.getAllData();
  }

  searchRestaurants(term: string) {
    if (!term?.trim()) {
      this.filteredRestaurants = [];
      this.showPredictions = false;
      this.getAllData();
      return;
    }

    const searchTerm = term.toLowerCase();
    this.filteredRestaurants = this.allRestaurentData.filter((restaurant: any) =>
      restaurant.name.toLowerCase().includes(searchTerm)
    );
    this.showPredictions = true;
  }

  selectPrediction(restaurant: any) {
    this.searchForm.patchValue({ searchTerm: restaurant.name });
    this.showPredictions = false;
    this.allRestaurentData = [restaurant];
  }

  clearSearch() {
    this.searchForm.reset();
    this.showPredictions = false;
    this.getAllData();
  }

  onMobileInput(event: any) {
    let input = event.target;
    if (input.value.length > 10) {
      input.value = input.value.slice(0, 10);
      this.formValue.patchValue({ mobile: input.value });
    }
  }
  
  clickAddResto() {
    this.formValue.reset();
    this.showAdd = true;
    this.showBtn = false;
    this.currentRestaurantId = '';
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
    this.formValue.patchValue({ countryCode: country.dialCode });
    this.showCountryDropdown = false;
    this.countrySearchTerm = '';
  }


  addRestaurent() {
    if (this.formValue.invalid) {
      this.formValue.markAllAsTouched();
      if (!this.formValue.controls['mobile'].valid) {
        this.showPopup = true;
        setTimeout(() => this.showPopup = false, 3000);
      } else if (!this.formValue.controls['email'].valid) {
        this.showEmailPopup = true;
        setTimeout(() => this.showEmailPopup = false, 3000);
      } else {
        alert("Please fill all the required fields correctly before submitting");
      }
      return;
    }

    this.isAddLoading = true;

    const restaurantData: RestaurentData = {
      name: this.formValue.value.name,
      email: this.formValue.value.email,
      countryCode: this.formValue.value.countryCode,
      mobile: Number(this.formValue.value.mobile),
      address: this.formValue.value.address,
      services: this.formValue.value.services
    };

    this.api.postRestaurent(restaurantData).subscribe({
      next: (res) => {
        console.log('Restaurant added successfully:', res);
        alert("Restaurant Added Successfully");
        this.formValue.reset();
        document.getElementById('closeModal')?.click();
        this.getAllData();
        this.isAddLoading = false;
      },
      error: (err) => {
        console.error('Error adding restaurant:', err);
        alert("Failed to add restaurant: " + err.message);
        this.isAddLoading = false;
      }
    });
  }

  getAllData() {
    this.isTableLoading = true;
    this.api.getRestaurent().subscribe({
      next: (res) => {
        this.allRestaurentData = res;
        this.isTableLoading = false;
      },
      error: (err) => {
        console.error('Error fetching restaurants:', err);
        alert("Failed to fetch restaurants");
        this.isTableLoading = false;
      }
    });
  }

  deleteResto(id: string) {
    if (!id) {
      console.error('No restaurant ID provided for deletion');
      return;
    }

    if (confirm('Are you sure you want to delete this restaurant?')) {
      this.isDeleteLoading[id] = true;

      this.api.deleteRestaurant(id).subscribe({
        next: (res) => {
          alert("Restaurant Deleted Successfully");
          this.getAllData();
          this.isDeleteLoading[id] = false;
        },
        error: (err) => {
          console.error('Error deleting restaurant:', err);
          alert("Failed to delete restaurant");
          this.isDeleteLoading[id] = false;
        }
      });
    }
  }

  onEditResto(data: any) {
    if (!data._id) {
      console.error('No restaurant ID provided for editing');
      return;
    }

    this.showAdd = false;
    this.showBtn = true;
    this.currentRestaurantId = data._id;
    
    this.formValue.patchValue({
      name: data.name,
      email: data.email,
      countryCode: data.countryCode,
      mobile: data.mobile,
      address: data.address,
      services: data.services
    });
  }

  updateResto() {
    if (!this.currentRestaurantId) {
      console.error('No restaurant ID available for update');
      alert('Error: Cannot update restaurant without ID');
      return;
    }

    if (this.formValue.invalid) {
      this.formValue.markAllAsTouched();
      if (!this.formValue.controls['mobile'].valid) {
        this.showPopup = true;
        setTimeout(() => this.showPopup = false, 3000);
      } else if (!this.formValue.controls['email'].valid) {
        this.showEmailPopup = true;
        setTimeout(() => this.showEmailPopup = false, 3000);
      } else {
        alert("Please fill all the required fields correctly before submitting");
      }
      return;
    }

    this.isUpdateLoading = true;

    const updatedData: RestaurentData = {
      _id: this.currentRestaurantId,
      name: this.formValue.value.name,
      email: this.formValue.value.email,
      countryCode: this.formValue.value.countryCode,
      mobile: Number(this.formValue.value.mobile),
      address: this.formValue.value.address,
      services: this.formValue.value.services
    };

    this.api.updateRestaurant(this.currentRestaurantId, updatedData).subscribe({
      next: (res) => {
        alert("Restaurant Updated Successfully");
        this.formValue.reset();
        this.currentRestaurantId = '';
        document.getElementById('closeModal')?.click();
        this.getAllData();
        this.isUpdateLoading = false;
      },
      error: (err) => {
        console.error('Error updating restaurant:', err);
        alert("Failed to update restaurant: " + err.message);
        this.isUpdateLoading = false;
      }
    });
  }
}