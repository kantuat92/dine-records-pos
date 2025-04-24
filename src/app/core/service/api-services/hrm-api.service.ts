import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { Department } from "../../models/department.model";
import { apiResultFormat } from "../../core.index";
import { designation, employeeList } from "src/app/shared/model/page.model";


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

    createDesignation(designation: any): Observable<any> {
        return this.http.post(`${this.baseURL}/designations`, designation);
    }

    getDesignations(restaurantId: any): Observable<apiResultFormat> {
        const url = `${this.baseURL}/designations/restaurant/${restaurantId}`;
        return this.http
            .get<apiResultFormat>(url)
            .pipe(map((res: apiResultFormat) => res));
    }

    deleteDesignation(designationId: any): Observable<any> {
        return this.http.delete(`${this.baseURL}/designations/${designationId}`);
    }

    updateDesignatoin(id: any, designation: any): Observable<any> {
        return this.http.put<designation>(`${this.baseURL}/designations/${id}`, designation);
    }

    getEmployees(restaurantId: any): Observable<apiResultFormat> {
        return this.http.get<apiResultFormat>(`${this.baseURL}/employees/restaurant/${restaurantId}`).pipe(
            map((res: apiResultFormat) => res)
        );
    }

}