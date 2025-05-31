import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {Sort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {Router} from '@angular/router';
import {Editor, Toolbar, Validators} from 'ngx-editor';
import {apiResultFormat} from 'src/app/core/core.index';
import {routes} from 'src/app/core/helpers/routes';
import {DataService} from 'src/app/core/service/data/data.service';
import {SidebarService} from 'src/app/core/service/sidebar/sidebar.service';
import {pageSelection, PaginationService, tablePageSize} from 'src/app/shared/custom-pagination/pagination.service';
import {employeeList, LeavesEmployee, leavestype} from 'src/app/shared/model/page.model';
import Swal from 'sweetalert2';
import {HrmApiService} from "../../../../core/service/api-services/hrm-api.service";
import {selectRestaurantId} from "../../../../core/store/restaurant.selectors";
import {Store} from "@ngrx/store";
import {Subscription} from "rxjs";

interface data {
  value: string;
}

@Component({
  selector: 'app-leaves-employee',
  templateUrl: './leaves-employee.component.html',
  styleUrl: './leaves-employee.component.scss',
  standalone: false
})
export class LeavesEmployeeComponent implements OnInit, OnDestroy {

  leaveForm!: FormGroup;
  editLeaveForm!: FormGroup;
  restaurantId: any;
  employees: employeeList[] = [];
  leaveTypes: leavestype[] = [];
  deleteLeaveApplicationId: number | null = null;
  editLeaveApplicationId: number | null = null;
  initChecked = false;
  public routes = routes;
  // pagination variables
  public tableData: Array<LeavesEmployee> = [];
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<LeavesEmployee>;
  public searchDataValue = '';
  //** / pagination variables

  private tablePageSizeSub!: Subscription;
  @ViewChild('closeCreateButton') closeCreateButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('closeEditButton') closeEditButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('closeDeleteButton') closeDeleteButton!: ElementRef<HTMLButtonElement>;

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
      console.log('In leaves-employee.component.ts Restaurant id from store: ', id);
      this.restaurantId = id;
    });

  }

  private getTableData(pageOption: pageSelection): void {
    this.hrmApiService.getLeaveApplicationsByRestaurant(this.restaurantId).subscribe((apiRes: apiResultFormat) => {
      this.tableData = [];
      this.serialNumberArray = [];
      this.totalData = apiRes.totalData;
      apiRes.data.map((res: LeavesEmployee, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          res.sNo = serialNumber;
          this.tableData.push(res);
          this.serialNumberArray.push(serialNumber);
        }
      });
      this.dataSource = new MatTableDataSource<LeavesEmployee>(this.tableData);
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

  isCollapsed: boolean = false;

  toggleCollapse() {
    this.sidebar.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
  }

  public selectedValue1 = '';
  public selectedValue2 = '';
  public selectedValue3 = '';
  public selectedValue4 = '';
  public selectedValue5 = '';
  public selectedValue6 = '';
  public selectedValue7 = '';

  selectedList1: data[] = [
    {value: 'Sort by Date'},
    {value: 'Newest'},
    {value: 'Oldest'},
  ];
  selectedList2: data[] = [
    {value: 'Choose Employee'},
    {value: 'Mitchum Daniel'},
    {value: 'Susan Lopez'},
    {value: 'Robert Grossman'},
    {value: 'Janet Hembre'},
  ];
  selectedList3: data[] = [
    {value: 'Choose Type'},
    {value: 'Sick Leave'},
    {value: 'Maternity'},
    {value: 'Vacation'},
  ];
  selectedList4: data[] = [
    {value: 'Choose Status'},
    {value: 'Approved'},
    {value: 'Rejected'},

  ];
  selectedList5: data[] = [
    {value: 'Choose'},
    {value: 'Sick Leave'},
    {value: 'Paternity'},

  ];
  selectedList6: data[] = [
    {value: 'Full Day'},
    {value: 'Sick Leave'},
    {value: 'Half Day'},

  ];
  selectedList7: data[] = [
    {value: 'Full Day'},
    {value: 'Sick Leave'},
    {value: 'Half Day'},

  ];
  editor!: Editor;
  editor1!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']}],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  form = new FormGroup({
    editorContent: new FormControl('', Validators.required()),
  });

  ngOnInit(): void {
    this.editor = new Editor();
    this.editor1 = new Editor();

    this.leaveForm = this.fb.group({
      employeeId: [''],
      leaveTypeId: [''],
      fromDate: [''],
      toDate: [''],
      leaveDuration: [''],
      noOfDays: [{value: '', disabled: true}],
      reason: ['']
    });

    this.editLeaveForm = this.fb.group({
      employeeId: [''],
      leaveTypeId: [''],
      fromDate: [''],
      toDate: [''],
      leaveDuration: [''],
      noOfDays: [{value: '', disabled: true}],
      reason: ['']
    });

    this.leaveForm.get('fromDate')?.valueChanges.subscribe(() => {
      this.updateNoOfDays(this.leaveForm);
    });

    this.leaveForm.get('toDate')?.valueChanges.subscribe(() => {
      this.updateNoOfDays(this.leaveForm);
    });

    this.editLeaveForm.get('fromDate')?.valueChanges.subscribe(() => {
      this.updateNoOfDays(this.editLeaveForm);
    });

    this.editLeaveForm.get('toDate')?.valueChanges.subscribe(() => {
      this.updateNoOfDays(this.editLeaveForm);
    });
    this.fetchEmployees();
    this.fetchLeaveTypes();
    this.loadData();
  }

  updateNoOfDays(form: FormGroup) {
    const from = form.get('fromDate')?.value;
    const to = form.get('toDate')?.value;

    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);

      // Set time to 0:0:0 to avoid time differences
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(0, 0, 0, 0);

      const diffInMs = toDate.getTime() - fromDate.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      const noOfDays = diffInDays >= 0 ? diffInDays + 1 : 0;
      form.get('noOfDays')?.setValue(noOfDays);
    }
  }


  loadData() {
    if (this.tablePageSizeSub) {
      this.tablePageSizeSub.unsubscribe();
    }
    this.tablePageSizeSub = this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
      console.log('In tablePageSize subscribe, leave applications');
      if (this.router.url == this.routes.leavesEmployee) {
        this.getTableData({skip: res.skip, limit: res.limit});
        this.pageSize = res.pageSize;
      }
    });

    this.searchDataValue = '';
  }

  fetchEmployees() {
    console.log('restaurantId: ', this.restaurantId);
    this.hrmApiService.getEmployees(this.restaurantId).subscribe(
      (response) => {
        console.log('get employees API Response:', response);
        this.employees = response.data; // assuming roles are inside `data`
      },
      (error) => {
        console.error('Error fetching employees:', error);
      }
    );
  }

  fetchLeaveTypes() {
    console.log('restaurantId: ', this.restaurantId);
    this.hrmApiService.getLeaveTypes(this.restaurantId).subscribe(
      (response) => {
        console.log('get leave types API Response:', response);
        this.leaveTypes = response.data; // assuming roles are inside `data`
      },
      (error) => {
        console.error('Error fetching leave types:', error);
      }
    );
  }

  addLeave() {
    if (this.leaveForm.invalid) return;

    const addLeavePayload = {
      ...this.leaveForm.getRawValue(),
      fromDate: this.leaveForm.value.fromDate?.toISOString().slice(0, 10),
      toDate: this.leaveForm.value.toDate?.toISOString().slice(0, 10),
      restaurantId: this.restaurantId
    };


    this.hrmApiService.createLeaveApplication(addLeavePayload).subscribe(
      response => {
        const newLeaveApplication = {
          ...response,
          sNo: this.tableData.length + 1
        }
        this.tableData.push(newLeaveApplication);
        this.leaveForm.reset();
        this.closeCreateButton.nativeElement.click();
      },
      err => {
        console.error('Error saving leave application', err);
      }
    );
  }

  getLeaveTypeName(id: number): string {
    const leaveType = this.leaveTypes.find(type => type.id === id);
    return leaveType ? leaveType.leaveType : 'Unknown';
  }


  ngOnDestroy(): void {
    this.editor.destroy();
    this.editor1.destroy();
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

  setDeleteLeaveApplication(id: number) {
    this.deleteLeaveApplicationId = id;
    console.log('deleteLeaveApplicationId set to : ', this.deleteLeaveApplicationId);
  }

  deleteLeaveApplication() {
    if (!this.deleteLeaveApplicationId) {
      alert("User Id cannot be null");
      return;
    }

    this.hrmApiService.deleteLeaveApplication(this.deleteLeaveApplicationId).subscribe(
      () => {
        this.tableData = this.tableData.filter(user => user.id !== this.deleteLeaveApplicationId);
        this.tableData.forEach((user, index) => user.sNo = index + 1);
        this.serialNumberArray = this.tableData.map((_, index) => index + 1);
        this.dataSource = new MatTableDataSource<LeavesEmployee>(this.tableData);

        this.deleteLeaveApplicationId = null; // Clear input field
        this.closeDeleteButton.nativeElement.click(); // Click the close button
      },
      (error) => {
        console.error('Error:', error);
        alert('Failed to DELETE leave application.');
      }
    );
  }

  openEditModal(id: any, leaveApplication: LeavesEmployee) {
    this.editLeaveApplicationId = id;

    this.editLeaveForm.patchValue({
      employeeId: leaveApplication.employeeId,
      leaveTypeId: leaveApplication.leaveTypeId,
      fromDate: leaveApplication.fromDate ? new Date(leaveApplication.fromDate) : null,
      toDate: leaveApplication.toDate ? new Date(leaveApplication.toDate) : null,
      leaveDuration: leaveApplication.leaveDuration,
      noOfDays: leaveApplication.noOfDays,
      reason: leaveApplication.reason
    });
  }

  editLeave() {
    if (this.editLeaveForm.invalid) return;

    const editLeavePayload = {
      ...this.editLeaveForm.getRawValue(),
      fromDate: this.editLeaveForm.value.fromDate?.toISOString().slice(0, 10),
      toDate: this.editLeaveForm.value.toDate?.toISOString().slice(0, 10),
      restaurantId: this.restaurantId
    };

    this.hrmApiService.updateLeaveApplication(this.editLeaveApplicationId, editLeavePayload).subscribe(
      res => {
        const index = this.tableData.findIndex(d => d.id === this.editLeaveApplicationId);
        if (index !== -1) {
          this.tableData[index] = {
            ...this.tableData[index],
            ...res
          };
          this.dataSource = new MatTableDataSource<LeavesEmployee>(this.tableData);
        }
        this.editLeaveApplicationId = null;
        this.editLeaveForm.reset();
        this.closeEditButton.nativeElement.click();
      },
      err => {
        console.error('Error editing leave application:', err);
      }
    );
  }

}
