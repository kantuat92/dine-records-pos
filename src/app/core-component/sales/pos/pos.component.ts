import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, Renderer2, ViewChild } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { DataService, SidebarService, apiResultFormat, pageSelection } from 'src/app/core/core.index';
import { routes } from 'src/app/core/helpers/routes';
import { MenuApiService } from 'src/app/core/service/api-services/menu-api.service';
import { pospurchase } from 'src/app/shared/model/page.model';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import { Store } from '@ngrx/store';
import { selectRestaurantId } from '../../../core/store/restaurant.selectors';


import Swal from 'sweetalert2';
interface data {
  value: string;
}

@Component({
    selector: 'app-pos',
    templateUrl: './pos.component.html',
    styleUrl: './pos.component.scss',
    standalone: false
})
export class PosComponent implements AfterViewInit {

  @ViewChild('menuSection', { static: false }) menuSection: ElementRef | undefined;

  
  istab=true;
  istab2=false;
  istab3=false;
  istab4=false;
  istab5=false;
  istab6=false;
  istab7=false;

  posCategories5: OwlOptions = {
    items: 6,
			loop:false,
			margin:0,
			nav:false,
			dots: false,
			autoplay:false,
			smartSpeed: 1000,
			animateOut: "slideOutUp",
			animateIn: "slideIntUp",
      
			responsive:{
				0:{
					items:1
				},
				500:{
					items:3
				},
				768:{
					items:4
				},
				991:{
					items:5
				},
				1200:{
					items:6
				}
			}
  };
  quantity: number = 4;
  increment() {
    this.quantity++;
  }

  decrement() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  public routes = routes;
  // pagination variables
  public tableData: Array<pospurchase> = [];
  public tableData2: Array<pospurchase> = [];
  public tableData3: Array<pospurchase> = [];


  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<pospurchase>;
  public searchDataValue = '';
  //** / pagination variables
  restaurantId: string | null = null;
  errorMessage = '';
  cart: any[] = [];
  selectedCategory: any = null;
  menuItems: any = [];
  categories: any = [];
  filteredCategories: any = [];
  orderType = 'baseMenu';
  selectedItem: any;
  selectedVariant: any; 

