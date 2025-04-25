import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Editor, Toolbar } from 'ngx-editor';
import { DataService, SidebarService, apiResultFormat, routes } from 'src/app/core/core.index';
import { HrmApiService } from 'src/app/core/service/api-services/hrm-api.service';
import { Store } from '@ngrx/store';
import { selectRestaurantId } from 'src/app/core/store/restaurant.selectors';

interface data {
  value: string;
}
@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrl: './add-employee.component.scss',
  standalone: false
})
export class AddEmployeeComponent {
  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic', 'format_clear'],
    ['underline', 'strike'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['image'],
    ['link'],
  ];

  restaurantId: any;
  employeeForm!: FormGroup;
  shifts: any[] = [];
  departments: any[] = [];
  designations: any[] = [];
  countries: any[] = [];



  constructor(private sidebar: SidebarService, private fb: FormBuilder,
    private hrmApiService: HrmApiService, private store: Store, private dataService: DataService
  ) {

    this.store.select(selectRestaurantId).subscribe(id => {
      console.log('In users.component.ts Restaurant id from store: ', id);
      this.restaurantId = id;
    });

    this.employeeForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contactNumber: ['', Validators.required],
      dob: [null, Validators.required],
      gender: ['', Validators.required],
      nationality: ['', Validators.required],
      joiningDate: [null, Validators.required],
      shiftId: ['', Validators.required],
      departmentId: ['', Validators.required],
      designationId: ['', Validators.required],
      bloodGroup: ['', Validators.required],
      about: [''],
    });

  }
  public routes = routes;

  public password: boolean[] = [false];


  public togglePassword(index: number) {
    this.password[index] = !this.password[index]
  }
  isCollapsed: boolean = false;
  toggleCollapse() {
    this.sidebar.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
  }
  ngOnInit(): void {
    this.editor = new Editor();

    this.hrmApiService.getDepartments(this.restaurantId).subscribe({
      next: (data) => this.departments = data,
      error: (err) => console.error('Error loading departments', err)
    });

    this.hrmApiService.getDesignations(this.restaurantId).subscribe({
      next: (response) => this.designations = response.data,
      error: (err) => console.error('Error loading designations', err)
    });

    this.hrmApiService.getShifts(this.restaurantId).subscribe({
      next: (response) => this.shifts = response,
      error: (err) => console.error('Error loading shifts', err)
    });

    this.dataService.getCountries().subscribe((apiRes: apiResultFormat) => {
      this.countries = apiRes.data.filter((c: any) => c.Status === 'Active');
    });
  }
  ngOnDestroy(): void {
    this.editor.destroy();
  }

  onSubmit() {


  }
}
