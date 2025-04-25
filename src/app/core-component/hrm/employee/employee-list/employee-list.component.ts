import { Component, ElementRef, ViewChild } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  DataService,
  pageSelection,
  apiResultFormat,
  routes,
  SidebarService,
} from 'src/app/core/core.index';
import { HrmApiService } from 'src/app/core/service/api-services/hrm-api.service';
import { employeeList } from 'src/app/shared/model/page.model';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { selectRestaurantId } from 'src/app/core/store/restaurant.selectors';

interface data {
  value: string;
}
@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss',
  standalone: false
})
export class EmployeeListComponent {
  initChecked = false;
  public selectedValue3 = '';
  public routes = routes;
  selectedList3: data[] = [
    { value: 'Sort by Date' },
    { value: 'Newest' },
    { value: 'Oldest' },
  ];

  // pagination variables
  public tableData: Array<employeeList> = [];
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<employeeList>;
  public searchDataValue = '';
  //** / pagination variables


  private tablePageSizeSub!: Subscription;
  restaurantId: any;
  deleteEmployeeId: any;  
  @ViewChild('closeDeleteButton') closeDeleteButton!: ElementRef<HTMLButtonElement>;



  constructor(
    private data: DataService,
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService,
    private store: Store,
    private hrmApiService: HrmApiService
  ) {
    this.store.select(selectRestaurantId).subscribe(id => {
      console.log('In employee-list.component.ts Restaurant id from store: ', id);
      this.restaurantId = id;
    });
  }

  ngOnInit() {
    // this.fetchRoles();
    this.loadData();

  }

  ngOnDestroy() {
    console.log('ngOnDestroy called in employees.');
    if (this.tablePageSizeSub) {
      this.tablePageSizeSub.unsubscribe();
    }
  }

  loadData() {

    if (this.tablePageSizeSub) {
      this.tablePageSizeSub.unsubscribe();
    }
    this.tablePageSizeSub = this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
      console.log('In tablePageSize subscribe, employees');
      if (this.router.url == this.routes.employeesList) {
        this.getTableData({ skip: res.skip, limit: res.limit });
        this.pageSize = res.pageSize;
      }
    });

    this.searchDataValue = '';
  }

  private getTableData(pageOption: pageSelection): void {
    this.hrmApiService.getEmployees(this.restaurantId).subscribe((apiRes: apiResultFormat) => {
      this.tableData = [];
      this.serialNumberArray = [];
      this.totalData = apiRes.totalData;
      apiRes.data.map((res: employeeList, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          res.sNo = serialNumber;
          this.tableData.push(res);
          this.serialNumberArray.push(serialNumber);
        }
      });
      this.dataSource = new MatTableDataSource<employeeList>(this.tableData);
      this.pagination.calculatePageSize.next({
        totalData: this.totalData,
        pageSize: this.pageSize,
        tableData: this.tableData,
        serialNumberArray: this.serialNumberArray,
      });
    });
  }



  setDeleteEmployeeId(id: any) {
    this.deleteEmployeeId = id;
    console.log('deleteEmployeeId set to : ', this.deleteEmployeeId);
  }

  deleteEmployee(): void {

    if (!this.deleteEmployeeId) {
      alert("deleteEmployeeId cannot be null");
      return;
    }

    this.hrmApiService.deleteEmployee(this.deleteEmployeeId).subscribe(
      () => {
        this.tableData = this.tableData.filter(employee => employee.id !== this.deleteEmployeeId);
        this.tableData.forEach((employee, index) => employee.sNo = index + 1);
        this.serialNumberArray = this.tableData.map((_, index) => index + 1);
        this.dataSource = new MatTableDataSource<employeeList>(this.tableData);

        this.deleteEmployeeId = null;
        this.closeDeleteButton.nativeElement.click();
      },
      (error) => {
        console.error('Error:', error);
        alert('Failed to DELETE employee.');
      }
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
  public selectedValue1 = '';
  public selectedValue2 = '';

  selectedList1: data[] = [
    { value: 'Choose Name' },
    { value: 'Mitchum Daniel' },
    { value: 'Susan Lopez' },
    { value: 'Robert Grossman' },
    { value: 'Janet Hembre' },
  ];
  selectedList2: data[] = [
    { value: 'Choose Status' },
    { value: 'Active' },
    { value: 'Inactive' },
  ];
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