  constructor(
    private data: DataService,
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService,
    private renderer: Renderer2, private el: ElementRef,
    private menuApiService: MenuApiService, private store: Store, private cd: ChangeDetectorRef
  ) {
    this.data.getPosPurchase().subscribe((apiRes: apiResultFormat) => {
      this.totalData = apiRes.totalData;
      this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        if (this.router.url == this.routes.pos) {
          this.getTableData({ skip: res.skip, limit: this.totalData  });
          this.pageSize = res.pageSize;
        }
      });
    });
    this.data.getPosPurchase().subscribe((apiRes: apiResultFormat) => {
      this.totalData = apiRes.totalData;
      this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        if (this.router.url == this.routes.pos) {
          this.getTableData2({ skip: res.skip, limit: this.totalData  });
          this.pageSize = res.pageSize;
        }
      });
    });
    this.data.getPosPurchase().subscribe((apiRes: apiResultFormat) => {
      this.totalData = apiRes.totalData;
      this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        if (this.router.url == this.routes.pos) {
          this.getTableData3({ skip: res.skip, limit: this.totalData  });
          this.pageSize = res.pageSize;
        }
      });
    });
  }

  ngOnInit(): void {
    // Fetch the restaurantId from NgRx store
    this.store.select(selectRestaurantId).subscribe(id => {
      this.restaurantId = '16';
      console.log(id);
      if (this.restaurantId) {
        this.getCategories(this.restaurantId);
        this.loadAllMenuItems();
      } else {
        this.errorMessage = 'No restaurant ID found.';
      }
    });
  }

  // addToCart(item: any): void {
  //   const existingItemIndex = this.cart.findIndex(cartItem => cartItem.itemId === item.itemId);
  //   if (existingItemIndex >= 0) {
  //     this.cart = this.cart.map((cartItem, index) => {
  //       if (index === existingItemIndex) {
  //         return {
  //           ...cartItem,
  //           quantity: cartItem.quantity + 1,
  //           totalPrice: (cartItem.quantity + 1) * cartItem.price
  //         };
  //       }
  //       return cartItem;
  //     });
  //   } else {
  //     this.cart = [...this.cart, {
  //       itemId: item.itemId,
  //       itemName: item.itemName,
  //       price: item.basePrice,
  //       quantity: 1,
  //       totalPrice: item.basePrice
  //     }];
  //   }
  // }

  addToCart(item: any): void {
    if (item.variants && item.variants.length > 0) {
      this.selectedItem = item;
      this.selectedVariant = null; 
      this.quantity = 1;
    } else {
      // If no variants, directly add the item to the cart
      const existingItemIndex = this.cart.findIndex(cartItem => cartItem.itemId === item.itemId);
  
      if (existingItemIndex >= 0) {
        // If the item is already in the cart, increment the quantity and update total price
        this.cart = this.cart.map((cartItem, index) => {
          if (index === existingItemIndex) {
            return {
              ...cartItem,
              quantity: cartItem.quantity + 1,
              totalPrice: (cartItem.quantity + 1) * cartItem.price
            };
          }
          return cartItem;
        });
      } else {
        // If the item is not found, add it to the cart with quantity 1
        this.cart = [...this.cart, {
          itemId: item.itemId,
          itemName: item.itemName,
          price: item.basePrice,
          quantity: 1,
          totalPrice: item.basePrice
        }];
      }
    }
  }
  
 
  changeQuantity(change: number): void {
    this.quantity = Math.max(1, this.quantity + change); // Ensure minimum quantity is 1
  }
  addVariantToCart(): void {
    if (this.selectedItem && this.selectedVariant) {
      const existingItemIndex = this.cart.findIndex(cartItem => cartItem.itemId === this.selectedItem.itemId);

      if (existingItemIndex >= 0) {
        // If item already in cart, update quantity and price
        this.cart[existingItemIndex].quantity += 1;
        this.cart[existingItemIndex].totalPrice = this.cart[existingItemIndex].quantity * this.cart[existingItemIndex].price;
      } else {
        // If item is not in the cart, add with selected variant price
        this.cart.push({
          itemId: this.selectedItem.itemId,
          itemName: this.selectedItem.itemName,
          price: this.selectedVariant.price,
          quantity: 1,
          totalPrice: this.selectedVariant.price
        });
      }
      this.closeModal();

    }
  }

  closeModal(): void {
    this.selectedItem = null;  // Reset selected item
    this.selectedVariant = null;  // Reset selected variant
  }

  updateQuantity(cartItem: any, newQuantity: number): void {
    const existingItemIndex = this.cart.findIndex(item => item.itemId === cartItem.itemId);
    if (existingItemIndex >= 0) {
      // Prevent setting quantity to 0
      if (newQuantity > 0) {
        this.cart[existingItemIndex].quantity = newQuantity;
        this.cart[existingItemIndex].totalPrice = this.cart[existingItemIndex].quantity * this.cart[existingItemIndex].price;
      }
    }
  }

  getCategories(restaurantId: string): void {
    this.menuApiService.getCategories(restaurantId).subscribe(
      response => {
        // Filter out categories with status false
        this.categories = response.filter(category => category.status === true);
        this.filteredCategories = this.categories;
        if (this.categories.length > 0) {
          this.getMenuItemOnCategories(this.categories[0]);
        }
        this.cd.detectChanges();
      },
      error => {
        this.errorMessage = 'Error fetching categories.';
        console.error('Error fetching categories:', error);
      }
    );
  }
  
  openTab(): void {
    this.istab=true;
    this.loadAllMenuItems(); 
    this.selectedCategory = null;// Load all items when "All" is clicked
  }
  getMenuItemOnCategories(category: any) {
    console.log('order type: ' + this.orderType);
     this.selectedCategory = category;
    // this.toastService.showLoader();
    this.menuApiService.getMenuItemOnCategories(this.restaurantId, category.categoryId, this.orderType).subscribe(
      (response: any) => {
        this.menuItems = response.content || []; // Assuming 'content' contains the menu items
        this.menuItems = this.menuItems.map((item: any) => ({
          ...item,
          isChecked: false,
        }));
        this.cd.detectChanges();
        this.scrollToMenuItems();
      }, (error) => {
    this.menuItems = [];
    this.cd.detectChanges();
    //this.toastService.hideLoader();
  })
}

loadAllMenuItems(): void {
  this.menuApiService.getMenuItems(this.restaurantId).subscribe((response: any) => {
    this.menuItems = response || [];
    // Add default checked state to each menu item
    this.menuItems = this.menuItems.map((item: any) => ({
      ...item,
      isChecked: false,
    }));
    this.cd.detectChanges();
    this.scrollToMenuItems();
  }, (error) => {
    this.menuItems = [];
    this.cd.detectChanges();
    console.error('Error fetching all menu items:', error);
  });
}

