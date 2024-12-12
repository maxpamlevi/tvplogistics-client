import {ChangeDetectorRef, Component} from '@angular/core';
import {MenubarModule} from 'primeng/menubar';
import {CommonModule} from '@angular/common';
import {UserService} from '../services/user.service';

import {FormsModule} from '@angular/forms';
import {SelectButtonModule} from 'primeng/selectbutton';
import {SpeedDialModule} from 'primeng/speeddial';
import {ToastModule} from 'primeng/toast';


@Component({
  selector: 'app-menubar',
  standalone: true,
  imports: [CommonModule, MenubarModule, FormsModule, SelectButtonModule, SpeedDialModule, ToastModule],
  templateUrl: './menubar.component.html',
  styleUrl: './menubar.component.css',
})
export class MenubarComponent {
  user: any;
  branch: any;
  items: any[];
  stateOptions: any[] = [{ label: 'TVPL', value: 'tvpl' },{ label: 'NNP', value: 'nnp' }];

  constructor(private cdRef: ChangeDetectorRef,private authService: UserService) {
  }
  ngOnInit() {
    this.user = this.authService.getUser();
    this.branch = this.getBranch();
    this.items = [
      {
        icon: 'pi pi-external-link',
        command: () => {
          console.log('ee');
          this.authService.logout();
        },
      },

    ];
  }

  notStaff(){
    return this.user.role !== 'staff';
  }

  isAdmin() {
    return this.user.role === 'admin';
  }

  changeBranch(event:any) {
    localStorage.setItem('branch', event.value);
    location.reload();
  }

  getBranch(){
    const branch = localStorage.getItem('branch');
    if (!branch){
      localStorage.setItem('branch', 'tvpl');
    }
    return localStorage.getItem('branch') || 'tvpl';
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }
}
