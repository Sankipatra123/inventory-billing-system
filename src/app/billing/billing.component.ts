import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css']
})
export class BillingComponent {
  products: any[] = JSON.parse(localStorage.getItem('products') || '[]');
  total = 0;

  calculateTotal() {
    this.total = this.products.reduce((sum, item) => sum + item.price, 0);
  }

  clearBilling() {
    this.total = 0;
  }
}
