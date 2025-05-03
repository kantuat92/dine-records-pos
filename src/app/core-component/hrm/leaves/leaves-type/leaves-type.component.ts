import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { apiResultFormat } from 'src/app/core/core.index';
import { routes } from 'src/app/core/helpers/routes';
import { HrmApiService } from 'src/app/core/service/api-services/hrm-api.service';
import { DataService } from 'src/app/core/service/data/data.service';
import { SidebarService } from 'src/app/core/service/sidebar/sidebar.service';
import { selectRestaurantId } from 'src/app/core/store/restaurant.selectors';
import { PaginationService, pageSelection, tablePageSize } from 'src/app/shared/custom-pagination/pagination.service';
import { leavestype } from 'src/app/shared/model/page.model';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

interface data {
  value: string;
}

@Component({
  selector: 'app-leaves-type',
  templateUrl: './leaves-type.component.html',
  styleUrl: './leaves-type.component.scss',
  standalone: false
})
export class LeavesTypeComponent {
  public routes = routes;
  initChecked = false;
  // pagination variables
  public tableData: Array<leavestype> = [];
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<leavestype>;
  public searchDataValue = '';
  //** / pagination variables


  leaveTypeForm!: FormGroup;
  @ViewChild('closeButtonForCreate') closeButtonForCreate!: ElementRef<HTMLButtonElement>;
  @ViewChild('closeButtonForEdit') closeButtonForEdit!: ElementRef<HTMLButtonElement>;
  @ViewChild('closeButtonForDelete') closeButtonForDelete!: ElementRef<HTMLButtonElement>;
  restaurantId: any;
  private tablePageSizeSub!: Subscription;
  editLeaveTypeForm!: FormGroup;
  deleteLeaveTypeId: any;



  constructor(
    private data: DataService,
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService,
    private fb: FormBuilder,
    private hrmApiService: HrmApiService,
    private store: Store
  ) {

    this.store.select(selectRestaurantId).subscribe(id => {
      console.log('In leaves-type.component.ts Restaurant id from store: ', id);
      this.restaurantId = id;
    });

    this.leaveTypeForm = this.fb.group({
      leaveType: ['', Validators.required],
      leaveQuota: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      status: [true] // default value as checked
    });

    this.editLeaveTypeForm = this.fb.group({
      id: [null], // hidden field to track editing ID
      leaveType: ['', Validators.required],
      leaveQuota: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      status: [true]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {

    if (this.tablePageSizeSub) {
      this.tablePageSizeSub.unsubscribe();
    }
    this.tablePageSizeSub = this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
      console.log('In tablePageSize subscribe, leave-types');
      if (this.router.url == this.routes.leavesType) {
        this.getTableData({ skip: res.skip, limit: res.limit });
        this.pageSize = res.pageSize;
      }
    });

    this.searchDataValue = '';
  }

  onSubmit(): void {
    if (this.leaveTypeForm.valid) {
      const leaveData = this.leaveTypeForm.value;
      leaveData.restaurantId = this.restaurantId;
      console.log('Submitting Leave Type:', leaveData);

      this.hrmApiService.createLeaveType(leaveData).subscribe(
        response => {
          const newLeaveType: leavestype = {
            ...response,
            sNo: this.tableData.length + 1
          }
          this.tableData.push(newLeaveType);
          this.leaveTypeForm.reset();
          this.leaveTypeForm.patchValue({ status: true });
          this.closeButtonForCreate.nativeElement.click(); // Click the close button
        },
        error => {
          alert('Error adding leave type!');
          console.error(error);
        }
      );


    } else {
      this.leaveTypeForm.markAllAsTouched();
    }
  }

  private getTableData(pageOption: pageSelection): void {
    this.hrmApiService.getLeaveTypes(this.restaurantId).subscribe((apiRes: apiResultFormat) => {
      this.tableData = [];
      this.serialNumberArray = [];
      this.totalData = apiRes.totalData;
      apiRes.data.map((res: leavestype, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          res.sNo = serialNumber;
          this.tableData.push(res);
          this.serialNumberArray.push(serialNumber);
        }
      });
      this.dataSource = new MatTableDataSource<leavestype>(this.tableData);
      this.pagination.calculatePageSize.next({
        totalData: this.totalData,
        pageSize: this.pageSize,
        tableData: this.tableData,
        serialNumberArray: this.serialNumberArray,
      });
    });
  }

  openEditModal(leave: leavestype): void {
    this.editLeaveTypeForm.patchValue({
      id: leave.id,
      leaveType: leave.leaveType,
      leaveQuota: leave.leaveQuota,
      status: leave.status
    });
  }

  onEditSubmit(): void {
    if (this.editLeaveTypeForm.valid) {
      const editedData = this.editLeaveTypeForm.value;
      editedData.restaurantId = this.restaurantId;
      console.log('Saving changes:', editedData);
      
      this.hrmApiService.editLeaveType(editedData.id, editedData).subscribe(
        response => {
          const index = this.tableData.findIndex(leaveType => leaveType.id === editedData.id);
          if (index !== -1) {
            this.tableData[index] = {
              ...this.tableData[index],
              ...response
            };
            this.dataSource = new MatTableDataSource<leavestype>(this.tableData);
          }
          this.editLeaveTypeForm.reset();
          this.editLeaveTypeForm.patchValue({ status: true });
          this.closeButtonForEdit.nativeElement.click(); // Click the close button
        },
        error => {
          alert('Error editing leave type!');
          console.error(error);
        }
      );
    } else {
      this.editLeaveTypeForm.markAllAsTouched();
    }
  }

  setDeleteLeaveTypeId(id: any) {
    this.deleteLeaveTypeId = id;
    console.log('deleteLeaveTypeId set to : ', this.deleteLeaveTypeId);
  }

  deleteLeaveType(): void {

    if (!this.deleteLeaveTypeId) {
      alert("deleteLeaveTypeId cannot be null");
      return;
    }

    this.hrmApiService.deleteLeaveType(this.deleteLeaveTypeId).subscribe(
      () => {
        this.tableData = this.tableData.filter(leaveType => leaveType.id !== this.deleteLeaveTypeId);
        this.tableData.forEach((leaveType, index) => leaveType.sNo = index + 1);
        this.serialNumberArray = this.tableData.map((_, index) => index + 1);
        this.dataSource = new MatTableDataSource<leavestype>(this.tableData);

        this.deleteLeaveTypeId = null;
        this.closeButtonForDelete.nativeElement.click();
      },
      (error) => {
        console.error('Error:', error);
        alert('Failed to DELETE leave type.');
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
  public filter = false;
  openFilter() {
    this.filter = !this.filter;
  }
  isCollapsed: boolean = false;
  toggleCollapse() {
    this.sidebar.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
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
    { value: 'Choose Type' },
    { value: 'Maternity' },
    { value: 'Sick Leave' },

  ];
  selectedList3: data[] = [
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
