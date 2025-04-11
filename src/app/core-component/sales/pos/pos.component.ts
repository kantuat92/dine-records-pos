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

  showTaxModal: boolean = false;
  availableTaxes: any[] = [];
  selectedTax: any = null;
  pendingItemToAdd: any = null;


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

 
//working code
  handleMenuItemClick1(item: any): void {
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

  handleMenuItemClick(item: any): void {
    this.selectedItem = item;
    this.quantity = 1;
    this.selectedVariant = null;
    this.selectedAddOns = {}; // Reset selected add-ons
    this.itemQuantity = 1; // Reset quantity in modal
    this.cd.detectChanges();
    item.highlight = true;

    const hasVariantsOrAddOns =
      (item.variants && item.variants.length > 0) ||
      (item.addOns && item.addOns.length > 0);
  
    const hasMultipleTaxes = item.taxes && item.taxes.length > 1;
  
    if (!hasVariantsOrAddOns) {
      if (!this.selectedArea && hasMultipleTaxes) {
        // No variants, but has multiple taxes and area is not selected
        this.availableTaxes = item.taxes;
        this.pendingItemToAdd = item;
        this.selectedTax = null;
        // Don't need to trigger modal manually – Bootstrap data-bs-target handles this
        return;
      }
  
      // No variants or add-ons or tax modal needed
      this.addToCart(item, null, []); // add with no variant, no add-ons
    }
  
    // If it has variants or add-ons, modal will show via data-bs-toggle/target
  }
  

//  handleMenuItemClick(item: any) {
//   if (!this.selectedArea) {
//     if (item.taxes && item.taxes.length > 1) {
//       this.availableTaxes = item.taxes;
//       this.pendingItemToAdd = item;
//       this.showTaxModal = true;
//       return;
//     }
//   }
//   this.addToCart(item);
// }

finalizeAddToCart(selectedTaxes: any[]) {
  if (!this.pendingItemToAdd) return;

  const item = { ...this.pendingItemToAdd };
  item.taxes = selectedTaxes;
  this.addToCart(item);
}

  closeDropdown(): void {
    const dropdown = document.getElementById('tableDropdownTrigger');
    if (dropdown) {
      dropdown.setAttribute('aria-expanded', 'false');
      dropdown.classList.remove('show');
      const menu = dropdown.nextElementSibling as HTMLElement;
      if (menu) {
        menu.classList.remove('show');
      }
    }
  }
  resetTaxSelection() {
    this.selectedTax = null;
    this.pendingItemToAdd = null;
    this.showTaxModal = false;
  }

  //working code
  addToCart(item: any, selectedVariant: any = null, selectedAddOns: any[] = []): void {
    const finalItem = selectedVariant ? { ...item, basePrice: parseFloat(selectedVariant.price) } : item;
    const finalVariants = selectedVariant ? [{ variantName: 'Size', selectedOption: selectedVariant.variantName, price: parseFloat(selectedVariant.price) }] : [];

    // Calculate total add-ons price
    const addOnsPrice = selectedAddOns.reduce((sum, addOn) => sum + parseFloat(addOn.price), 0);
    
    // Calculate base price (item price + add-ons price)
    const basePrice = parseFloat(finalItem.basePrice) + addOnsPrice;

    // let applicableTaxes = [];
    // if (this.selectedArea && item.taxes) {
    //   applicableTaxes = item.taxes.filter((tax: any) => {
    //     return tax.areaWiseItemsTaxes.some((areaTax: any) => 
    //       areaTax.menuItemId === item.itemId && 
    //       areaTax.areaIds.includes(this.selectedArea.id)
    //     );
    //   });
    // }
    const originalTaxes = item.taxes || [];
  
    // Determine which taxes to apply initially
    // const appliedTaxes = this.selectedArea 
    //   ? this.getAreaSpecificTaxes(item.itemId, originalTaxes)
    //   : originalTaxes;
      const appliedTaxes = this.getApplicableTaxes(item.itemId, originalTaxes);


    // if (applicableTaxes.length > 0) {
    //   finalItem.taxes = applicableTaxes;
    // }
    // Check if the item already exists in the cart
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
                    totalPrice: (cartItem.quantity + this.quantity) * basePrice,
                    originalTaxes,  // Store all original taxes
                    appliedTaxes    // Store currently applied taxes                    
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
                })),
                originalTaxes,  // Store all original taxes
                appliedTaxes    // Store currently applied taxes
                }
        ];
    }
    this.quantity = 1;
  // this.closeVariantModal();
    this.cd.detectChanges();
  }
  getApplicableTaxes(itemId: number, taxes: any[]): any[] {
    if (!this.selectedArea) {
      return taxes || [];
    }
    
    return (taxes || []).filter(tax => {
      // If tax has no area restrictions, apply it
      if (!tax.areaWiseItemsTaxes || tax.areaWiseItemsTaxes.length === 0) {
        return true;
      }
      
      // Otherwise check if it applies to selected area
      return tax.areaWiseItemsTaxes.some((areaTax: { menuItemId: number; areaIds: string | any[]; }) => 
        areaTax.menuItemId === itemId && 
        areaTax.areaIds.includes(this.selectedArea.id)
      );
    });
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
    this.cart = []; 
    this.selectedArea = null; 
    this.selectedTable = null; 
    this.filteredTables = []; 
  } else {
    // Remove specific item
    this.cart = this.cart.filter(item => item !== this.currentItemToDelete);
  }
}



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

  // calculateTax(): number {
  //  // if (!this.selectedArea) return 0;
  
  //   let totalTax = 0;
  
  //   this.cart.forEach(cartItem => {
  //     if (cartItem.taxes && cartItem.taxes.length > 0) {
  //       cartItem.taxes.forEach((tax: any) => {
  //         // Calculate tax amount based on type (Percent/Fixed)
  //         if (tax.type === 'Percent') {
  //           totalTax += (cartItem.totalPrice * tax.amount) / 100;
  //         } else if (tax.type === 'Fixed') {
  //           totalTax += tax.amount * cartItem.quantity;
  //         }
  //       });
  //     }
  //   });
  
  //   return totalTax;
  // }
  // getTaxDescription(): string {
  //   const uniqueTaxes = new Set<string>();
    
  //   this.cart.forEach(item => {
  //     if (item.taxes && item.taxes.length > 0) {
  //       item.taxes.forEach((tax: { title: any; amount: any; type: string; }) => {
  //         uniqueTaxes.add(`${tax.title} (${tax.amount}${tax.type === 'Percent' ? '%' : '₹'})`);
  //       });
  //     }
  //   });
    
  //   return Array.from(uniqueTaxes).join(' + ');
  // }

  calculateTax(): number {
    return this.cart.reduce((total, item) => {
      const itemTax = (item.appliedTaxes || []).reduce((sum: number, tax: { type: string; amount: number; }) => {
        return sum + (
          tax.type === 'Percent' 
            ? (item.totalPrice * tax.amount) / 100
            : tax.amount * item.quantity
        );
      }, 0);
      return total + itemTax;
    }, 0);
  }
  
  getTaxDescription(): string {
    const taxDescriptions = new Set<string>();
    
    this.cart.forEach(item => {
      (item.appliedTaxes || []).forEach((tax: { title: any; amount: any; type: string; }) => {
        taxDescriptions.add(`${tax.title} (${tax.amount}${tax.type === 'Percent' ? '%' : '₹'})`);
      });
    });
    
    return Array.from(taxDescriptions).join(' + ');
  }

  // getAreaSpecificTaxes(itemId: number, taxes: any[]): any[] {
  //   if (!this.selectedArea || !taxes) return taxes || [];
    
  //   return taxes.filter(tax => {
  //     // Check if tax has area restrictions
  //     if (!tax.areaWiseItemsTaxes || tax.areaWiseItemsTaxes.length === 0) {
  //       return true; // Apply tax if no area restrictions
  //     }
      
  //     return tax.areaWiseItemsTaxes.some((areaTax: { menuItemId: number; areaIds: string | any[]; }) => 
  //       areaTax.menuItemId === itemId && 
  //       areaTax.areaIds.includes(this.selectedArea.id)
  //     );
  //   });
  // }
  getAreaSpecificTaxes(itemId: number, taxes: any[]): any[] {
    if (!this.selectedArea || !taxes) return taxes || [];
    
    return taxes.filter(tax => {
      // If tax has no area restrictions, apply it everywhere
      if (!tax.areaWiseItemsTaxes || tax.areaWiseItemsTaxes.length === 0) {
        return true;
      }
      
      // Otherwise check if it applies to current area
      return tax.areaWiseItemsTaxes.some((areaTax: { menuItemId: number; areaIds: string | any[]; }) => 
        areaTax.menuItemId === itemId && 
        areaTax.areaIds.includes(this.selectedArea.id)
      );
    });
  }
  calculateSubTotal(): number {
    const itemTotal = this.cart.reduce((total, cartItem) => total + cartItem.totalPrice, 0);
    const taxTotal = this.calculateTax();
    return itemTotal + taxTotal;
  }

  calculateItemsTotal(): number {
    return this.cart.reduce((total, cartItem) => total + cartItem.totalPrice, 0);
  }
  
  // getTaxDescription(): string {
  //   //if (!this.selectedArea) return '';
  //   const taxDescriptions: string[] = [];
  //   this.cart.forEach(cartItem => {
  //     if (cartItem.taxes && cartItem.taxes.length > 0) {
  //       cartItem.taxes.forEach((tax: any) => {
  //         const description = `${tax.title} (${tax.amount}${tax.type === 'Percent' ? '%' : '₹'})`;
  //         if (!taxDescriptions.includes(description)) {
  //           taxDescriptions.push(description);
  //         }
  //       });
  //     }
  //   });
  //   return taxDescriptions.join(' + ');
  // }



  // onAreaSelect(area: any): void {
  //   this.selectedArea = area;
    
  //   // Update taxes for all items in cart when area changes
  //   this.cart = this.cart.map(cartItem => {
  //     let applicableTaxes = [];
  //     if (this.menuItems) {
  //       const originalItem = this.menuItems.find((item: { itemId: any; }) => item.itemId === cartItem.itemId);
  //       if (originalItem && originalItem.taxes) {
  //         applicableTaxes = originalItem.taxes.filter((tax: any) => {
  //           return tax.areaWiseItemsTaxes.some((areaTax: any) => 
  //             areaTax.menuItemId === cartItem.itemId && 
  //             areaTax.areaIds.includes(this.selectedArea.id)
  //           );
  //         });
  //       }
  //     }
  //     return {
  //       ...cartItem,
  //       taxes: applicableTaxes
  //     };
  //   });
    
  //   this.cd.detectChanges();
  // }

  onAreaSelect(area: any): void {
    this.selectedArea = area;
    
    // Update taxes for all items in cart based on new area
    // this.cart = this.cart.map(cartItem => {
    //   const appliedTaxes = this.getAreaSpecificTaxes(cartItem.itemId, cartItem.originalTaxes || []);
    //   return {
    //     ...cartItem,
    //     appliedTaxes
    //   };
    // });
    this.updateTaxesForAllItems();

    this.cd.detectChanges();
  }
  updateTaxesForAllItems(): void {
    this.cart = this.cart.map(item => ({
      ...item,
      appliedTaxes: this.getApplicableTaxes(item.itemId, item.originalTaxes)
    }));
    this.cd.detectChanges();
  }

  updateCartTaxes(): void {
    this.cart = this.cart.map(cartItem => {
      const appliedTaxes = this.selectedArea
        ? this.getAreaSpecificTaxes(cartItem.itemId, cartItem.originalTaxes || [])
        : cartItem.originalTaxes || [];
      
      return {
        ...cartItem,
        appliedTaxes
      };
    });
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
