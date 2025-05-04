import { Component } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SidebarService, apiResultFormat } from 'src/app/core/core.index';
import { routes } from 'src/app/core/helpers/routes';
import { DataService } from 'src/app/core/service/data/data.service';
import { attendenceEmployee } from 'src/app/shared/model/page.model';
import { PaginationService, pageSelection, tablePageSize } from 'src/app/shared/shared.index';
import { interval, map, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectRestaurantId } from 'src/app/core/store/restaurant.selectors';
import { Attendance } from 'src/app/shared/model/attendance.model';
import { HrmApiService } from 'src/app/core/service/api-services/hrm-api.service';

interface data {
  value: string;
}

@Component({
  selector: 'app-attendance-employee',
  templateUrl: './attendance-employee.component.html',
  styleUrl: './attendance-employee.component.scss',
  standalone: false
})
export class AttendanceEmployeeComponent {

  time$ = interval(1000).pipe(
    map(() => new Date())
  );

  today = new Date();
  private tablePageSizeSub!: Subscription;
  restaurantId: any;
  employeeId = 13;
  public isClockedIn: boolean = false;
  public isClockedOut: boolean = false;





  initChecked = false;
  public selectedValue1 = '';
  public selectedValue2 = '';

  selectedList1: data[] = [
    { value: 'Sort by Datee' },
    { value: 'Newest' },
    { value: 'Oldest' },
  ];
  selectedList2: data[] = [
    { value: 'Choose Status' },
    { value: 'Present' },
    { value: 'Absent' },
    { value: 'Holiday' },
  ];
  public routes = routes
  // pagination variables
  public tableData: Array<Attendance> = [];
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<Attendance>;
  public searchDataValue = '';
  //** / pagination variables

  constructor(
    private data: DataService,
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService,
    private store: Store,
    private hrmApiService: HrmApiService
  ) {

    this.store.select(selectRestaurantId).subscribe(id => {
      console.log('In attendance-employee.component.ts Restaurant id from store: ', id);
      this.restaurantId = id;
    });
  }

  ngOnInit() {
    this.loadData();

  }

  loadData() {

    if (this.tablePageSizeSub) {
      this.tablePageSizeSub.unsubscribe();
    }
    this.tablePageSizeSub = this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
      console.log('In tablePageSize subscribe, attendance');
      if (this.router.url == this.routes.attendanceEmployee) {
        this.getTableData({ skip: res.skip, limit: res.limit });
        this.pageSize = res.pageSize;
      }
    });

    this.searchDataValue = '';
  }

  private getTableData(pageOption: pageSelection): void {
    this.hrmApiService.getAttendance(this.restaurantId, this.employeeId).subscribe((apiRes: apiResultFormat) => {
      this.tableData = [];
      this.serialNumberArray = [];
      this.totalData = apiRes.totalData;
      apiRes.data.map((res: Attendance, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          res.sNo = serialNumber;
          this.tableData.push(res);
          this.serialNumberArray.push(serialNumber);
        }
      });
      this.dataSource = new MatTableDataSource<Attendance>(this.tableData);
      this.pagination.calculatePageSize.next({
        totalData: this.totalData,
        pageSize: this.pageSize,
        tableData: this.tableData,
        serialNumberArray: this.serialNumberArray,
      });



      this.updateClockInAndClockOut();


    });
  }

  updateClockInAndClockOut() {
    this.isClockedIn = false;
    this.isClockedOut = false;
    const attendance = this.getTodaysAttendance();
    if (attendance) {
      console.log('Attendance ID for today:', attendance.id);
      this.isClockedIn = attendance.clockInTime !== null;
      this.isClockedOut = attendance.clockOutTime != null;
      console.log('isClockedIn: ', this.isClockedIn);
      console.log('isClockedOut: ', this.isClockedOut);
    }
  }

  checkClockInTimeExistsForToday(): boolean {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    // Check if any attendance record has clockInTime for today
    return this.tableData.some(item => {
      const clockInDate = item.clockInTime.split('T')[0]; // Extract the date part (YYYY-MM-DD)
      console.log('Clock in time exists for today: ', (clockInDate === today));
      return clockInDate === today;
    });
  }

  clockInForToday(): void {
    this.hrmApiService.clockIn(this.restaurantId, this.employeeId).subscribe(
      (newAttendance: Attendance) => {
        this.tableData.push(newAttendance);
        this.isClockedIn = true;
      },
      (error) => {
        console.error('Error clocking in:', error);
      }
    );
  }

  clockOutForToday(): void {
    const attendanceId = this.getTodaysAttendanceId();
    this.hrmApiService.clockOut(attendanceId).subscribe(
      (updatedAttendance: Attendance) => {
        // Find the attendance record by its ID
        const attendanceIndex = this.tableData.findIndex(a => a.id === attendanceId);
        if (attendanceIndex !== -1) {
          // Update the existing attendance data
          this.tableData[attendanceIndex] = updatedAttendance;
        }
        this.isClockedOut = true; // Set clocked-in status to false
      },
      (error) => {
        // Handle error (you can log it or show a user-friendly message)
        console.error('Error clocking out:', error);
      }
    );
  }

  getTodaysAttendance(): any {
    console.log("tableData: ", this.tableData);

    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    // Find the attendance record for today and return its ID
    const attendance = this.tableData.find(item => {
      const clockInDate = item.clockInTime.split('T')[0]; // Extract the date part (YYYY-MM-DD)
      console.log('today: ', today);
      console.log('clockInDate: ', clockInDate);
      return clockInDate === today;
    });
    return attendance;
  }

  getTodaysAttendanceId(): number | null {

    const attendance = this.getTodaysAttendance();

    // If an attendance record is found, return its ID, otherwise return null
    if (attendance) {
      console.log('Attendance ID for today:', attendance.id);
      return attendance.id;
    }

    console.log('No clock-in time for today');
    return null;
  }

  formatTotalHours(hours: number): string {
    if (hours === null || hours === undefined) {
      return ''; // or you can return a default value like 'N/A'
    }
    const h = Math.floor(hours); // Get the integer part for hours
    const m = Math.round((hours - h) * 60); // Get the decimal part and convert to minutes

    return `${h} h ${m} m`; // Format as "X h Y m"
  }




  public searchData(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
    this.tableData = this.dataSource.filteredData;
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

  ngOnDestroy() {
    console.log('ngOnDestroy called in attendance.');
    if (this.tablePageSizeSub) {
      this.tablePageSizeSub.unsubscribe();
    }
  }

}
