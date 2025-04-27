import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { Department } from "../../models/department.model";
import { apiResultFormat } from "../../core.index";
import { designation, employeeList } from "src/app/shared/model/page.model";
import { Shift } from "../../models/shift.model";
import { Attendance } from "src/app/shared/model/attendance.model";


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

    getDesignationsByDepartment(departmentId: any): Observable<apiResultFormat> {
        const url = `${this.baseURL}/designations/department/${departmentId}`;
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

    getEmployee(employeeId: any): Observable<any> {
        return this.http.get<any>(`${this.baseURL}/employees/${employeeId}`);
    }

    deleteEmployee(employeeId: any): Observable<any> {
        return this.http.delete(`${this.baseURL}/employees/${employeeId}`);
    }

    getShifts(restaurantId: any) {
        return this.http.get<Shift[]>(`${this.baseURL}/shifts/restaurant/${restaurantId}`);
    }

    public getCountries(): Observable<apiResultFormat> {
        return this.http.get<apiResultFormat>(`${this.baseURL}/countries`).pipe(
            map((res: apiResultFormat) => {
                return res;
            })
        )
    }

    public getStates(countryName: any): Observable<apiResultFormat> {
        return this.http.get<apiResultFormat>(`${this.baseURL}/states/country/${countryName}`).pipe(
            map((res: apiResultFormat) => {
                return res;
            })
        )
    }

    public getCities(stateName: any): Observable<apiResultFormat> {
        return this.http.get<apiResultFormat>(`${this.baseURL}/cities/state/${stateName}`).pipe(
            map((res: apiResultFormat) => {
                return res;
            })
        )
    }

    public addEmployee(employeePayload: any): Observable<any> {
        return this.http.post(`${this.baseURL}/employees`, employeePayload);
    }

    public editEmployee(employeeId: any, employeePayload: any): Observable<any> {
        return this.http.put(`${this.baseURL}/employees/${employeeId}`, employeePayload);
    }

    public getAttendance(restaurantId: any, employeeId: any): Observable<apiResultFormat> {
        return this.http.get<apiResultFormat>
            (`${this.baseURL}/attendances/restaurant/${restaurantId}/employee/${employeeId}/current-month`).pipe(
                map((res: apiResultFormat) => {
                    return res;
                })
            )
    }

    public clockIn(restaurantId: any, employeeId: any): Observable<Attendance> {
        const requestBody = {
            restaurantId: restaurantId,
            employeeId: employeeId
        };

        return this.http.post<Attendance>(`${this.baseURL}/attendances`, requestBody);
    }

    public clockOut(attendanceId: any): Observable<Attendance> {
        const requestBody = {            
            id: attendanceId
        };
        return this.http.put<Attendance>(`${this.baseURL}/attendances/${attendanceId}/clock-out`, requestBody);
    }


}