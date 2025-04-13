import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { HttpClient } from '@angular/common/http';
import { JwtPayload } from './jwt-payload.model';
import { jwtDecode } from 'jwt-decode';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private decodedToken: JwtPayload | null = null;

  private baseURL = 'http://localhost:8080/api/v1';

  user$: Observable<firebase.User | null>;

  constructor(private afAuth: AngularFireAuth, private router: Router,
    private http: HttpClient,
  ) {
    this.user$ = afAuth.authState;
  }

  async signIn(email: string, password: string): Promise<void> {
    try {
      const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
      if (userCredential) {
        localStorage.setItem("email", email.toString());
        // Redirect to the dashboard after successful sign-in
        this.router.navigate(['/dashboard/index']);
      }
    } catch (error) {
      console.error('Sign In Error: ', error);
      throw error;  // Rethrow error to handle it in the login component
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.afAuth.signOut();
      localStorage.clear();
      this.router.navigate(['/page/login']);

    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  }

  async register(email: string, password: string): Promise<void> {
    try {
      await this.afAuth.createUserWithEmailAndPassword(email, password);
    } catch (error) {
      console.error('Registration Error:', error);
      throw error;  // Rethrow error to handle in component
    }
  }


  getCurrentUser(): Promise<firebase.User | null> {
    return this.afAuth.currentUser;
  }

  async deleteCurrentUser(): Promise<void> {
    const user = await this.afAuth.currentUser;
    if (user) {
      await user.delete();
    }
  }

  loginUser(credentials: any) {
    return this.http.post(`${this.baseURL}/auth/login`, credentials).subscribe((res: any) => {
      localStorage.setItem('token', res.token);
      localStorage.setItem('refreshToken', res.refreshToken);
      console.log('User has been loggedin.')
    });
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post(`${this.baseURL}/auth/refresh`, { refreshToken }).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        console.log('Access token has been refreshed.');
      })
    );
  }

  setAccessToken(token: string) {
    localStorage.setItem('token', token);
    this.decodedToken = jwtDecode<JwtPayload>(token);
  }


  getAccessToken() {
    return localStorage.getItem('token');
  }

  getDecodedToken(): JwtPayload | null {
    if (!this.decodedToken && this.getAccessToken()) {
      this.decodedToken = jwtDecode<JwtPayload>(this.getAccessToken()!);
    }
    return this.decodedToken;
  }

  hasRole(role: string): boolean {
    return this.getDecodedToken()?.authorities.includes(role) ?? false;
  }

  hasPermission(permission: string): boolean {
    return this.getDecodedToken()?.authorities.includes(permission) ?? false;
  }

  logout() {
    localStorage.clear();
  }

}