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
  @ViewChild('variantModal') variantModal: ElementRef | undefined;

  
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
  quantity: number = 1;
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
  itemQuantity: number = 1;
  filteredCategories: any = [];
  orderType = 'baseMenu';
  selectedItem: any;
  selectedVariant: any; 
  selectedVariantOptions: { [key: string]: { optionName: string; price: number } } = {};
  selectedAddOns: { [id: number]: any } = {}; 
  currentItemToDelete: any = null;
  isClearingAll: boolean = false;
  showOnlyFavorites: boolean = false;
  originalMenuItems: any[] = [];

  showTableDropdown = false;
  areas: any[] = [];
  tables: any[] = [];
  selectedArea: any = null;
  selectedTable: any = null;
  filteredTables: any[] = [];

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
        this.loadAreasAndTables();

        }
        else {
        this.errorMessage = 'No restaurant ID found.';
      }
    });
  }

 

  handleMenuItemClick(item: any): void {
    this.selectedItem = item;
    this.quantity = 1;
    this.selectedVariant = null;
    this.selectedAddOns = {}; // Reset selected add-ons
    this.itemQuantity = 1; // Reset quantity in modal
    this.cd.detectChanges();
    const hasVariantsOrAddOns = (item.variants && item.variants.length > 0) || (item.addOns && item.addOns.length > 0);
    if (!hasVariantsOrAddOns) {
      this.addToCart(item, null, []); // Call addToCart with empty addOns array
    }
  }



//deepseek code
addToCart(item: any, selectedVariant: any = null, selectedAddOns: any[] = []): void {
  const finalItem = selectedVariant ? { ...item, basePrice: parseFloat(selectedVariant.price) } : item;
  const finalVariants = selectedVariant ? [{ variantName: 'Size', selectedOption: selectedVariant.variantName, price: parseFloat(selectedVariant.price) }] : [];

  // Calculate total add-ons price
  const addOnsPrice = selectedAddOns.reduce((sum, addOn) => sum + parseFloat(addOn.price), 0);
  
  // Calculate base price (item price + add-ons price)
  const basePrice = parseFloat(finalItem.basePrice) + addOnsPrice;

  const existingItemIndex = this.cart.findIndex(
      cartItem =>
          cartItem.itemId === finalItem.itemId &&
          this.areVariantsEqual(cartItem.variants, finalVariants) &&
          this.areAddOnsEqual(cartItem.addOns, selectedAddOns)
  );

  if (existingItemIndex >= 0) {
      this.cart = this.cart.map((cartItem, index) =>
          index === existingItemIndex
              ? {
                  ...cartItem,
                  quantity: cartItem.quantity + this.quantity,
                  totalPrice: (cartItem.quantity + this.quantity) * basePrice
              }
              : cartItem
      );
  } else {
      this.cart = [
          ...this.cart,
          {
              itemId: finalItem.itemId,
              itemName: finalItem.itemName,
              price: basePrice,
              quantity: this.quantity,
              totalPrice: basePrice * this.quantity,
              variants: finalVariants,
              addOns: selectedAddOns.map(addOn => ({
                  id: addOn.id,
                  name: addOn.name,
                  price: parseFloat(addOn.price)
              }))
          }
      ];
  }
  this.quantity = 1;
 // this.closeVariantModal();
  this.cd.detectChanges();
}

// Add this to your component class
getCurrentTotal(): number {
  if (!this.selectedItem) return 0;
  
  const basePrice = this.selectedVariant 
    ? parseFloat(this.selectedVariant.price) 
    : parseFloat(this.selectedItem.basePrice);
    
  const addOnsTotal = Object.values(this.selectedAddOns)
    .reduce((sum, addOn) => sum + parseFloat(addOn.price), 0);
    
  return (basePrice + addOnsTotal) * this.quantity;
}