scrollToMenuItems(): void {
  // Scroll to the menu items container smoothly
  if (this.menuSection) {
    this.menuSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }
}

  private getTableData(pageOption: pageSelection): void {
    this.data.getPosPurchase().subscribe((apiRes: apiResultFormat) => {
      this.tableData = [];
      this.serialNumberArray = [];
      this.totalData = apiRes.totalData;
      apiRes.data.map((res: pospurchase, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          res.sNo = serialNumber;
          this.tableData.push(res);
          this.serialNumberArray.push(serialNumber);
        }
      });
      this.dataSource = new MatTableDataSource<pospurchase>(this.tableData);
      this.pagination.calculatePageSize.next({
        totalData: this.totalData,
        pageSize: this.pageSize,
        tableData: this.tableData,
        serialNumberArray: this.serialNumberArray,
      });
    });
  }
  private getTableData2(pageOption: pageSelection): void {
    this.data.getPosPurchase().subscribe((apiRes: apiResultFormat) => {
      this.tableData2 = [];
      this.serialNumberArray = [];
      this.totalData = apiRes.totalData;
      apiRes.data.map((res: pospurchase, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          res.sNo = serialNumber;
          this.tableData2.push(res);
          this.serialNumberArray.push(serialNumber);
        }
      });
      this.dataSource = new MatTableDataSource<pospurchase>(this.tableData2);
      this.pagination.calculatePageSize.next({
        totalData: this.totalData,
        pageSize: this.pageSize,
        tableData2: this.tableData2,
        serialNumberArray: this.serialNumberArray,
        tableData: []
      });
    });
  }
  private getTableData3(pageOption: pageSelection): void {
    this.data.getPosPurchase().subscribe((apiRes: apiResultFormat) => {
      this.tableData3 = [];
      this.serialNumberArray = [];
      this.totalData = apiRes.totalData;
      apiRes.data.map((res: pospurchase, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          res.sNo = serialNumber;
          this.tableData3.push(res);
          this.serialNumberArray.push(serialNumber);
        }
      });
      this.dataSource = new MatTableDataSource<pospurchase>(this.tableData2);
      this.pagination.calculatePageSize.next({
        totalData: this.totalData,
        pageSize: this.pageSize,
        tableData2: this.tableData3,
        serialNumberArray: this.serialNumberArray,
        tableData: []
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

  // public ngAfterViewInit(): void {
  //   window.dispatchEvent(new Event('resize'));
  // }
  // openTab():void{
  //   this.istab=true;
  //   this.istab2=false;
  //   this.istab3=false;
  //   this.istab4=false;
  //   this.istab5=false;
  //   this.istab6=false;
  //   this.istab7=false;
  // }
  openTab2():void{
    this.istab2=true;
    this.istab=false;
    this.istab3=false;
    this.istab4=false;
    this.istab5=false;
    this.istab6=false;
    this.istab7=false;


  }
  openTab3():void{
    this.istab3=true;
    this.istab=false;
    this.istab2=false;
    this.istab4=false;
    this.istab5=false;
    this.istab6=false;
    this.istab7=false;
  }
  openTab4():void{
    this.istab4=true;
    this.istab=false;
    this.istab3=false;
    this.istab2=false;
    this.istab5=false;
    this.istab6=false;
    this.istab7=false;
  }
  openTab5():void{
    this.istab5=true;
    this.istab=false;
    this.istab3=false;
    this.istab4=false;
    this.istab2=false;
    this.istab6=false;
    this.istab7=false;
  }
  openTab6():void{
    this.istab6=true;
    this.istab=false;
    this.istab3=false;
    this.istab4=false;
    this.istab5=false;
    this.istab2=false;
    this.istab7=false;
  }
  openTab7():void{
    this.istab7=true;
    this.istab=false;
    this.istab3=false;
    this.istab4=false;
    this.istab5=false;
    this.istab2=false;
    this.istab6=false;
  }

  
  ngAfterViewInit(): void {
    const divElements: HTMLElement[] = Array.from(this.el.nativeElement.querySelectorAll('.product-info.card'));
  const productList: HTMLElement | null = this.el.nativeElement.querySelector('.product-list.border-0.p-0');
  const productList2: HTMLElement | null = this.el.nativeElement.querySelector('.empty-cart');

    const checkActiveElements = () => {
      const hasActive = divElements.some((el: HTMLElement) => el.classList.contains('active'));
      if (productList) {
        this.renderer.setStyle(productList, 'display', hasActive ? 'block' : 'none');
        if(productList2){
          this.renderer.setStyle(productList2, 'display',hasActive?'none':'flex')
        }
      }
    };
    divElements.forEach((divElement: HTMLElement) => {
      this.renderer.listen(divElement, 'click', () => {
        if (divElement.classList.contains('active')) {
          this.renderer.removeClass(divElement, 'active');
        } else {
          this.renderer.addClass(divElement, 'active');
        }
        checkActiveElements();
      });
    });
    checkActiveElements();
  }

}
