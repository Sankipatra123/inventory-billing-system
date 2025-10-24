import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  selectedRole: string | null = '';
  userId = '';
  password = '';

  constructor(private router: Router) {}

  selectRole(role: string) {
    this.selectedRole = role;
  }

  login() {
    if (this.userId === 'admin' && this.password === '1234' && this.selectedRole === 'admin') {
      this.router.navigate(['/admin-dashboard']);
    } else if (this.userId === 'cashier' && this.password === '1234' && this.selectedRole === 'cashier') {
      this.router.navigate(['/cashier-dashboard']);
    } else {
      alert('Invalid credentials!');
    }
  }
}
