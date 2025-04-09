import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { apiResultFormat, DataService, routes } from 'src/app/core/core.index';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestaurantApiService } from 'src/app/core/service/api-services/restaurant-api.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  standalone: false
})
export class RegisterComponent {

  registerForm!: FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;


  countries: { CountryName: string, CountryCode: string }[] = [];

  public routes = routes;
  public passwordVisible: boolean[] = [false];

  public togglePassword(index: number) {
    this.passwordVisible[index] = !this.passwordVisible[index]
  }
  constructor(private router: Router, private fb: FormBuilder,
    private dataService: DataService, private restaurantService: RestaurantApiService
  ) {

  }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      restaurantName: ['', Validators.required],
      gstn: ['', [Validators.required, Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)]],
      country: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      consent: [false, Validators.requiredTrue]
    });

    this.loadCountries();

  }

  loadCountries() {
    this.dataService.getCountries().subscribe((apiRes: apiResultFormat) => {
      this.countries = apiRes.data.filter((c: any) => c.Status === 'Active');
    });
  }


  onSubmit(): void {
    this.successMessage = null;
    this.errorMessage = null;

    if (this.registerForm.valid) {
      const formData = this.registerForm.value;

      this.restaurantService.registerRestaurant(formData).subscribe({
        next: (response) => {
          this.successMessage = 'Registration successful!';
          this.registerForm.reset();
        },
        error: (error) => {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }



  navigation() {
    this.router.navigate([routes.signIn])
  }
}
