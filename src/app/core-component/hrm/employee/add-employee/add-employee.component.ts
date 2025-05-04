import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Editor, Toolbar } from 'ngx-editor';
import { DataService, SidebarService, apiResultFormat, routes } from 'src/app/core/core.index';
import { HrmApiService } from 'src/app/core/service/api-services/hrm-api.service';
import { Store } from '@ngrx/store';
import { selectRestaurantId } from 'src/app/core/store/restaurant.selectors';
import { Router } from '@angular/router';

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
  states: any[] = [];
  cities: any[] = [];



  constructor(private sidebar: SidebarService, private fb: FormBuilder,
    private hrmApiService: HrmApiService, private store: Store, private dataService: DataService,
    private router: Router
  ) {

    this.store.select(selectRestaurantId).subscribe(id => {
      console.log('In users.component.ts Restaurant id from store: ', id);
      this.restaurantId = id;
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

  get emergencyContactsFormArray(): FormArray {
    return this.employeeForm.get('emergencyContacts') as FormArray;
  }




  ngOnInit(): void {

    this.employeeForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contactNumber: ['', Validators.required],
      dateOfBirth: [null, Validators.required],
      gender: ['', Validators.required],
      nationality: ['', Validators.required],
      joiningDate: [null, Validators.required],
      shiftId: ['', Validators.required],
      departmentId: ['', Validators.required],
      designationId: ['', Validators.required],
      bloodGroup: ['', Validators.required],
      about: [''],
      password: ['', Validators.required],      
      confirmPassword: ['', Validators.required],

      // 👇 Address FormGroup
      address: this.fb.group({
        id: [null], // optional hidden field for update scenarios
        address: ['', Validators.required],
        country: ['', Validators.required],
        state: ['', Validators.required],
        city: ['', Validators.required],
        zipcode: ['', Validators.required]
      }),

      emergencyContacts: this.fb.array([
        this.fb.group({
          contactNumber: ['', Validators.required],
          relation: ['', Validators.required],
          name: ['', Validators.required],
        }),
        this.fb.group({
          contactNumber: ['', Validators.required],
          relation: ['', Validators.required],
          name: ['', Validators.required],
        })
      ]),

      bankInformation: this.fb.group({
        bankName: ['', Validators.required],
        accountNumber: ['', Validators.required],
        ifsc: ['', Validators.required],
        branch: ['', Validators.required],
      })
    });


    this.editor = new Editor();

    this.hrmApiService.getDepartments(this.restaurantId).subscribe({
      next: (data) => this.departments = data,
      error: (err) => console.error('Error loading departments', err)
    });

    this.hrmApiService.getShifts(this.restaurantId).subscribe({
      next: (response) => this.shifts = response,
      error: (err) => console.error('Error loading shifts', err)
    });

    this.hrmApiService.getCountries().subscribe((apiRes: apiResultFormat) => {
      this.countries = apiRes.data.filter((c: any) => c.status === 'Active');
    });
  }

  onDepartmentChange(departmentId: any) {
    if (departmentId) {
      this.employeeForm.get('designationId')?.patchValue('');
      this.setDesignations(departmentId);
    }
  }

  // Example service call to fetch designations based on departmentId
  setDesignations(departmentId: any) {
    this.hrmApiService.getDesignationsByDepartment(departmentId).subscribe((apiRes: apiResultFormat) => {
      this.designations = apiRes.data;
    });
  }


  onCountryChange(countryName: any) {
    if (countryName) {
      this.states = [];  // Clear old states
      this.cities = [];  // Also clear old cities when country changes
      this.employeeForm.get('address')?.patchValue({ state: '', city: '' }); // Clear selected state and city
      this.setStates(countryName);
    }
  }

  onStateChange(stateName: any) {
    if (stateName) {
      this.cities = [];  // Clear old cities
      this.employeeForm.get('address')?.patchValue({ city: '' }); // Clear selected city
      this.setCities(stateName);
    }
  }


  setStates(countryName: any) {
    this.hrmApiService.getStates(countryName).subscribe((apiRes: apiResultFormat) => {
      this.states = apiRes.data.filter((c: any) => c.status === 'Active');
    });
  }

  setCities(stateName: any) {
    this.hrmApiService.getCities(stateName).subscribe((apiRes: apiResultFormat) => {
      this.cities = apiRes.data.filter((c: any) => c.status === 'Active');
    });
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();      
      return;
    }

    const employeeData = this.employeeForm.value;
    employeeData.restaurantId = this.restaurantId;

    this.hrmApiService.addEmployee(this.employeeForm.value).subscribe({
      next: (response) => {
        console.log('Employee added successfully', response);
        // Reset the form or navigate to another page
        this.employeeForm.reset();
        this.router.navigate(['/hrm/employee/employee-list']);
      },
      error: (error) => {
        console.error('Failed to add employee', error);
        // Show error message to user if needed
      }
    });
  }

}
