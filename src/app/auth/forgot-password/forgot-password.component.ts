import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from 'src/app/core/helpers/routes';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/service/auth/auth.service';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  standalone: false
})
export class ForgotPasswordComponent {


  public routes = routes;

  navigation() {
    this.router.navigate([routes.signIn])
  }

  forgotForm: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
    this.forgotForm = this.fb.group({
      emailOrUsername: ['', [Validators.required]]
    });

  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.forgotForm.invalid) {
      return;
    }

    const forgotPasswordData = this.forgotForm.value;

    this.authService.forgotPasswordRequest(forgotPasswordData).subscribe(
      response => {
        this.successMessage = 'Reset instructions sent to your email. Check your inbox for the reset link.';
        this.forgotForm.reset();
        this.submitted = false;

      },
      error => {
        console.log(error);
        this.errorMessage = error.error;
      }
    );
  }



  get f() {
    return this.forgotForm.controls;
  }
}
