import {DatePipe} from '@angular/common';
import {Component, ElementRef, ViewChild} from '@angular/core';
import {Sort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {Router} from '@angular/router';
import {apiResultFormat, pageSelection, routes, SidebarService,} from 'src/app/core/core.index';
import {Shift} from 'src/app/shared/model/page.model';
import {PaginationService, tablePageSize} from 'src/app/shared/shared.index';
import Swal from 'sweetalert2';
import {Store} from "@ngrx/store";
import {selectRestaurantId} from "../../../core/store/restaurant.selectors";
import {Subscription} from "rxjs";
import {HrmApiService} from "../../../core/service/api-services/hrm-api.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

interface data {
  value: string;
}

@Component({
  selector: 'app-shift',
  templateUrl: './shift.component.html',
  styleUrl: './shift.component.scss',
  standalone: false
})
export class ShiftComponent {
  time1 = new Date();
  time2 = new Date();
  time9 = new Date();
  time10 = new Date();

  public routes = routes;
  public selectedValue1 = '';
  public selectedValue2 = '';
  public selectedValue3 = '';
  public selectedValue4 = '';
  public selectedValue5 = '';

  // pagination variables
  public tableData: Array<Shift> = [];
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<Shift>;
  public searchDataValue = '';

  //** / pagination variables

  restaurantId: any;
  private tablePageSizeSub!: Subscription;
  shiftForm!: FormGroup;
  editShiftForm!: FormGroup;
  @ViewChild('closeCreateButton') closeCreateButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('closeEditButton') closeEditButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('closeDeleteButton') closeDeleteButton!: ElementRef<HTMLButtonElement>;


  constructor(private hrmApiService: HrmApiService, private pagination: PaginationService, private router: Router,
              private sidebar: SidebarService, private datePipe: DatePipe,
              private store: Store, private fb: FormBuilder) {

    this.store.select(selectRestaurantId).subscribe(id => {
      console.log('In leaves-employee.component.ts Restaurant id from store: ', id);
      this.restaurantId = id;
    });
  }

  ngOnInit(): void {

    this.shiftForm = this.fb.group({
      shiftName: ['', Validators.required],
      shiftType: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      weekOff: ['', Validators.required]
    });
    this.loadData();
  }

  loadData() {
    if (this.tablePageSizeSub) {
      this.tablePageSizeSub.unsubscribe();
    }
    this.tablePageSizeSub = this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
      console.log('In tablePageSize subscribe, shifts');
      if (this.router.url == this.routes.shift) {
        this.getTableData({skip: res.skip, limit: res.limit});
        this.pageSize = res.pageSize;
      }
    });

    this.searchDataValue = '';
  }


  private getTableData(pageOption: pageSelection): void {
    this.hrmApiService.getShiftsByRestaurant(this.restaurantId).subscribe((apiRes: apiResultFormat) => {
      this.tableData = [];
      this.serialNumberArray = [];
      this.totalData = apiRes.totalData;
      apiRes.data.map((res: Shift, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          res.sNo = serialNumber;
          this.tableData.push(res);
          this.serialNumberArray.push(serialNumber);
        }
      });
      this.dataSource = new MatTableDataSource<Shift>(this.tableData);
      this.pagination.calculatePageSize.next({
        totalData: this.totalData,
        pageSize: this.pageSize,
        tableData: this.tableData,
        serialNumberArray: this.serialNumberArray,
      });
    });
  }

  addShift() {
    if (this.shiftForm.invalid) return;

    const formValue = this.shiftForm.value;

    const addShiftPayload = {
      ...formValue,
      startTime: this.convertTo24Hour(formValue.startTime),
      endTime: this.convertTo24Hour(formValue.endTime),
      restaurantId: this.restaurantId
    };


    this.hrmApiService.createShift(addShiftPayload).subscribe(
      response => {
        const newLeaveApplication = {
          ...response,
          sNo: this.tableData.length + 1
        }
        this.tableData.push(newLeaveApplication);
        this.shiftForm.reset();
        this.closeCreateButton.nativeElement.click();
      },
      err => {
        console.error('Error saving shift', err);
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

  isCollapsed: boolean = false;

  toggleCollapse() {
    this.sidebar.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
  }

  selectedList1: data[] = [
    {value: 'Sort by Date'},
    {value: 'Newest'},
    {value: 'Oldest'},
  ];
  selectedList2: data[] = [
    {value: 'Choose Shift'},
    {value: 'Regular'},
    {value: 'Overtime'},
    {value: 'Weekend'},
    {value: 'Rotational'}
  ];

  selectedList3: data[] = [
    {value: 'Choose Status'},
    {value: 'Active'},
    {value: 'Inactive'},
  ];
  selectedList4: data[] = [
    {value: 'Choose'},
    {value: 'Sunday, Monday'},
    {value: 'Saturday, Sunday'},
    {value: 'Tuesday, Saturday'},
  ];
  selectedList5: data[] = [
    {value: 'Choose'},
    {value: 'Sunday, Monday'},
    {value: 'Saturday, Sunday'},
    {value: 'Tuesday, Saturday'},
  ];

  showBox = false;

  showTimePicker: Array<string> = [];
  date = new Date();

  toggleTimePicker(value: string): void {
    if (this.showTimePicker[0] !== value) {
      this.showTimePicker[0] = value;
    } else {
      this.showTimePicker = [];
    }
  }

  public initChecked = false;

  formatTime(date: Date, form: FormGroup, controlName: string) {
    const selectedDate: Date = new Date(date);
    const time = this.datePipe.transform(selectedDate, 'h:mm a');
    console.log('time : ', time);
    if (form && controlName) {
      form.get(controlName)?.setValue(time);
    }
    return time;
  }

  convertTo24Hour(time12h: string): string {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier.toLowerCase() === 'pm' && hours !== 12) {
      hours += 12;
    }
    if (modifier.toLowerCase() === 'am' && hours === 12) {
      hours = 0;
    }

    // Format to HH:mm:ss
    const hh = hours.toString().padStart(2, '0');
    const mm = minutes.toString().padStart(2, '0');
    return `${hh}:${mm}:00`;
  }

  convertTo12HourTimeFormat(time: string) {
    return this.datePipe.transform('1970-01-01T' + time, 'h:mm a'); // 1970-01-01T is a dummy date.
  }


}
