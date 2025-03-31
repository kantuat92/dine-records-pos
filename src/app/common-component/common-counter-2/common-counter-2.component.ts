import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-common-counter-2',
  standalone:false,
  templateUrl: './common-counter-2.component.html',
  styleUrl: './common-counter-2.component.scss'
})
export class CommonCounter2Component {
@Input() value: number = 1; // Default value if not provided
  @Output() quantityChange = new EventEmitter<number>();
  quantity: number = 1; // Default quantity


  ngOnInit(): void {
    this.quantity = this.value; // Set quantity from value input
  }
  incrementQuantity(): void {
    if (this.quantity < 100) {
      this.quantity += 1;
      this.quantityChange.emit(this.quantity);  // Emit updated quantity
    }
  }

  // Decrement the quantity, but not below 0
  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity -= 1;
      this.quantityChange.emit(this.quantity);  // Emit updated quantity
    }
  }

  validateQuantity(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;

    // Check if the input is a valid number
    if (!/^\d*$/.test(inputValue)) {
      this.quantity = 0; // Reset to 0 if invalid
    } else {
      this.quantity = Number(inputValue); // Convert valid input to a number
    }
    this.quantityChange.emit(this.quantity); // Emit updated quantity
  }

}
