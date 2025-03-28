
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
  editRoleName: string = '';
  editRoleId: number | null = null;
  deleteRoleId: number | null = null;
  @ViewChild('closeButton') closeButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('closeButtonForEdit') closeButtonForEdit!: ElementRef<HTMLButtonElement>;
  @ViewChild('closeButtonForDelete') closeButtonForDelete!: ElementRef<HTMLButtonElement>;
  //** / pagination variables

  constructor(
    private data: DataService,
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService,
    private http: HttpClient
  ) {
    this.loadData();
    
  }

  loadData() {
    this.data.getDataTable().subscribe((apiRes: apiResultFormat) => {
      this.totalData = apiRes.totalData;
      this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        if (this.router.url == this.routes.rolesPermission) {
          this.getTableData({ skip: res.skip, limit: this.totalData  });
          this.pageSize = res.pageSize;
        }
      });
    });
  }

  setEditRoleId(roleId: number) {
    this.editRoleId = roleId;
    console.log('edit role id set to: ', this.editRoleId);
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

    const requestBody = {
      role: this.roleName,
      status: true,
      restaurantId: 1  // Adjust dynamically if needed
    };

    this.http.post('http://localhost:8080/api/v1/roles', requestBody).subscribe(
      (response) => {
        this.roleName = ''; // Clear input field
        this.loadData();
        this.closeButton.nativeElement.click(); // Click the close button
      },
      (error) => {
        console.error('Error:', error);
        alert('Failed to CREATE role.');
      }
    );
  }

  editRole(event: Event): void {
    event.preventDefault(); // Prevent form submission default behavior

    if (!this.editRoleName.trim()) {
      alert("Role name cannot be empty!");
      return;
    }

    const requestBody = {
      id: this.editRoleId,
      role: this.editRoleName
    };

    this.http.put(`http://localhost:8080/api/v1/roles/${this.editRoleId}`, requestBody).subscribe(
      (response) => {
        this.editRoleId = null; // Clear input field
        this.editRoleName = ''; // Clear input field
        this.loadData();
        this.closeButtonForEdit.nativeElement.click(); // Click the close button
      },
      (error) => {
        console.error('Error:', error);
        alert('Failed to EDIT role.');
      }
    );
  }

  deleteRole(): void {

    if (!this.deleteRoleId) {
      alert("Role Id cannot be null");
      return;
    }

    this.http.delete(`http://localhost:8080/api/v1/roles/${this.deleteRoleId}`).subscribe(
      (response) => {
        this.deleteRoleId = null; // Clear input field      
        this.loadData();
        this.closeButtonForDelete.nativeElement.click(); // Click the close button
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
      this.dataSource = new MatTableDataSource<rolesPermissions>(
        this.tableData
      );
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
  
}
