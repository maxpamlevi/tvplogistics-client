import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NewComponent } from './dashboard/new/new.component';
import { InformationComponent } from './information/information.component';
import {DebitNoteComponent} from './debit-note/debit-note.component';
import {PaymentRequestComponent} from './payment-request/payment-request.component';
import {SheetComponent} from './sheet/sheet.component';
import {ReportComponent} from './report/report.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, data: { title: 'Login' } },
  { path: 'dashboard', component: DashboardComponent, data: { title: 'Dashboard' } },
  { path: '', component: LoginComponent, data: { title: 'Login' } },
  { path: 'dashboard/new', component: NewComponent, data: { title: 'New Dashboard' } },
  { path: 'dashboard/new/:id', component: NewComponent, data: { title: 'Edit Dashboard' } },
  { path: 'information', component: InformationComponent, data: { title: 'Information' } },
  { path: 'payment_requests', component: PaymentRequestComponent, data: { title: 'Payment Requests' } },
  { path: 'payment_requests/:id', component: PaymentRequestComponent, data: { title: 'Edit Payment Request' } },
  { path: 'debit_notes', component: DebitNoteComponent, data: { title: 'Debit Notes' } },
  { path: 'debit_notes/:id', component: DebitNoteComponent, data: { title: 'Edit Debit Note' } },
  { path: 'sheet', component: SheetComponent, data: { title: 'Sheet' } },
  { path: 'report', component: ReportComponent, data: { title: 'Report' } },
];