isItemInCart(): boolean {
  if (!this.selectedItem) return false;
  
  const finalVariants = this.selectedVariant 
    ? [{ variantName: 'Size', selectedOption: this.selectedVariant.variantName, price: parseFloat(this.selectedVariant.price) }] 
    : [];
    
  const selectedAddOnArray = Object.values(this.selectedAddOns);
  
  return this.cart.some(
    item => 
      item.itemId === this.selectedItem.itemId &&
      this.areVariantsEqual(item.variants, finalVariants) &&
      this.areAddOnsEqual(item.addOns, selectedAddOnArray)
  );
}
addToCart1(item: any, selectedVariant: any = null, selectedAddOnsArray: any[] = []): void {
  let finalPrice = item.basePrice;
  const finalVariants = selectedVariant ? [{ variantName: 'Size', selectedOption: selectedVariant.variantName, price: parseFloat(selectedVariant.price) }] : [];
  const finalAddOns = selectedAddOnsArray.map(addOn => ({ id: addOn.id, name: addOn.name, price: addOn.price }));

  if (selectedVariant) {
      finalPrice = parseFloat(selectedVariant.price);
  }
  finalPrice += selectedAddOnsArray.reduce((sum, addOn) => sum + addOn.price, 0);

  const existingItemIndex = this.cart.findIndex(
      cartItem =>
          cartItem.itemId === item.itemId &&
          this.areVariantsEqual(cartItem.variants, finalVariants) &&
          this.areAddOnsEqual(cartItem.addOns, finalAddOns)
  );

  if (existingItemIndex >= 0) {
      this.cart = this.cart.map((cartItem, index) =>
          index === existingItemIndex
              ? {
                  ...cartItem,
                  quantity: cartItem.quantity + this.quantity,
                  totalPrice: (cartItem.quantity + this.quantity) * cartItem.price
              }
              : cartItem
      );
  } else {
      this.cart = [
          ...this.cart,
          {
              itemId: item.itemId,
              itemName: item.itemName,
              price: finalPrice, // Use the calculated finalPrice
              quantity: this.quantity,
              totalPrice: finalPrice * this.quantity,
              variants: finalVariants,
              addOns: finalAddOns
          }
      ];
  }
  this.quantity = 1;
//  this.closeVariantModal();
  this.cd.detectChanges();
}

  areVariantsEqual(variants1: any[], variants2: any[]): boolean {
    if (!variants1 && !variants2) return true;
    if (!variants1 || !variants2 || variants1.length !== variants2.length) return false;
    for (const v1 of variants1) {
      const found = variants2.find(v2 => v1.variantName === v2.variantName && v1.selectedOption === v2.selectedOption);
      if (!found) return false;
    }
    return true;
  }
  areAddOnsEqual(addOns1: any[], addOns2: any[]): boolean {
    if (!addOns1 && !addOns2) return true;
    if (!addOns1 || !addOns2 || addOns1.length !== addOns2.length) return false;
    // Compare based on ID to handle potential order differences
    const sortedAddOns1 = [...addOns1].sort((a, b) => a.id - b.id);
    const sortedAddOns2 = [...addOns2].sort((a, b) => a.id - b.id);
    for (let i = 0; i < sortedAddOns1.length; i++) {
      if (sortedAddOns1[i].id !== sortedAddOns2[i].id) {
        return false;
      }
    }
    return true;
  }
  selectVariantOption(variant: any, option: any): void {
    this.selectedVariantOptions[variant.variantName] = { optionName: option.optionName, price: option.price };
  }


selectVariant(variant: any): void {
  this.selectedVariant = variant;
}

addVariantToCartFinal(): void {
  if (this.selectedItem) {
    const selectedAddOnArray = Object.values(this.selectedAddOns);
    this.addToCart(this.selectedItem, this.selectedVariant, selectedAddOnArray);
    }
}

// closeModal(): void {
//   console.log('closeModal called');
//   if (this.variantModal) {
//     const modalElement = this.variantModal.nativeElement;
//     const modalInstance = bootstrap.Modal.getInstance(modalElement);
//     console.log('Modal Instance:', modalInstance);
//     if (modalInstance) {
//       modalInstance.hide();
//       console.log('modalInstance.hide() called');
//     }
//   }
// }
// closeModal() {
//   if (this.variantModal) {
//     const modalElement = this.variantModal.nativeElement;
//     const modalInstance = new bootstrap.Modal(modalElement); // Initialize Bootstrap modal
//     modalInstance.hide(); // Hide the modal
//   }
// }

toggleAddOn(addOn: any): void {
  if (this.selectedAddOns[addOn.id]) {
    delete this.selectedAddOns[addOn.id];
  } else {
    this.selectedAddOns[addOn.id] = addOn;
  }
}

clearCart(): void {
  this.cart = [];
  this.cd.detectChanges();
}

deleteCartItem(itemToDelete: any): void {
  this.cart = this.cart.filter(item => item !== itemToDelete);
  this.cd.detectChanges();
}

prepareClearAll(): void {
  this.isClearingAll = true;
  this.currentItemToDelete = null;
}

