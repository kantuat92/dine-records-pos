import { Component } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SidebarService, apiResultFormat } from 'src/app/core/core.index';
import { routes } from 'src/app/core/helpers/routes';
import { DataService } from 'src/app/core/service/data/data.service';
import { PaginationService, pageSelection, tablePageSize } from 'src/app/shared/custom-pagination/pagination.service';
import { Permission } from 'src/app/shared/model/page.model';
import { HttpClient } from '@angular/common/http';
import { UserManagementAPIService } from 'src/app/core/service/api-services/user-management-api.service';
interface data {
  value: string;
}

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.scss',
  standalone: false
})
export class PermissionsComponent {


  restaurantId = 1;
  roleId = 54;

  public routes = routes;
  initChecked = false;
  // pagination variables
  public tableData: Array<Permission> = [];
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<Permission>;
  public searchDataValue = '';
  //** / pagination variables

  constructor(
    private data: DataService,
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService,
    private http: HttpClient,
    private userManagementService: UserManagementAPIService
  ) {
    this.loadData();
  }

  loadData() {
    this.data.getDataTable().subscribe((apiRes: apiResultFormat) => {
      this.totalData = apiRes.totalData;
      this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        if (this.router.url == this.routes.permissions) {
          this.getTableData({ skip: res.skip, limit: this.totalData });
          this.pageSize = res.pageSize;
        }
      });
    });
    this.searchDataValue = '';
  }

  private getTableData(pageOption: pageSelection): void {
    this.data.getPermission(this.restaurantId, this.roleId).subscribe((apiRes: apiResultFormat) => {
      this.tableData = [];
      this.serialNumberArray = [];
      this.totalData = apiRes.totalData;
      apiRes.data.map((res: Permission, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          res.sNo = serialNumber;
          this.tableData.push(res);
          this.serialNumberArray.push(serialNumber);
        }
      });
      this.dataSource = new MatTableDataSource<Permission>(this.tableData);
      this.pagination.calculatePageSize.next({
        totalData: this.totalData,
        pageSize: this.pageSize,
        tableData: this.tableData,
        serialNumberArray: this.serialNumberArray,
      });
    });
  }

  public getUniqueOperationNames(permissions: Permission[]): Set<string> {
    return new Set(
      permissions.flatMap(permission =>
        permission.operations.map(operation => operation.operationName)
      )
    );
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



  public selectedValue1 = '';
  public selectedValue2 = '';
  public selectedValue3 = '';

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


  public filter = false;
  openFilter() {
    this.filter = !this.filter;
  }
  isCollapsed: boolean = false;
  toggleCollapse() {
    this.sidebar.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
  }

  submitPermissions(): void {
    const payload = {
      restaurantId: this.restaurantId,
      roleId: this.roleId,
      permissions: this.tableData
    };

    this.userManagementService.assignPermissions(payload).subscribe({
      next: (response) => {
        console.log('Permissions saved successfully', response);
        alert('Permissions saved successfully!');
      },
      error: (error) => {
        console.error('Error saving permissions', error);
        alert('Failed to save permissions. Please try again.');
      }
    });
  }


}
