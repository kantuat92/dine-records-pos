import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map, tap } from 'rxjs/operators';
import { apiResultFormat } from "../../core.index";



@Injectable({
    providedIn: 'root'
})
export class UserManagementAPIService {

    private baseURL = 'http://localhost:8080/api/v1';

    constructor(private http: HttpClient) {

    }

    public getUsers(restaurantId: number): Observable<apiResultFormat> {
        return this.http.get<apiResultFormat>(`${this.baseURL}/users/restaurant/${restaurantId}`).pipe(
            map((res: apiResultFormat) => res)
        );
    }

    public getPermission(restaurantId: number, roleId: number): Observable<apiResultFormat> {
        return this.http
            .get<apiResultFormat>(`${this.baseURL}/permissions/role/${roleId}/restaurant/${restaurantId}`)
            .pipe(
                map((res: apiResultFormat) => res)
            );
    }

    public getRoles(restaurantId: any): Observable<apiResultFormat> {
        const url = `${this.baseURL}/roles/restaurant/${restaurantId}`;
        return this.http
            .get<apiResultFormat>(url)
            .pipe(map((res: apiResultFormat) => res));
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

    createRole(roleName: string, restaurantId: number): Observable<any> {
        const url = `${this.baseURL}/roles`;
        const requestBody = { role: roleName, status: true, restaurantId };
        return this.http.post(url, requestBody);
    }

    updateRole(roleData: any): Observable<any> {
        const url = `${this.baseURL}/roles/${roleData.id}`;
        return this.http.put(url, roleData);
    }

    deleteRole(roleId: number): Observable<any> {
        const url = `${this.baseURL}/roles/${roleId}`;
        return this.http.delete(url);
    }

    assignPermissions(payload: any): Observable<any> {
        const url = `${this.baseURL}/permissions/assign`;
        return this.http.put(url, payload);
    }

}