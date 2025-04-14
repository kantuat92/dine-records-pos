import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { routes } from 'src/app/core/helpers/routes';
import { AuthService } from 'src/app/core/service/auth/auth.service';

@Component({
  selector: 'app-reset-password-3',
  templateUrl: './reset-password-3.component.html',
  styleUrls: ['./reset-password-3.component.scss'],
  standalone: false
})
export class ResetPassword3Component implements OnInit {

  public routes = routes;
  public password: boolean[] = [false, false, false, false];

  token: string = '';
  resetForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    console.log('Reset token:', this.token);

    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatch });
  }

  public togglePassword(index: number): void {
    this.password[index] = !this.password[index];
  }

  public onSubmit(): void {
    if (this.resetForm.invalid) {
      return;
    }

    const payload = {
      newPassword: this.resetForm.value.newPassword,
      token: this.token
    };

    this.authService.resetPassword(payload).subscribe(
      response => {
        this.successMessage = 'Password reset successful!';
        this.router.navigate([routes.success3]);
      },
      error => {
        console.error('Password reset failed:', error);
        this.errorMessage = 'Failed to reset password. Please try again later.';
      }
    );
  }

  private passwordsMatch(group: FormGroup): { [key: string]: boolean } | null {
    const pass = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }
}
