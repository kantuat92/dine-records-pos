import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Editor, Toolbar } from 'ngx-editor';
import { Subscription } from 'rxjs';
import { SidebarService, apiResultFormat, routes } from 'src/app/core/core.index';
import { HrmApiService } from 'src/app/core/service/api-services/hrm-api.service';
import { DataService } from 'src/app/core/service/data/data.service';
import { selectRestaurantId } from 'src/app/core/store/restaurant.selectors';
import { PaginationService, pageSelection, tablePageSize } from 'src/app/shared/custom-pagination/pagination.service';
import { holiday } from 'src/app/shared/model/page.model';
import Swal from 'sweetalert2';
interface data {
  value: string;
}

@Component({
  selector: 'app-holidays',
  templateUrl: './holidays.component.html',
  styleUrl: './holidays.component.scss',
  standalone: false
})
export class HolidaysComponent {
  initChecked = false;
  public routes = routes
  public selectedValue1 = '';
  public selectedValue2 = '';
  public selectedValue3 = '';
  public selectedValue4 = '';
  public selectedValue5 = '';
  selectedList1: data[] = [
    { value: 'Choose Status' },
    { value: 'Mitchum Daniel' },
    { value: 'Susan Lopez' },

  ];
  selectedList2: data[] = [
    { value: 'Sort by Date' },
    { value: 'Newest' },
    { value: 'Oldest' },

  ];
  editor!: Editor;
  editor1!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic', 'format_clear'],
    ['underline', 'strike'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['image'],
    ['link'],
  ];
  // pagination variables
  public tableData: Array<holiday> = [];
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<holiday>;
  public searchDataValue = '';
  //** / pagination variables

  holidayForm!: FormGroup;
  @ViewChild('closeButtonForCreate') closeButtonForCreate!: ElementRef<HTMLButtonElement>;
  @ViewChild('closeButtonForEdit') closeButtonForEdit!: ElementRef<HTMLButtonElement>;
  @ViewChild('closeButtonForDelete') closeButtonForDelete!: ElementRef<HTMLButtonElement>;
  restaurantId: any;
  private tablePageSizeSub!: Subscription;
  editHolidayForm!: FormGroup;
  deleteHolidayId: any;

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
      console.log('In holidays.component.ts Restaurant id from store: ', id);
      this.restaurantId = id;
    });

    this.holidayForm = this.fb.group({
      id: [null],
      holiday: ['', Validators.required],
      fromDate: [null, Validators.required],
      toDate: [null, Validators.required],
      noOfDays: [null],
      description: ['', Validators.required],
      status: [true],
      restaurantId: [null],
    });

    // Optional: Auto-calculate noOfDays
    this.holidayForm.get('fromDate')?.valueChanges.subscribe(() => this.calculateNoOfDays());
    this.holidayForm.get('toDate')?.valueChanges.subscribe(() => this.calculateNoOfDays());


  }

  calculateNoOfDays(): void {
    const from = new Date(this.holidayForm.get('fromDate')?.value);
    const to = new Date(this.holidayForm.get('toDate')?.value);
    if (from && to && to >= from) {
      const timeDiff = to.getTime() - from.getTime();
      const dayCount = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
      this.holidayForm.patchValue({ noOfDays: dayCount });
    } else {
      this.holidayForm.patchValue({ noOfDays: null });
    }
  }

  ngOnInit(): void {
    this.editor = new Editor();
    this.editor1 = new Editor();
    this.loadData();
  }

  loadData() {

    if (this.tablePageSizeSub) {
      this.tablePageSizeSub.unsubscribe();
    }
    this.tablePageSizeSub = this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
      console.log('In tablePageSize subscribe, holidays');
      if (this.router.url == this.routes.holidays) {
        this.getTableData({ skip: res.skip, limit: res.limit });
        this.pageSize = res.pageSize;
      }
    });

    this.searchDataValue = '';
  }

  private getTableData(pageOption: pageSelection): void {
    this.hrmApiService.getHolidays(this.restaurantId).subscribe((apiRes: apiResultFormat | null) => {
      // Reset table-related values
      this.tableData = [];
      this.serialNumberArray = [];
      this.totalData = 0;

      if (apiRes && apiRes.data) {
        this.totalData = apiRes.totalData;

        apiRes.data.forEach((res: holiday, index: number) => {
          const serialNumber = index + 1;
          if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
            res.sNo = serialNumber;
            this.tableData.push(res);
            this.serialNumberArray.push(serialNumber);
          }
        });
      }

      this.dataSource = new MatTableDataSource<holiday>(this.tableData);

      this.pagination.calculatePageSize.next({
        totalData: this.totalData,
        pageSize: this.pageSize,
        tableData: this.tableData,
        serialNumberArray: this.serialNumberArray,
      });
    });
  }

  onSubmit(): void {
    if (this.holidayForm.valid) {
      const leaveData = this.holidayForm.value;
      leaveData.restaurantId = this.restaurantId;
      console.log('Submitting holiday:', leaveData);

      this.hrmApiService.createHoliday(leaveData).subscribe(
        response => {
          const newHoliday: holiday = {
            ...response,
            sNo: this.tableData.length + 1
          }
          this.tableData.push(newHoliday);
          this.holidayForm.reset();
          this.holidayForm.patchValue({ status: true });
          this.closeButtonForCreate.nativeElement.click(); // Click the close button
        },
        error => {
          alert('Error adding leave type!');
          console.error(error);
        }
      );
    } else {
      this.holidayForm.markAllAsTouched();
    }
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
  public filter = false;
  openFilter() {
    this.filter = !this.filter;
  }
  isCollapsed: boolean = false;
  toggleCollapse() {
    this.sidebar.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
  }
  selectedList4: data[] = [
    { value: 'Choose Holiday' },
    { value: 'UI/UX' },
    { value: 'HR' },
    { value: 'Admin' },
    { value: 'Engineering' },

  ];
  selectedList5: data[] = [
    { value: 'Choose HOD' },
    { value: 'Mitchum Daniel' },
    { value: 'Susan Lopez' },


  ];
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
  showBox = false;
  toggleBox() {
    this.showBox = !this.showBox;
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

  ngOnDestroy(): void {
    this.editor.destroy();
    this.editor1.destroy();
  }
}