prepareDeleteItem(item: any): void {
  this.isClearingAll = false;
  this.currentItemToDelete = item;
}

confirmDeletion(): void {
  if (this.isClearingAll) {
    this.cart = []; // Clear all items
  } else {
    // Remove specific item
    this.cart = this.cart.filter(item => item !== this.currentItemToDelete);
  }
  // No need to manually close modal - Bootstrap handles it via data-bs-dismiss
}

// closeVariantModal(): void {
//   this.selectedItem = null;
//   this.selectedVariantOptions = {};
//   this.selectedVariant = null;
//   this.selectedAddOns = {};
//   this.itemQuantity = 1;
//   this.cd.detectChanges();
// }
// resetModalState(): void {
//   this.quantity = 1;
//   this.selectedVariant = null;
//   this.selectedAddOns = {};
//   this.cd.detectChanges(); 
// }
//working 
// changeQuantity(change: number): void {
//     this.itemQuantity = Math.max(1, this.itemQuantity + change); // Ensure minimum quantity is 1
//   }

  // Modify your changeQuantity method to handle the event
// changeQuantity(newQuantity: number): void {
//   this.quantity = Math.max(1, newQuantity); // Ensure minimum quantity is 1
//   this.cd.detectChanges();
// }

changeQuantity(change: number): void {
  const newQuantity = this.quantity + change;
  this.quantity = Math.max(1, newQuantity);
  this.cd.detectChanges();
  console.log('Current quantity:', this.quantity);
}

  selectedVariantOptionsValid(): boolean {
    if (!this.selectedItem?.variants) {
        return true; // No variants, so it's valid
    }
    for (const variant of this.selectedItem.variants) {
        if (!this.selectedVariantOptions[variant.variantName]) {
            return false; // A variant doesn't have an option selected
        }
    }
    return true;
  }
  
  addVariantToCart(): void {
    if (this.selectedItem && this.selectedVariantOptionsValid()) {
        const selectedVariants: any[] = [];
        for (const variantName in this.selectedVariantOptions) {
            if (this.selectedVariantOptions.hasOwnProperty(variantName)) {
                const option = this.selectedVariantOptions[variantName];
                const variantData = this.selectedItem.variants.find((v: any) => v.variantName === variantName);
                selectedVariants.push({ variantName: variantName, selectedOption: option.optionName, price: option.price });
            }
        }
        this.addToCart(this.selectedItem, selectedVariants);
    }
  }

 
  updateQuantity(cartItem: any, newQuantity: number): void {
    this.cart = this.cart.map(item => {
        if (item.itemId === cartItem.itemId && this.areVariantsEqual(item.variants, cartItem.variants)) {
            return {
                ...item,
                quantity: newQuantity,
                totalPrice: newQuantity * item.price
            };
        }
        return item;
    });
    this.cd.detectChanges();
  }

  updateQuantitycurrent(cartItem: any, newQuantity: number): void {
    cartItem.quantity = newQuantity;
    cartItem.totalPrice = (cartItem.price + (cartItem.addOns || []).reduce((sum: number, addOn: { price: string; }) => sum + parseFloat(addOn.price), 0)) * newQuantity;
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
    //this.showOnlyFavorites = false; 
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
    this.originalMenuItems = [...this.menuItems]; 

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

showFavorites(): void {
  this.showOnlyFavorites = !this.showOnlyFavorites;
  
  if (this.showOnlyFavorites) {
    this.menuItems = this.originalMenuItems.filter(item => item.setAsFavorite === "true");
  } else {
    this.menuItems = [...this.originalMenuItems];
  }
  
  // Reset tab states if needed
  this.istab = true;
  this.selectedCategory = null;
}


toggleTableDropdown(): void {
  this.showTableDropdown = !this.showTableDropdown;
  if (this.showTableDropdown && !this.areas.length) {
    this.loadAreasAndTables();
  }
}

// Load data
loadAreasAndTables(): void {
  this.menuApiService.getAreasByRestaurantId(this.restaurantId).subscribe(areas => {
    this.areas = areas;
  });
  
  this.menuApiService.getTablesByRestaurantId(this.restaurantId).subscribe(tables => {
    this.tables = tables;
  });
}

// Select area
selectArea(area: any): void {
  this.selectedArea = area;
  this.filteredTables = this.tables.filter(table => 
    area.tableIds.includes(table.id)
  );
}

// Select table
selectTable(table: any): void {
  this.selectedTable = table;
  this.showTableDropdown = false;
  // You can emit an event or store the selected table as needed
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
