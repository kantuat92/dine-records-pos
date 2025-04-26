import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Editor, Toolbar } from 'ngx-editor';
import { SidebarService, apiResultFormat, routes } from 'src/app/core/core.index';
import { Store } from '@ngrx/store';
import { selectRestaurantId } from 'src/app/core/store/restaurant.selectors';
import { HrmApiService } from 'src/app/core/service/api-services/hrm-api.service';
import { ActivatedRoute, Route, Router } from '@angular/router';

interface data {
  value: string;
}
@Component({
  selector: 'app-edit-employee',
  templateUrl: './edit-employee.component.html',
  styleUrl: './edit-employee.component.scss',
  standalone: false
})
export class EditEmployeeComponent {


  restaurantId: any;
  employeeId: any;
  employeeForm!: FormGroup;
  shifts: any[] = [];
  departments: any[] = [];
  designations: any[] = [];
  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];



  public routes = routes;
  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic', 'format_clear'],
    ['underline', 'strike'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['image'],
    ['link'],
  ];

  public password: boolean[] = [false];


  public togglePassword(index: number) {
    this.password[index] = !this.password[index];
  }
  isCollapsed: boolean = false;
  toggleCollapse() {
    this.sidebar.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }
  constructor(private sidebar: SidebarService, private fb: FormBuilder,
    private store: Store, private hrmApiService: HrmApiService, private router: Router,
    private route: ActivatedRoute) {

    this.store.select(selectRestaurantId).subscribe(id => {
      console.log('In edit-employee.component.ts Restaurant id from store: ', id);
      this.restaurantId = id;
    });
  }

  get emergencyContactsFormArray(): FormArray {
    return this.employeeForm.get('emergencyContacts') as FormArray;
  }

  ngOnInit(): void {

    this.employeeId = this.route.snapshot.paramMap.get('employeeId') || '';
    console.log('employeeId in edit-employee.component.ts  : ', this.employeeId);

    this.editor = new Editor();

    this.employeeForm = this.fb.group({
      id: ['', Validators.required],
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
          id: ['', Validators.required],
          contactNumber: ['', Validators.required],
          relation: ['', Validators.required],
          name: ['', Validators.required],
        }),
        this.fb.group({
          id: ['', Validators.required],
          contactNumber: ['', Validators.required],
          relation: ['', Validators.required],
          name: ['', Validators.required],
        })
      ]),

      bankInformation: this.fb.group({
        id: ['', Validators.required],
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

    this.hrmApiService.getEmployee(this.employeeId).subscribe(employee => {
      console.log('employee loaded : ', employee);
      this.loadEmployee(employee);
      this.setDesignations(employee.departmentId);
      this.setStates(employee.address.country);
      this.setCities(employee.address.state);
    });
  }

  onDepartmentChange(departmentId: any) {
    if (departmentId) {
      //this.employeeForm.get('designationId')?.patchValue('');
      this.setDesignations(departmentId);
    }
  }

  // Example service call to fetch designations based on departmentId
  setDesignations(departmentId: any) {
    this.hrmApiService.getDesignationsByDepartment(departmentId).subscribe((apiRes: apiResultFormat) => {
      this.designations = apiRes.data;
    });
  }


  onCountryChange(countryCode: any) {
    if (countryCode) {
      this.states = [];  // Clear old states
      this.cities = [];  // Also clear old cities when country changes
      //this.employeeForm.get('address')?.patchValue({ state: '', city: '' }); // Clear selected state and city
      this.setStates(countryCode);
    }
  }

  onStateChange(stateId: any) {
    if (stateId) {
      this.cities = [];  // Clear old cities
      //this.employeeForm.get('address')?.patchValue({ city: '' }); // Clear selected city
      this.setCities(stateId);
    }
  }


  setStates(countryCode: any) {
    this.hrmApiService.getStates(countryCode).subscribe((apiRes: apiResultFormat) => {
      this.states = apiRes.data.filter((c: any) => c.status === 'Active');
    });
  }

  setCities(stateId: any) {
    this.hrmApiService.getCities(stateId).subscribe((apiRes: apiResultFormat) => {
      this.cities = apiRes.data.filter((c: any) => c.status === 'Active');
    });
  }


  loadEmployee(employee: any) {
    this.employeeForm.patchValue({
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      contactNumber: employee.contactNumber,
      gender: employee.gender,
      nationality: employee.nationality,
      joiningDate: employee.joiningDate ? new Date(employee.joiningDate) : null,
      dateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth) : null,
      shiftId: employee.shiftId,
      departmentId: employee.departmentId,
      designationId: employee.designationId,
      bloodGroup: employee.bloodGroup,
      about: employee.about,

      address: {
        id: employee.address?.id,
        address: employee.address?.address,
        country: employee.address?.country,
        state: employee.address?.state,
        city: employee.address?.city,
        zipcode: employee.address?.zipcode
      },

      bankInformation: {
        id: employee.bankInformation?.id,
        bankName: employee.bankInformation?.bankName,
        accountNumber: employee.bankInformation?.accountNumber,
        ifsc: employee.bankInformation?.ifsc,
        branch: employee.bankInformation?.branch
      }
    });

    // Now set emergency contacts separately
    const emergencyContacts = this.employeeForm.get('emergencyContacts') as FormArray;
    emergencyContacts.clear(); // First clear existing two empty contacts

    if (employee.emergencyContacts?.length) {
      employee.emergencyContacts.forEach((contact: any) => {
        emergencyContacts.push(this.fb.group({
          id: [contact.id, Validators.required],
          contactNumber: [contact.contactNumber, Validators.required],
          relation: [contact.relation, Validators.required],
          name: [contact.name, Validators.required]
        }));
      });
    }
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      console.log('employeeForm is invalid : ', this.employeeForm);
      this.employeeForm.markAllAsTouched();
      return;
    }

    const employeeData = this.employeeForm.value;
    employeeData.restaurantId = this.restaurantId;

    this.hrmApiService.editEmployee(this.employeeForm.value.id, this.employeeForm.value).subscribe({
      next: (response) => {
        console.log('Employee updated successfully', response);
        // Reset the form or navigate to another page
        this.employeeForm.reset();
        this.router.navigate(['/hrm/employee/employee-list']);
      },
      error: (error) => {
        console.error('Failed to edit employee', error);
        // Show error message to user if needed
      }
    });
  }

}
