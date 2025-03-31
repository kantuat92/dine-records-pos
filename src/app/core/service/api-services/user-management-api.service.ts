import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Role } from "src/app/shared/model/page.model";
import { map } from 'rxjs/operators';



@Injectable({
    providedIn: 'root'
})
export class UserManagementAPIService {

    private baseURL = 'http://localhost:8080/api/v1';

    constructor(private http: HttpClient) {

    }

    getRoles(restaurantId: any): Observable<Role[]> {
        const url = `${this.baseURL}/roles/restaurant/${restaurantId}`;
        return this.http.get<{ data: Role[] }>(url).pipe(map(response => response.data));
    }    

    postUser(userData: any): Observable<any> {
        const url = `${this.baseURL}/users`;
        return this.http.post(url, userData);
    }

    updateUser(userId: any, userData: any): Observable<any> {
        return this.http.put(`${this.baseURL}/users/${userId}`, userData);
    }

    deleteUser(userId: any): Observable<any> {
        const url = `${this.baseURL}/users/${userId}`;
        return this.http.delete(url);
    }


}