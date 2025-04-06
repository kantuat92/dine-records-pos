
import { Component, ViewChild, ElementRef } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import {
  DataService,
  pageSelection,
  apiResultFormat,
  SidebarService,
} from 'src/app/core/core.index';
import { routes } from 'src/app/core/helpers/routes';
import { users } from 'src/app/shared/model/page.model';
import { Role } from 'src/app/shared/model/page.model';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import Swal from 'sweetalert2';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserManagementAPIService } from 'src/app/core/service/api-services/user-management-api.service';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  standalone: false
})
export class UsersComponent {

  restaurantId: number = 17;
  userForm: FormGroup;
  editUserForm: FormGroup;
  showPassword = false;
  roles: Role[] = []; // Store roles fetched from API
  editUserId: number | null = null;
  deleteUserId: number | null = null;

  @ViewChild('closeButtonForAddUser') closeButtonForAddUser!: ElementRef<HTMLButtonElement>;
  @ViewChild('closeButtonForEditUser') closeButtonForEditUser!: ElementRef<HTMLButtonElement>;
  @ViewChild('closeButtonForDeleteUser') closeButtonForDeleteUser!: ElementRef<HTMLButtonElement>;

  initChecked = false;
  selectedValue1 = '';
  selectedValue2 = '';
  selectedValue3 = '';
  selectedValue4 = '';
  selectedValue5 = '';
  selectedValue6 = '';
  selectedValue7 = '';

  public routes = routes;
  // pagination variables
  public tableData: Array<users> = [];
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<users>;
  public searchDataValue = '';
  //** / pagination variables

  constructor(
    private data: DataService,
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService, private fb: FormBuilder, private http: HttpClient, private userManagementService: UserManagementAPIService
  ) {

    this.loadData();
    this.userForm = this.fb.group({
      userName: ['', Validators.required],
      roleId: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      status: [true]
    });

    this.editUserForm = this.fb.group({
      id: [null],
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      roleId: ['', Validators.required],
      status: [true]
    });
  }

  loadData() {
    this.data.getDataTable().subscribe((apiRes: apiResultFormat) => {
      this.totalData = apiRes.totalData;
      this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        if (this.router.url == this.routes.users) {
          this.getTableData({ skip: res.skip, limit: this.totalData });
          this.pageSize = res.pageSize;
        }
      });
    });
    this.searchDataValue = '';
  }

  ngOnInit() {
    this.fetchRoles();
  }

  setEditUserId(userId: number) {
    this.editUserId = userId;
    console.log('edit user id: ', this.editUserId);

    // Find the user from tableData array
    const user = this.tableData.find(u => u.id === userId);

    if (user) {
      this.editUserForm.patchValue({
        id: user.id,
        userName: user.userName,
        email: user.email,
        phone: user.phone,
        roleId: user.roleId,
        status: user.status
      });
    } else {
      console.warn(`User with ID ${userId} not found`);
    }
  }

  setDeleteUserId(userId: number) {
    this.deleteUserId = userId;
    console.log('deleteUserId set to : ', this.deleteUserId);
  }

  fetchRoles() {
    console.log('restaurantId: ', this.restaurantId);
    this.userManagementService.getRoles(this.restaurantId).subscribe(
      (response) => {
        console.log('API Response:', response);
        this.roles = response.data; // assuming roles are inside `data`
      },
      (error) => {
        console.error('Error fetching roles:', error);
      }
    );
  }
  


  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    console.log('this.userForm.valie:   ', this.userForm.valid);
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      delete userData.confirmPassword; // Remove confirmPassword before sending

      userData.restaurantId = this.restaurantId; // Set restaurantId before submitting

      this.userManagementService.postUser(userData).subscribe(
        response => {
          this.userForm.reset();
          this.loadData();
          this.closeButtonForAddUser.nativeElement.click(); // Click the close button
        },
        error => {
          alert('Error adding user!');
          console.error(error);
        }
      );
    }
  }

  onEditSubmit() {
    console.log('this.editUserForm.valie:   ', this.editUserForm.valid);
    if (this.editUserForm.valid) {
      const userData = this.editUserForm.value;
      delete userData.confirmPassword; // Remove confirmPassword before sending

      userData.restaurantId = this.restaurantId; // Set restaurantId before submitting
      userData.id = this.editUserId;

      this.userManagementService.updateUser(this.editUserId, userData).subscribe(
        response => {
          this.userForm.reset();
          this.loadData();
          this.closeButtonForEditUser.nativeElement.click(); // Click the close button
        },
        error => {
          alert('Error adding user!');
          console.error(error);
        }
      );
    }
  }

  deleteUser(): void {

    if (!this.deleteUserId) {
      alert("User Id cannot be null");
      return;
    }

    this.userManagementService.deleteUser(this.deleteUserId).subscribe(
      () => {
        this.deleteUserId = null; // Clear input field
        this.loadData();
        this.closeButtonForDeleteUser.nativeElement.click(); // Click the close button
      },
      (error) => {
        console.error('Error:', error);
        alert('Failed to DELETE user.');
      }
    );
  }

  private getTableData(pageOption: pageSelection): void {
    this.userManagementService.getUsers(this.restaurantId).subscribe((apiRes: apiResultFormat) => {
      this.tableData = [];
      this.serialNumberArray = [];
      this.totalData = apiRes.totalData;
      apiRes.data.map((res: users, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          res.sNo = serialNumber;
          this.tableData.push(res);
          this.serialNumberArray.push(serialNumber);
        }
      });
      this.dataSource = new MatTableDataSource<users>(this.tableData);
      this.pagination.calculatePageSize.next({
        totalData: this.totalData,
        pageSize: this.pageSize,
        tableData: this.tableData,
        serialNumberArray: this.serialNumberArray,
      });
    });
  }

  public sortData(sort: Sort) {
    const data = this.tableData.slice();
    if (!sort.active || sort.direction === '') {
      this.tableData = data;
    } else {
      this.tableData = data.sort((a, b) => {
        const aValue = (a as never)[sort.active];
        const bValue = (b as never)[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
  }

  public searchData(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
    this.tableData = this.dataSource.filteredData;
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

  public password: boolean[] = [false];


  selectAll(initChecked: boolean) {
    if (!initChecked) {
      this.tableData.forEach((f) => {
        f.isSelected = true;
      });
    } else {
      this.tableData.forEach((f) => {
        f.isSelected = false;
      });
    }
  }
}
