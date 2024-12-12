import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';  // Required for standalone components
import { FormsModule } from '@angular/forms';
import {MessageService} from 'primeng/api';
import {MessagesModule} from 'primeng/messages';    // For two-way binding
import {Location} from '@angular/common';
import {Router} from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MessagesModule],  // Import necessary modules
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: UserService,
              private messageService: MessageService,
              private _location: Location,
              private router: Router) {}

  login() {
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        localStorage.setItem('authToken', response.authToken);
        localStorage.setItem('user', btoa(JSON.stringify(response.user)));
        // this._location.back();
        this.router.navigate(['/dashboard']);
        // this.messageService.add({severity: 'success', summary: '', detail: 'Logged in successfully'});
      },
      error: (err) => {
        this.messageService.add({severity: 'error', summary: '', detail: "Can't logging. Please try again !!!" });
        console.error('Login failed', err);
      },
    });
  }
}
