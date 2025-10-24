import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartItem extends Product {
  cartQuantity: number;
  discount: number;
}

interface Bill {
  id: number;
  date: string;
  customerName: string;
  customerPhone: string;
  paymentMode: string;
  items: CartItem[];
  total: number;
}

const QUICK_PRODUCTS: Product[] = [
  { id: 2001, name: 'Banarasi Silk Saree', price: 1899.00, quantity: 50 },
  { id: 2002, name: 'Kanchipuram Pure Silk Saree', price: 2499.00, quantity: 30 },
  { id: 2003, name: 'Cotton Printed Saree', price: 799.00, quantity: 100 },
  { id: 2004, name: 'Georgette Party Wear Saree', price: 1299.00, quantity: 40 },
  { id: 3001, name: 'Anarkali Dress', price: 1499.00, quantity: 25 },
  { id: 3002, name: 'Straight Cut Kurti', price: 999.00, quantity: 60 },
  { id: 3003, name: 'Lehenga Choli Set', price: 2999.00, quantity: 20 },
  { id: 3004, name: 'Designer Gown', price: 1999.00, quantity: 35 }
];

@Component({
  selector: 'app-cashier-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cashier-dashboard.component.html',
  styleUrls: ['./cashier-dashboard.component.css']
})
export class CashierDashboardComponent implements OnInit {
  products: Product[] = [...QUICK_PRODUCTS];
  cart: CartItem[] = [];
  barcodeInput = '';
  customerName = '';
  customerPhone = '';
  paymentMode = 'Cash';
  bills: Bill[] = [];
  total = 0;
  currentDate = new Date();

  heldBills: Bill[] = [];
  cashTendered: number = 0;
  changeDue: number = 0;
  quickProducts = QUICK_PRODUCTS;

  constructor() {
    const savedBills = localStorage.getItem('bills');
    if (savedBills) this.bills = JSON.parse(savedBills);

    const savedHeldBills = localStorage.getItem('heldBills');
    if (savedHeldBills) this.heldBills = JSON.parse(savedHeldBills);
  }

  ngOnInit() {
    this.products = [...QUICK_PRODUCTS];
    localStorage.setItem('products', JSON.stringify(this.products));
  }

  updateCartItemDiscount(item: CartItem, newDiscount: number) {
    item.discount = Math.max(0, Math.min(newDiscount, item.price * item.cartQuantity));
    this.calculateTotal();
  }

  removeCartItem(itemToRemove: CartItem) {
    this.cart = this.cart.filter(item => item.id !== itemToRemove.id);
    this.calculateTotal();
  }

  viewBill(bill: Bill) {
    const itemsList = bill.items.map(i => `${i.name} x ${i.cartQuantity}`).join('\n  ');
    alert(`Viewing Bill #${bill.id}\nDate: ${bill.date}\nCustomer: ${bill.customerName}\nPayment: ${bill.paymentMode}\n\nItems:\n  ${itemsList}\n\nGRAND TOTAL: ₹${bill.total.toFixed(2)}`);
  }

  logout() {
    alert('Logging out and clearing session data (simulated).');
    localStorage.clear();
    window.location.reload();
  }

  addProductByBarcode() {
    if (!this.barcodeInput.trim()) return;

    const productId = parseInt(this.barcodeInput.trim(), 10);
    const product = this.products.find(p => p.id === productId);

    if (!product) {
      alert('Product not found!');
      this.barcodeInput = '';
      return;
    }

    const existingCartItem = this.cart.find(c => c.id === product.id);

    if (existingCartItem) {
      if (existingCartItem.cartQuantity + 1 > product.quantity) {
        alert(`Low stock! Only ${product.quantity} left.`);
        this.barcodeInput = '';
        return;
      }
      existingCartItem.cartQuantity++;
    } else {
      if (product.quantity < 1) {
        alert('Low stock! Product out of stock.');
        this.barcodeInput = '';
        return;
      }
      this.cart.push({ ...product, discount: 0, cartQuantity: 1 });
    }

    this.barcodeInput = '';
    this.calculateTotal();
  }

  addQuickProduct(product: Product) {
    this.barcodeInput = product.id.toString();
    this.addProductByBarcode();
  }

  calculateTotal() {
    this.total = this.cart.reduce(
      (sum, item) => sum + item.cartQuantity * (item.price - item.discount),
      0
    );
    this.calculateChange();
  }

