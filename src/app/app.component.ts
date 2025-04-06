import { Component } from '@angular/core';
import {
  NavigationEnd,
  NavigationStart,
  Router,
  Event as RouterEvent,
} from '@angular/router';
import { SpinnerService } from './core/core.index';
import { UserManagementAPIService } from './core/service/api-services/user-management-api.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {
  title = 'template';
  public page = '';

  constructor(private router: Router, private spinner: SpinnerService, private userManagementService: UserManagementAPIService) {
    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationStart) {
        const URL = event.url.split('/');
        this.page = URL[1];
        this.spinner.show();
      }
      if (event instanceof NavigationEnd) {
        this.spinner.hide();
      }
    });

    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationStart) {
        this.spinner.show();
      }
      if (event instanceof NavigationEnd) {
        this.spinner.hide();
      }
    });

    userManagementService.loginUser({
      'username': 'super-admin-user',
      'password': 'abcd'
    });
    
  }
  
}
