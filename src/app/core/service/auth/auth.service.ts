import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<firebase.User | null>;

  constructor(private afAuth: AngularFireAuth, private router: Router) {
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

}