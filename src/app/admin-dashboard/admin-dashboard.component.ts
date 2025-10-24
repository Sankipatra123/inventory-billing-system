import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
  products: Product[] = [];
  cashiers: string[] = [];
  newProduct: Product = { id: 0, name: '', price: 0, quantity: 0 };
  editMode = false;
  selectedProduct: Product | null = null;
  newCashier = '';

  constructor(private router: Router) {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) this.products = JSON.parse(savedProducts);
    const savedCashiers = localStorage.getItem('cashiers');
    if (savedCashiers) this.cashiers = JSON.parse(savedCashiers);
  }

  saveToLocal() {
    localStorage.setItem('products', JSON.stringify(this.products));
    localStorage.setItem('cashiers', JSON.stringify(this.cashiers));
  }

  addProduct() {
    if (!this.newProduct.name || this.newProduct.price <= 0) {
      alert('Enter valid details!');
      return;
    }
    this.newProduct.id = Date.now();
    this.products.push({ ...this.newProduct });
    this.newProduct = { id: 0, name: '', price: 0, quantity: 0 };
    this.saveToLocal();
  }

  deleteProduct(id: number) {
    this.products = this.products.filter(p => p.id !== id);
    this.saveToLocal();
  }

  editProduct(p: Product) {
    this.editMode = true;
    this.selectedProduct = { ...p };
  }

  updateProduct() {
    if (!this.selectedProduct) return;
    const index = this.products.findIndex(p => p.id === this.selectedProduct!.id);
    if (index !== -1) this.products[index] = this.selectedProduct!;
    this.editMode = false;
    this.selectedProduct = null;
    this.saveToLocal();
  }

  addCashier(name: string) {
    if (!name.trim()) return;
    this.cashiers.push(name.trim());
    this.saveToLocal();
  }

  deleteCashier(name: string) {
    this.cashiers = this.cashiers.filter(c => c !== name);
    this.saveToLocal();
  }

  clearAll() {
    localStorage.clear();
    this.products = [];
    this.cashiers = [];
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