  calculateChange() {
    if (this.paymentMode === 'Cash' && this.cashTendered >= this.total) {
      this.changeDue = this.cashTendered - this.total;
    } else {
      this.changeDue = 0;
    }
  }

  holdBill() {
    if (this.cart.length === 0) {
      alert('Cart is empty! Cannot hold an empty bill.');
      return;
    }

    const heldBill: Bill = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      customerName: this.customerName || 'Held Customer',
      customerPhone: this.customerPhone || 'N/A',
      paymentMode: 'Held',
      items: [...this.cart],
      total: this.total,
    };

    this.heldBills.push(heldBill);
    localStorage.setItem('heldBills', JSON.stringify(this.heldBills));

    this.cart = [];
    this.total = 0;
    this.customerName = '';
    this.customerPhone = '';
    this.cashTendered = 0;
    this.changeDue = 0;

    alert(`Bill #${heldBill.id} is held. Serving next customer.`);
  }

  resumeBill(billId: number) {
    if (this.cart.length > 0) {
      if (!confirm('Current cart is not empty. Do you want to discard it and resume the held bill?')) {
        return;
      }
    }

    const index = this.heldBills.findIndex(b => b.id === billId);
    if (index === -1) return;

    const billToResume = this.heldBills[index];

    this.cart = billToResume.items;
    this.customerName = billToResume.customerName === 'Held Customer' ? '' : billToResume.customerName;
    this.customerPhone = billToResume.customerPhone === 'N/A' ? '' : billToResume.customerPhone;
    this.paymentMode = 'Cash';
    this.cashTendered = 0;
    this.changeDue = 0;
    this.calculateTotal();

    this.heldBills.splice(index, 1);
    localStorage.setItem('heldBills', JSON.stringify(this.heldBills));
    alert(`Bill #${billId} resumed.`);
  }

  finalizeBill() {
    if (this.cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    if (this.paymentMode === 'Cash' && this.cashTendered < this.total) {
      alert('Cash tendered is less than the total amount!');
      return;
    }

    this.cart.forEach(item => {
      const product = this.products.find(p => p.id === item.id);
      if (product) product.quantity -= item.cartQuantity;
    });
    localStorage.setItem('products', JSON.stringify(this.products));

    const newBill: Bill = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      customerName: this.customerName || 'Walk-in Customer',
      customerPhone: this.customerPhone || 'N/A',
      paymentMode: this.paymentMode,
      items: [...this.cart],
      total: this.total
    };

    this.bills.push(newBill);
    localStorage.setItem('bills', JSON.stringify(this.bills));

    alert(`Bill #${newBill.id} finalized! Total: ₹${this.total.toFixed(2)} - Change: ₹${this.changeDue.toFixed(2)}`);

    this.cart = [];
    this.total = 0;
    this.customerName = '';
    this.customerPhone = '';
    this.paymentMode = 'Cash';
    this.cashTendered = 0;
    this.changeDue = 0;
  }
  printBill() {
  const now = new Date();
  const formattedDate = now.toLocaleString();
  const invoiceId = 'TGT' + Date.now();

  const itemsTable = this.cart.map(item => `
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px;">${item.id}</td>
      <td style="border: 1px solid #ccc; padding: 8px;">₹${item.price.toFixed(2)}</td>
      <td style="border: 1px solid #ccc; padding: 8px;">${item.cartQuantity} PC</td>
      <td style="border: 1px solid #ccc; padding: 8px;">₹${item.discount.toFixed(2)}</td>
      <td style="border: 1px solid #ccc; padding: 8px;">₹${(item.cartQuantity * item.price - item.discount).toFixed(2)}</td>
    </tr>
    <tr>
      <td colspan="5" style="padding: 8px;">
        Description: ${item.name}<br>
        HSN: 62044290<br>
        Taxable: ₹${((item.cartQuantity * item.price - item.discount) / 1.05).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const taxableAmount = this.total / 1.05;
  const gstAmount = this.total - taxableAmount;
  const sgst = gstAmount / 2;
  const cgst = gstAmount / 2;

  const printContents = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: auto;">
      <h2 style="text-align: center;">T Gopi Textiles</h2>
      <p style="text-align: center;">TGT - Spencer Plaza</p>
      <p style="text-align: center;">Trent Limited</p>
      <p style="text-align: center;">Store Contact Number: NA</p>
      <p style="text-align: center;">Place Of Supply: TGT - Spencer Plaza G-50, Spencer Plaza Anna Salai, Phase II, 769 Coimbatore, 600002</p>
      <p style="text-align: center;">(Regd. Office - Bombay House 24 Home Modi Street, Mumbai - 400001)</p>
      <p style="text-align: center;">GSTIN NO: 33AAACL1838J1ZN</p>
      <hr>
      <h3 style="text-align: center;">TAX INVOICE</h3>
      <p><strong>INVOICE NO:</strong> ${invoiceId}</p>
      <p><strong>DATE:</strong> ${formattedDate}</p>
      <p><strong>COUNTER:</strong> 12</p>
      <p><strong>CASHIER:</strong> TGT-Cashier01</p>
      <p><strong>CUSTOMER ID:</strong> WALK-IN</p>
      <p><strong>MOBILE NO:</strong> ${this.customerPhone || 'N/A'}</p>
      <hr>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr>
            <th style="border: 1px solid #ccc; padding: 8px;">Item Code</th>
            <th style="border: 1px solid #ccc; padding: 8px;">Price</th>
            <th style="border: 1px solid #ccc; padding: 8px;">Qty</th>
            <th style="border: 1px solid #ccc; padding: 8px;">Discount</th>
            <th style="border: 1px solid #ccc; padding: 8px;">Net Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsTable}
        </tbody>
      </table>
      <hr>
      <p><strong>Gross Total:</strong> ₹${this.total.toFixed(2)}</p>
      <p><strong>Total Invoice Amount:</strong> ₹${this.total.toFixed(2)}</p>
      <hr>
      <h4>GST Breakdown</h4>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid #ccc; padding: 6px;">Type</th>
            <th style="border: 1px solid #ccc; padding: 6px;">Taxable Amt</th>
            <th style="border: 1px solid #ccc; padding: 6px;">SGST</th>
            <th style="border: 1px solid #ccc; padding: 6px;">CGST</th>
            <th style="border: 1px solid #ccc; padding: 6px;">CESS</th>
            <th style="border: 1px solid #ccc; padding: 6px;">Total Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #ccc; padding: 6px;">A)</td>
            <td style="border: 1px solid #ccc; padding: 6px;">₹${taxableAmount.toFixed(2)}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">₹${sgst.toFixed(2)}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">₹${cgst.toFixed(2)}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">₹0.00</td>
            <td style="border: 1px solid #ccc; padding: 6px;">₹${this.total.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      <hr>
      <h4>Tender Details</h4>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="border: 1px solid #ccc; padding: 6px;">${this.paymentMode}</td>
          <td style="border: 1px solid #ccc; padding: 6px;">₹${this.cashTendered.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ccc; padding: 6px;">TOTAL RECEIVED AMOUNT</td>
          <td style="border: 1px solid #ccc; padding: 6px;">₹${this.cashTendered.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ccc; padding: 6px;">CHANGE DUE</td>
          <td style="border: 1px solid #ccc; padding: 6px;">₹${this.changeDue.toFixed(2)}</td>
        </tr>
      </table>
      <hr>
      <p><strong>NO OF ITEMS:</strong> ${this.cart.length}</p>
      <p><strong>TOTAL QTY:</strong> ${this.cart.reduce((sum, item) => sum + item.cartQuantity, 0)}</p>
      <hr>
      <h4>Terms & Conditions</h4>
      <ul style="font-size: 13px;">
        <li>All Offers are subject to applicable T&C.</li>
        <li>Please retain the product label to be eligible to return/exchange within 30 days.</li>
        <li>No return/exchange/refund on Women's & Men's Underwear, Watches, Sunglasses, Cosmetics, Accessories.</li>
        <li>Discount includes reduction in applicable GST rate.</li>
        <li>Women's Bras and Men's Vests can be returned/exchanged/refunded.</li>
        <li>Credit will be given for any faulty product.</li>
      </ul>
      <p style="text-align: center; font-weight: bold;">${invoiceId}25</p>
      <p style="text-align: center; font-size: 16px; color: green;">Thank you for shopping with T Gopi Textiles!</p>
    </div>
  `;

  const popupWindow = window.open('', '_blank', 'width=800,height=600');
  if (popupWindow) {
    popupWindow.document.open();
    popupWindow.document.write(`
      <html>
        <head><title>Print Bill</title></head>
        <body onload="window.print(); window.close();">
          ${printContents}
        </body>
      </html>
    `);
    popupWindow.document.close();
  }
}
}