import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from 'src/app/core/helpers/routes';
import { RestaurantApiService } from 'src/app/core/service/api-services/restaurant-api.service';
import { AuthService } from 'src/app/core/service/auth/auth.service';
import { Store } from '@ngrx/store';
import { NgForm } from '@angular/forms';
import { User } from 'src/app/core/models/user.model';
import { setRestaurantId } from 'src/app/core/store/restaurant.actions';
import { UserManagementAPIService } from 'src/app/core/service/api-services/user-management-api.service';

@Component({
    selector: 'app-signin',
    templateUrl: './signin.component.html',
    styleUrl: './signin.component.scss',
    standalone: false
})
export class SigninComponent {

  user: User = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    restaurantName: '',
    gstnNumber:''
  };

  public routes = routes;
  errorMessage: string = '';
  constructor(private router: Router, private authService: AuthService,
    private restaurantapiservice: RestaurantApiService,
    private store: Store, private userManagementService: UserManagementAPIService)
    {

    }

  async formSubmit(f: NgForm) {
      // Check if form is valid
      if (f.invalid) {
        this.errorMessage = 'Please fill in all required fields.';
        return;
      }

      try {
        // Call AuthService to log in the user
        const loginData = {
          'username': this.user.name,
          'password': this.user.password
        };
        await this.userManagementService.loginUser(loginData);
         // Fetch restaurant ID by making an API call
        this.restaurantapiservice.getRestaurantByUsername(this.user.name).subscribe({
          next: (restaurant) => {
            const restaurantId = restaurant.id;
            // Dispatch restaurantId to NgRx store
            this.store.dispatch(setRestaurantId({ restaurantId }));
            console.log('Restaurant ID dispatched during Login:', restaurantId);
            this.router.navigate([this.routes.dashboard]);
          },
          error: (error) => {
            console.error('Failed to fetch restaurant details: ', error);
          }
        });
      } catch (error) {
        console.error('Login Error: ', error);
      }

    }


  navigation() {
    this.router.navigate([routes.index])
  }
  public password : boolean[] = [false];

  public togglePassword(index: number){
    this.password[index] = !this.password[index]
  }
}
