import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from '../core/helpers/routes';


@Injectable({
  providedIn: 'root',
})
export class WebstorgeService {

  constructor(private router: Router) {}

  public login(): void {
    localStorage.setItem('authenticated', 'true');
    this.router.navigate([routes.dashboard]);
  }
  public submit(): void {
    localStorage.setItem('authenticated', 'true');
    this.router.navigate([routes.dashboard]);
  }
  public Logout(): void {
    console.log('Removing local storage items');
    localStorage.removeItem('authorized');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.router.navigate([routes.signIn]);
  }
}
