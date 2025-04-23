
import { routes } from 'src/app/core/helpers/routes';
import { SidebarService } from 'src/app/core/service/sidebar/sidebar.service';
import Swal from 'sweetalert2';
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HrmApiService } from 'src/app/core/service/api-services/hrm-api.service';
import { Department } from 'src/app/core/models/department.model';
import { Store } from '@ngrx/store';
import { selectRestaurantId } from 'src/app/core/store/restaurant.selectors';

interface data {
  value: string;
}

@Component({
  selector: 'app-department-grid',
  templateUrl: './department-grid.component.html',
  styleUrl: './department-grid.component.scss',
  standalone: false
})
export class DepartmentGridComponent {
  public routes = routes;
  public searchDataValue = '';
  public selectedValue1 = '';
  showFilter = false;


  public selectedValue2 = '';
  public selectedValue3 = '';
  selectedList1: data[] = [
    { value: 'Choose Type' },
    { value: 'Mitchum Daniel' },
    { value: 'Susan Lopez' },

  ];
  selectedList2: data[] = [
    { value: 'Choose Type' },
    { value: 'Mitchum Daniel' },
    { value: 'Susan Lopez' },
  ];
  selectedList3: data[] = [
    { value: 'Sort by Datee' },
    { value: 'Newest' },
    { value: 'Oldest' },
  ];

  @ViewChild('closeButton') closeBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('closeButtonForEditDepartment') closeButtonForEditDepartment!: ElementRef<HTMLButtonElement>;
  @ViewChild('closeButtonForDeleteDepartment') closeButtonForDeleteDepartment!: ElementRef<HTMLButtonElement>;

  departmentForm!: FormGroup;

  departments: Department[] = [];

  restaurantId: any;

  editDepartmentForm!: FormGroup;
  editingDepartmentId: number | null = null;
  deleteDepartmentId: number | null = null;




  constructor(private sidebar: SidebarService, private fb: FormBuilder,
    private hrmApiService: HrmApiService, private store: Store) {
    this.store.select(selectRestaurantId).subscribe(id => {
      console.log('In department-grid.component.ts Restaurant id from store: ', id);
      this.restaurantId = id;
    });
  }


  ngOnInit(): void {

    this.loadDepartments();

    this.departmentForm = this.fb.group({
      name: ['', Validators.required],
      hod: [''],
      description: [''],
      status: [true]
    });

    this.editDepartmentForm = this.fb.group({
      name: ['', Validators.required],
      hod: [''],
      description: [''],
      status: [true]
    });

  }

  loadDepartments(): void {
    this.hrmApiService.getDepartments(this.restaurantId).subscribe({
      next: (data) => this.departments = data,
      error: (err) => console.error('Error loading departments', err)
    });
  }

  onSubmit(): void {
    if (this.departmentForm.invalid) return;

    const departmentData = this.departmentForm.value;
    departmentData.restaurantId = this.restaurantId;

    this.hrmApiService.createDepartment(departmentData).subscribe({
      next: (createdDepartment: Department) => {
        this.departments.push(createdDepartment);
        this.closeBtn.nativeElement.click();
        this.departmentForm.reset({ status: true });
      },
      error: (err) => {
        console.error('Department creation failed', err);
      }
    });
  }

  openEditModal(department: Department): void {
    this.editingDepartmentId = department.id!;
    this.editDepartmentForm.patchValue({
      name: department.name,
      hod: department.hod,
      description: department.description,
      status: department.status,
      restaurantId: this.restaurantId
    });
  }

  onEditSubmit(): void {
    if (this.editDepartmentForm.invalid || this.editingDepartmentId === null) return;

    const updatedData = this.editDepartmentForm.value;
    updatedData.restaurantId = this.restaurantId;

    this.hrmApiService.updateDepartment(this.editingDepartmentId, updatedData).subscribe({
      next: (updatedDepartment) => {
        const index = this.departments.findIndex(dep => dep.id === this.editingDepartmentId);
        if (index !== -1) {
          this.departments[index] = updatedDepartment;
        }
        this.editDepartmentForm.reset({ status: true });
        this.editingDepartmentId = null;
        this.closeButtonForEditDepartment.nativeElement.click();
      },
      error: (err) => {
        console.error('Failed to update department', err);
      }
    });
  }

  confirmDelete(department: Department): void {
    this.deleteDepartmentId = department.id;    
  }
  
  onDeleteConfirmed(): void {
    if (!this.deleteDepartmentId) return;
  
    this.hrmApiService.deleteDepartment(this.deleteDepartmentId).subscribe({
      next: () => {
        this.departments = this.departments.filter(dep => dep.id !== this.deleteDepartmentId);
        this.deleteDepartmentId = null;
        this.closeButtonForDeleteDepartment.nativeElement.click();
      },
      error: (err) => console.error('Failed to delete department', err)
    });
  }
  


  confirmColor() {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: ' btn btn-success',
        cancelButton: 'me-2 btn btn-danger',
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        confirmButtonText: 'Yes, delete it!',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          swalWithBootstrapButtons.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          );
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire(
            'Cancelled',
            'Your imaginary file is safe :)',
            'error'
          );
        }
      });
  }


  isCollapsed: boolean = false;
  toggleCollapse() {
    this.sidebar.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
  }
  public filter = false;
  openFilter() {
    this.filter = !this.filter;
  }

}
