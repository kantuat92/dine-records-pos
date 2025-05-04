import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RestaurantApiService {

  private baseUrl = 'http://localhost:8080/api/v1'; 

  constructor(private http: HttpClient) {}

  registerRestaurant(restaurantPayload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/restaurants`, restaurantPayload);
  }

  getRestaurantByUserEmail(email: string): Observable<any> {
    const url = `${this.baseUrl}/restaurants/by-email?email=${encodeURIComponent(email)}`;
    console.log(`Fetching restaurant data for email: ${email}`);
    return this.http.get<any>(url);
  }

  getRestaurantByUsername(username: string): Observable<any> {
    const url = `${this.baseUrl}/restaurants/by-username?username=${encodeURIComponent(username)}`;
    console.log(`Fetching restaurant data for username: ${username}`);
    return this.http.get<any>(url);
  }
}
