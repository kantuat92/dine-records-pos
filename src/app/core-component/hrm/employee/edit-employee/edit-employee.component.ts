import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Editor, Toolbar, Validators } from 'ngx-editor';
import { SidebarService, routes } from 'src/app/core/core.index';
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

  employeeForm!: FormGroup;


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
  ngOnInit(): void {
    this.editor = new Editor();
  }
  ngOnDestroy(): void {
    this.editor.destroy();
  }
  constructor(private sidebar: SidebarService, private fb: FormBuilder) { }

  // Suppose 'employee' is your API response object
  loadEmployee(employee: any) {
    this.employeeForm.patchValue({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      contactNumber: employee.contactNumber,
      dateOfBirth: employee.dateOfBirth,
      gender: employee.gender,
      nationality: employee.nationality,
      joiningDate: employee.joiningDate,
      shiftId: employee.shiftId,
      departmentId: employee.departmentId,
      designationId: employee.designationId,
      bloodGroup: employee.bloodGroup,
      about: employee.about,
      password: '', // You might not want to pre-fill password for security reasons
      confirmPassword: '',

      address: {
        id: employee.address?.id,
        address: employee.address?.address,
        country: employee.address?.country,
        state: employee.address?.state,
        city: employee.address?.city,
        zipcode: employee.address?.zipcode
      },

      bankInformation: {
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
          contactNumber: [contact.contactNumber, Validators.required],
          relation: [contact.relation, Validators.required],
          name: [contact.name, Validators.required]
        }));
      });
    }
  }

}
