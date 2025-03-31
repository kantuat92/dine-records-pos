import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class MenuApiService {
  private baseUrl = 'http://localhost:8080/api/v1';
  constructor(private http: HttpClient) { }


  getCategories(restaurantId: any): Observable<Category[]> {
    const url = `${this.baseUrl}/menu-categories/restaurant/${restaurantId}?sort=createdDate`;
    return this.http.get<Category[]>(url);
  }
  getParentCategories(restaurantId: any): Observable<Category[]> {
    const url = `${this.baseUrl}/parent-categories/restaurant/${restaurantId}?sort=createdDate`;
    return this.http.get<Category[]>(url);
  }
  getGroupCategories(restaurantId: any): Observable<Category[]> {
    const url = `${this.baseUrl}/group-categories/restaurant/${restaurantId}?sort=createdDate`;
    return this.http.get<Category[]>(url);
  }
  getParentCategoriesById(parentCategoryId: any): Observable<Category[]> {
    const url = `${this.baseUrl}/parent-categories/${parentCategoryId}?sort=createdDate`;
    return this.http.get<Category[]>(url);
  }
  getGroupCategoriesById(groupCategoryId: any): Observable<Category[]> {
    const url = `${this.baseUrl}/group-categories/${groupCategoryId}?sort=createdDate`;
    return this.http.get<Category[]>(url);
  }

  getMenuItemOnCategories(restaurantId : any , categoryId : any, orderType: string) : Observable<any> {
    return this.http.get(`${this.baseUrl}/menu-items/restaurant/${restaurantId}/category/${categoryId}?orderType=${orderType}`);
  }

  getMenuItems(restaurantId : any) : Observable<any> {
    return this.http.get(`${this.baseUrl}/menu-items/restaurant/${restaurantId}/items`);
  }
}
