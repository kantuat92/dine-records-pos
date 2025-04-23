import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Department } from "../../models/department.model";


@Injectable({
    providedIn: 'root'
})
export class HrmApiService {

    private baseURL = 'http://localhost:8080/api/v1';

    constructor(private http: HttpClient) {

    }

    createDepartment(department: any): Observable<any> {
        return this.http.post(`${this.baseURL}/departments`, department);
    }

    getDepartments(restaurantId: any) {
        return this.http.get<Department[]>(`${this.baseURL}/departments/restaurant/${restaurantId}`);
    }

    updateDepartment(id: number, department: Department): Observable<Department> {
        return this.http.put<Department>(`${this.baseURL}/departments/${id}`, department);
    }

    deleteDepartment(id: number): Observable<any> {
        return this.http.delete(`${this.baseURL}/departments/${id}`);
    }

}