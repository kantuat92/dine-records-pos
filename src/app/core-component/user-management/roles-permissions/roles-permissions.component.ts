
import { Component, ViewChild, ElementRef } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import {
  DataService,
  pageSelection,
  apiResultFormat,
  routes,
} from 'src/app/core/core.index';
import { HttpClient } from '@angular/common/http';
import { SidebarService } from 'src/app/core/service/sidebar/sidebar.service';
import { rolesPermissions } from 'src/app/shared/model/page.model';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserManagementAPIService } from 'src/app/core/service/api-services/user-management-api.service';
interface data {
  value: string;
}

@Component({
  selector: 'app-roles-permissions',
  templateUrl: './roles-permissions.component.html',
  styleUrl: './roles-permissions.component.scss',
  standalone: false
})
export class RolesPermissionsComponent {

  editRoleForm: FormGroup;
  initChecked = false;
  public routes = routes;
  isCollapsed: boolean = false;
  toggleCollapse() {
    this.sidebar.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
  }

  public selectedValue1 = '';
  public selectedValue2 = '';

  selectedList1: data[] = [
    { value: 'Sort by Date' },
    { value: 'Newest' },
    { value: 'Oldest' },
  ];
  selectedList2: data[] = [
    { value: 'Choose Role' },
    { value: 'Admin' },
    { value: 'Shop Owner' },
  ];
  // pagination variables
  public tableData: Array<rolesPermissions> = [];
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<rolesPermissions>;
  public searchDataValue = '';
  roleName: string = '';
  deleteRoleId: number | null = null;
  public currentSearchText = '';
  public currentStatusFilter = 'all';
  public selectedStatus: string = 'Status'; // Default label
  restaurantId = 1;


  @ViewChild('closeButton') closeButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('closeButtonForEdit') closeButtonForEdit!: ElementRef<HTMLButtonElement>;
  @ViewChild('closeButtonForDelete') closeButtonForDelete!: ElementRef<HTMLButtonElement>;
  //** / pagination variables

  constructor(
    private data: DataService,
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService,
    private http: HttpClient,
    private fb: FormBuilder,
    private userManagementService: UserManagementAPIService
  ) {
    this.loadData();
    this.editRoleForm = this.fb.group({
      id: [null],
      role: ['', Validators.required],
      status: [true]
    });

  }

  loadData() {
    this.data.getDataTable().subscribe((apiRes: apiResultFormat) => {
      this.totalData = apiRes.totalData;
      this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        if (this.router.url == this.routes.rolesPermission) {
          this.getTableData({ skip: res.skip, limit: this.totalData });
          this.pageSize = res.pageSize;
        }
      });
    });
    this.searchDataValue = '';
  }

  setEditRoleId(roleId: number) {
    const role = this.tableData.find(u => u.id === roleId);
    if (role) {
      this.editRoleForm.patchValue({
        id: role.id,
        role: role.role,
        status: role.status
      });
    } else {
      console.warn(`Role with ID ${roleId} not found`);
    }

  }

  setDeleteRoleId(roleId: number) {
    this.deleteRoleId = roleId;
    console.log('delete role id set to: ', this.deleteRoleId);
  }

  createRole(event: Event): void {
    event.preventDefault(); // Prevent form submission default behavior

    if (!this.roleName.trim()) {
      alert("Role name cannot be empty!");
      return;
    }

    this.userManagementService.createRole(this.roleName, this.restaurantId).subscribe(
      (response) => {
        this.roleName = '';
        this.loadData();
        this.closeButton.nativeElement.click();
      },
      (error) => {
        console.error('Error:', error);
        alert('Failed to CREATE role.');
      }
    );
  }


  editRole(): void {
    if (this.editRoleForm.valid) {
      const roleData = this.editRoleForm.value;

      this.userManagementService.updateRole(roleData).subscribe(
        (response) => {
          this.editRoleForm.reset();
          this.loadData();
          this.closeButtonForEdit.nativeElement.click(); // Click the close button
        },
        (error) => {
          console.error('Error:', error);
          alert('Failed to EDIT role.');
        }
      );
    }
  }


  deleteRole(): void {
    if (!this.deleteRoleId) {
      alert("Role Id cannot be null");
      return;
    }

    this.userManagementService.deleteRole(this.deleteRoleId).subscribe(
      (response) => {
        this.deleteRoleId = null;
        this.loadData();
        this.closeButtonForDelete.nativeElement.click();
      },
      (error) => {
        console.error('Error:', error);
        alert('Failed to DELETE role.');
      }
    );
  }


  private getTableData(pageOption: pageSelection): void {
    this.data.getRolesPermissions().subscribe((apiRes: apiResultFormat) => {
      this.tableData = [];
      this.serialNumberArray = [];
      this.totalData = apiRes.totalData;
      apiRes.data.map((res: rolesPermissions, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          res.sNo = serialNumber;
          this.tableData.push(res);
          this.serialNumberArray.push(serialNumber);
        }
      });


      this.dataSource = new MatTableDataSource<rolesPermissions>(this.tableData);
      this.dataSource.filterPredicate = (data: rolesPermissions, filter: string) => {
        const filterObj = JSON.parse(filter);
        const matchesStatus =
          filterObj.status === 'all' || data.status.toString().toLowerCase() === filterObj.status;
        const matchesSearch = data.role.toLowerCase().includes(filterObj.search);


        return matchesStatus && matchesSearch;
      };


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
    this.currentSearchText = value.trim().toLowerCase();
    this.applyFilters();
  }

  filterByStatus(status: string) {
    this.currentStatusFilter = status.toLowerCase();
    this.selectedStatus = status === 'All' ? 'Status' : status === 'true' ? 'Active' : 'Inactive';
    this.applyFilters();
  }

  applyFilters() {
    const filterObj = {
      status: this.currentStatusFilter,
      search: this.currentSearchText
    };
    this.dataSource.filter = JSON.stringify(filterObj);
    this.tableData = this.dataSource.filteredData;
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
  public filter = false;
  openFilter() {
    this.filter = !this.filter;
  }
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

  navigateToPermissions(roleId: number, roleName: string) {
    this.router.navigate([routes.permissions], {
      state: { roleId: roleId, roleName: roleName, restaurantId: this.restaurantId }
    });
  }



}
