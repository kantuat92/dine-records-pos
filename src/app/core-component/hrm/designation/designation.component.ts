import { Component, ElementRef, ViewChild } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SidebarService, apiResultFormat } from 'src/app/core/core.index';
import { routes } from 'src/app/core/helpers/routes';
import { DataService } from 'src/app/core/service/data/data.service';
import { designation } from 'src/app/shared/model/page.model';
import { PaginationService, pageSelection, tablePageSize } from 'src/app/shared/shared.index';
import { SweetalertService } from 'src/app/shared/sweetalert/sweetalert.service';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { selectRestaurantId } from '../../../core/store/restaurant.selectors';
import { Subscription } from 'rxjs';
import { Department } from 'src/app/core/models/department.model';
import { HrmApiService } from 'src/app/core/service/api-services/hrm-api.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Validators } from 'ngx-editor';

interface data {
  value: string;
}
@Component({
  selector: 'app-designation',
  templateUrl: './designation.component.html',
  styleUrl: './designation.component.scss',
  standalone: false
})
export class DesignationComponent {
  public selectedValue1 = '';
  initChecked = false;
  public selectedValue2 = '';
  public selectedValue3 = '';
  selectedList1: data[] = [
    { value: 'Sort by Datee' },
    { value: 'Newest' },
    { value: 'Oldest' },
  ];
  public routes = routes;

  public tableData: Array<designation> = [];
  // pagination variables
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<designation>;
  public searchDataValue = '';
  //** / pagination variables





  restaurantId: any;
  deleteDesignationId: any | null = null;
  editDesignationId: any;
  private tablePageSizeSub!: Subscription;
  departments: Department[] = [];
  designationForm!: FormGroup;
  editDesignationForm!: FormGroup;
  @ViewChild('closeCreateButton') closeCreateButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('closeEditButton') closeEditButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('closeDeleteButton') closeDeleteButton!: ElementRef<HTMLButtonElement>;




  constructor(
    private data: DataService,
    private pagination: PaginationService,
    private sweetalert: SweetalertService,
    private router: Router,
    private sidebar: SidebarService,
    private store: Store,
    private hrmApiService: HrmApiService,
    private fb: FormBuilder
  ) {

    this.store.select(selectRestaurantId).subscribe(id => {
      console.log('In designation.component.ts Restaurant id from store: ', id);
      this.restaurantId = id;
    });

    this.designationForm = this.fb.group({
      title: ['', Validators.required],
      departmentId: [null, Validators.required],
      status: [true]
    });

    this.editDesignationForm = this.fb.group({      
      title: ['', Validators.required],
      departmentId: [null, Validators.required],
      status: [true]
    });


  }

  ngOnInit() {
    console.log('ngOnInit called in designations');
    this.fetchDepartments();
    this.loadData();

  }



  loadData() {
    if (this.tablePageSizeSub) {
      this.tablePageSizeSub.unsubscribe();
    }
    this.tablePageSizeSub = this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
      console.log('In tablePageSize subscribe, designations');
      if (this.router.url == this.routes.designation) {
        this.getTableData({ skip: res.skip, limit: res.limit });
        this.pageSize = res.pageSize;
      }
    });

    this.searchDataValue = '';
  }


  fetchDepartments() {
    console.log('restaurantId: ', this.restaurantId);
    this.hrmApiService.getDepartments(this.restaurantId).subscribe(
      (response) => {        
        this.departments = response;
      },
      (error) => {
        console.error('Error fetching departments:', error);
      }
    );
  }


  onSubmit(): void {    
    if (this.designationForm.invalid) return;

    const payload = this.designationForm.value;

    this.hrmApiService.createDesignation(payload).subscribe(
      response => {
        const newDesignation = {
          ...response,
          sNo: this.tableData.length + 1
        }
        this.tableData.push(newDesignation);
        this.designationForm.reset({ status: true });
        this.closeCreateButton.nativeElement.click();
      },
      err => {
        console.error('Error saving designation', err);
      }
    );
  }

  openEditModal(id: any, designation: designation) {
    this.editDesignationId = id;
    this.editDesignationForm.patchValue({      
      title: designation.title,
      departmentId: designation.departmentId,
      status: designation.status,
    });    
  }

  onUpdateDesignation() {    
    if (this.editDesignationForm.invalid) return;

    const updatedDesignation = this.editDesignationForm.value;

    this.hrmApiService.updateDesignatoin(this.editDesignationId, updatedDesignation).subscribe(
      res => {        
        const index = this.tableData.findIndex(d => d.id === this.editDesignationId);                
        if (index !== -1) {
          this.tableData[index] = {
            ...this.tableData[index],
            ...res
          };
          this.dataSource = new MatTableDataSource<designation>(this.tableData);          
        }
        this.editDesignationId = null;
        this.editDesignationForm.reset();
        this.editDesignationForm.patchValue({ status: true });
        this.closeEditButton.nativeElement.click();
      },
      err => {
        console.error('Error updating designation:', err);
      }
    );
  }



  setDeleteDesignationId(id: any) {
    this.deleteDesignationId = id;
    console.log('deleteDesignationId set to : ', this.deleteDesignationId);
  }

  deleteDesignation(): void {

    if (!this.deleteDesignationId) {
      alert("deleteDesignationId cannot be null");
      return;
    }

    this.hrmApiService.deleteDesignation(this.deleteDesignationId).subscribe(
      () => {
        this.tableData = this.tableData.filter(designation => designation.id !== this.deleteDesignationId);
        this.tableData.forEach((designation, index) => designation.sNo = index + 1);
        this.serialNumberArray = this.tableData.map((_, index) => index + 1);
        this.dataSource = new MatTableDataSource<designation>(this.tableData);

        this.deleteDesignationId = null;
        this.closeDeleteButton.nativeElement.click();
      },
      (error) => {
        console.error('Error:', error);
        alert('Failed to DELETE designation.');
      }
    );
  }


  ngOnDestroy() {
    console.log('ngOnDestroy called in designations.');
    if (this.tablePageSizeSub) {
      this.tablePageSizeSub.unsubscribe();
    }
  }











  private getTableData(pageOption: pageSelection): void {
    this.hrmApiService.getDesignations(this.restaurantId).subscribe((apiRes: apiResultFormat) => {
      this.tableData = [];
      this.serialNumberArray = [];
      this.totalData = apiRes.totalData;
      apiRes.data.map((res: designation, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          res.sNo = serialNumber;
          this.tableData.push(res);
          this.serialNumberArray.push(serialNumber);
        }
      });
      this.dataSource = new MatTableDataSource<designation>(this.tableData);
      this.pagination.calculatePageSize.next({
        totalData: this.totalData,
        pageSize: this.pageSize,
        tableData: this.tableData,
        serialNumberArray: this.serialNumberArray,
      });
    });
  }
  deleteBtn() {
    this.sweetalert.deleteBtn();
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

  selectedList2: data[] = [
    { value: 'Choose Designation' },
    { value: 'UI/UX' },
    { value: 'HR' },
    { value: 'Admin' },
    { value: 'Engineering' },
  ];
  selectedList3: data[] = [
    { value: 'Choose HOD' },
    { value: 'Mitchum Daniel' },
    { value: 'Susan Lopez' },
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
