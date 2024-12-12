import {Component, Pipe, PipeTransform, ViewChild, OnInit, ChangeDetectorRef} from '@angular/core';
import {HttpClient, HttpParams, HttpResponse} from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ClickEventArgs } from '@syncfusion/ej2-angular-navigations';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {
  EditService,
  ExcelExportProperties,
  ExcelExportService,
  FilterService,
  GridComponent,
  GridModule,
  PageService,
  RecordDoubleClickEventArgs,
  SortService,
  ToolbarService,
  ColumnChooserService,
  GroupService,
  ResizeService,
} from '@syncfusion/ej2-angular-grids';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessagesModule } from 'primeng/messages';
import { DropdownModule } from 'primeng/dropdown';
import { UserService } from '../services/user.service';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { AutoCompleteModule } from '@syncfusion/ej2-angular-dropdowns';
import { FileUploadModule } from 'primeng/fileupload';
import { DataFileServices } from '../services/data-file.services';
import { Router } from '@angular/router';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import { DebitNoteComponent } from '../debit-note/debit-note.component';
import {PaymentRequestComponent} from '../payment-request/payment-request.component';


@Pipe({ standalone: true, name: 'UserFieldPipe' })
export class UserFieldPipe implements PipeTransform {
  transform(users: any[]): string {
    return users ? users.map(user => user.name).join(', ') : '';
  }
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GridModule,
    Button,
    ConfirmDialogModule,
    MessagesModule,
    DropdownModule,
    ReactiveFormsModule,
    DialogModule,
    DropDownListModule,
    MultiSelectModule,
    AutoCompleteModule,
    FileUploadModule,
    UserFieldPipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  providers: [
    ExcelExportService,
    ToolbarService,
    EditService,
    PageService,
    SortService,
    FilterService,
    ConfirmationService,
    BrowserAnimationsModule,
    MessageService,
    AutoCompleteModule,
    ColumnChooserService,
    GroupService,
    ResizeService,
    DialogService,
  ],
})
export class DashboardComponent implements OnInit {
  @ViewChild('grid') public grid?: GridComponent;
  options = [
    { name: 'List', value: 'listing' },
    { name: 'Done', value: 'done' },
  ];
  selectedOption = this.options[0];
  public data?: object[];
  editSettings = { allowEditing: true, allowAdding: true, allowDeleting: true, allowEditOnDblClick: true };
  toolbar: string[] = ['Search', 'ExcelExport', 'ColumnChooser', 'Cancel', 'Delete', 'Add'];
  pageSettings = { pageCount: 5, pageSize: 80 };
  filterSettings = { type: 'Excel' };
  fieldName = '';
  show = false;
  originData: any;
  groupOptions = { showDropArea: false, columns: ['so'] };
  files: any;
  ref: DynamicDialogRef | undefined;


  constructor(
    private http: HttpClient,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private user: UserService,
    private dataFileServices: DataFileServices,
    private router: Router,
    public dialogService: DialogService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.setToolbarOptions();
    this.changeOption();
    this.cdr.detectChanges();
  }

  setToolbarOptions() {
    switch (this.user.role) {
      case 'admin':
        this.toolbar.push('Edit');
        break;
      case 'staff':
        this.toolbar = ['Search', 'ColumnChooser', 'Cancel'];
        break;
      case 'accountant':
        break;
      case 'settlement':
        this.toolbar = ['Search', 'ExcelExport', 'ColumnChooser', 'Cancel'];
        break;
    }
  }

  changeOption() {
    this.loadData();
  }

  loadData() {
    const apiUrl = '/api/v1/dashboard';
    this.http.get<any[]>(apiUrl, { params: { type: this.selectedOption.value } }).subscribe(response => {
      this.data = response;
      this.show = true ;
      this.originData = response;
      this.grid?.refresh();
      this.grid?.clearSelection();
    });
  }

  toolbarClick(args: ClickEventArgs): void {
    console.log(args);

    if (args.item.id?.includes('add')) {
      this.router.navigate(['/dashboard/new']);
    } else if (args.item.id?.includes('edit')) {
      // @ts-ignore
      const id = this.grid?.getSelectedRecords()[0]?.id;
      if (id) {
        this.router.navigate(['/dashboard/new', id]);
      }
    } else if (args.item.id?.includes('export')) {
      const exportProperties: ExcelExportProperties = { exportType: 'CurrentPage' };
      this.grid?.excelExport(exportProperties);
    }
  }

  recordDoubleClick(args: RecordDoubleClickEventArgs) {
    this.fieldName = this.grid?.getColumnByIndex(args.cellIndex as number)?.field || '';
  }

  actionComplete(args: any) {
    console.log(args);
    if ( args.requestType ===  'columnstate'){
      this.saveColumnsToLocalStorage();
    }

    if (args.requestType === 'beginEdit') {
      (args.form.elements[this.grid?.element.getAttribute('id') + this.fieldName] as HTMLInputElement)?.focus();
    } else if (args.requestType === 'save' && args.action === 'edit') {
      this.confirmationService.confirm({
        message: 'Are you sure you want to perform this action?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => this.updateData(args),
        reject: () => this.grid?.updateRowValue(args.data.id, args.previousData),
      });
    } else if (args.requestType === 'delete') {
      this.confirmationService.confirm({
        message: 'Are you sure you want to perform this action?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => this.deleteData(args),
        reject: () => this.grid?.updateRowValue(args.data.id, args.previousData),
      });
    }
  }

  updateData(args: any) {
    const apiUrl = `/api/v1/dashboard/${args.data.id}`;
    this.http.patch<any>(apiUrl, { data: args.data }, { observe: 'response' }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: '', detail: 'Updated successfully' });
      },
      error: () => {
        this.grid?.updateRowValue(args.data.id, args.previousData);
        this.messageService.add({ severity: 'error', summary: '', detail: "Can't update data" });
      },
    });
  }

  deleteData(args: any) {
    const apiUrl = `/api/v1/dashboard/remove`;
    this.http.post<any>(apiUrl, { data: args.data.map((el: any) => el.id) }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: '', detail: 'Deleted successfully' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: '', detail: "Can't delete data" });
        this.data = this.originData;
      },
    });
  }

  userField(e: any) {
    return e && e.length ? e.map((user: any) => user.name).join(', ') : '';
  }

  staffAccess() {
    return this.user.role === 'staff' || this.isAdmin();
  }

  isAdmin() {
    return this.user.role === 'admin';
  }

  notStaff(){
    return this.user.role !== 'staff';
  }


  onUpload(e: any, data: any) {
    if (data.so_type) {
      this.dataFileServices.importFile(e, data).then((res: any) => {
        console.log(res);
        this.updateResult(res, data, e.target.files[0] );
      });
    }
  }

  goPaymentUrl(data: any) {
    this.router.navigate(['/payment_requests', data.id]);
  }

  goDebitNoteUrl(data: any) {
    this.router.navigate(['/debit_notes', data.id]);
  }

  saveColumnsToLocalStorage() {
    const columns = this.grid?.getColumns();
    if (columns) {
      const columnStates = columns.map((col: any) => ({
        field: col.field,
        visible: col.visible,
      }));
      localStorage.setItem('gridColumnStates', JSON.stringify(columnStates));
    }
  }

  loadColumnsFromLocalStorage() {
    const columnStates = localStorage.getItem('gridColumnStates');
    if (columnStates) {
      const columns = JSON.parse(columnStates);
      columns.forEach((col: any) => {
        const gridColumn = this.grid?.getColumnByField(col.field);
        if (gridColumn) {
          gridColumn.visible = col.visible;
        }
      });
      this.grid?.refreshColumns();
    }
  }

  updateResult(params: any, data: any, file: any) {
    console.log(params);
    const apiUrl = `/api/v1/dashboard/${data.id}/update_result`;
    const formData = new FormData();
    formData.append('file', file);
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      httpParams = httpParams.append(key, params[key]);
    });
    this.http.post<any>(apiUrl, formData, { params: httpParams })
      .subscribe({
        next: (response: HttpResponse<any>) => {
          const updatedData =  { ...data,...response };
          this.grid?.updateRowValue(data.id, updatedData);
          this.messageService.add({severity: 'success', summary: '', detail: 'Updated success'});
        }, error: () => {

        }, complete: () => {

        },
      });
  }

  returnAccess(){
    // @ts-ignore
    return this.grid?.getSelectedRecords().length > 0 && (this.selectedOption.value == 'done' ) && (this.user.role == 'admin');
  }

  returnData(){
    const base = '/api/v1/dashboard/return_data';
    const ids = this.grid?.getSelectedRecords().map((el: any) => el.id);
    this.confirmationService.confirm({
      message: 'Are you sure you want to perform this action?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.http.post<any>(base, { ids }).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: '', detail: 'Returned successfully!' });
            this.changeOption();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: '', detail: 'Return failed!' });
          },
        });
      },
    });
  }

  submitData() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to perform this action?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const base = '/api/v1//dashboard/update_status';
        const ids = this.grid?.getSelectedRecords().map((el: any) => el.id);
        this.http.post<any>(base, { ids }).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: '', detail: 'Update status successfully!' });
            this.changeOption();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: '', detail: 'Update status failed!' });
            this.data = this.originData;
          },
        });
      },
    });
  }

  updateAccess(){
    // @ts-ignore
    return this.grid?.getSelectedRecords().length > 0 && (this.selectedOption.value == 'listing' ) && (this.user.role == 'admin');
  }

  downloadFile(data:any) {
    console.log(data);
    const fileUrl = data.file_data.url;
    if (!fileUrl) {
      console.error('URL file chưa được cung cấp');
      return;
    }

    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  navigateToSheet(data: any) {
    if (data.file_data.url){

    }
    this.router.navigate(['/sheet'], { queryParams: { url: data.file_data.url } });
  }

  excelQueryCellInfo(args: any) {
    if (args.column.field === 'tvpl_load') {
        args.value = args.data?.result.tvpl_load || null;
    }
    if (args.column.field === 'discharge') {
      args.value = args.data?.result.discharge || null;
    }
    if (args.column.field === 'tvpl_truck') {
      args.value = args.data?.result.tvpl_truck || null;
    }
    if (args.column.field === 'tvpl_barge') {
      args.value = args.data?.result.tvpl_barge || null;
    }
    if (args.column.field === 'internal_wh') {
      args.value = args.data?.result.internal_wh || null;
    }
    if (args.column.field === 'external_wh') {
      args.value = args.data?.result.external_wh || null;
    }
    if (args.column.field === 'total_wh') {
      args.value = args.data?.result.total_wh || null;
    }
    if (args.column.field === 'grand_total') {
      args.value = args.data?.result.grand_total || null;
    }
    if (args.column.field === 'revenue') {
      args.value = args.data?.result.revenue || null;
    }
    if (args.column.field === 'cost') {
      args.value = args.data?.result.cost || null;
    }
    if (args.column.field === 'profit') {
      args.value = args.data?.result.profit || null;
    }
    if (args.column.field === 'date_so') {
      args.value = new Date(args.data?.date_so).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }
    if (args.column.field === 'start') {
      args.value = new Date(args.data?.start).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }
    if (args.column.field === 'end') {
      args.value = args.data?.end ? new Date(args.data?.end).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '';
    }

    if (args.column.field === 'docs_date') {
      args.value = args.data?.docs_date ? new Date(args.data?.docs_date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '';
    }
    if (args.column.field === 'payment_due_date') {
      args.value = args.data?.payment_due_date ? new Date(args.data?.payment_due_date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '';
    }

  }

  navigateToDeBitNote(e: any) {
    this.ref = this.dialogService.open(DebitNoteComponent, {
      header: `Debit Note - SO: ${e.so}`,
      width: '95vw',
      contentStyle: { overflow: 'auto' },
      breakpoints: {
        '960px': '95vw',
        '640px': '95vw',
      },
      data: { so_id: e.id},
    });
  }

  navigateToPaymentRequest(e: any) {
    this.ref = this.dialogService.open(PaymentRequestComponent, {
      header: `Payment Request - SO: ${e.so}`,
      width: '95vw',
      contentStyle: { overflow: 'auto' },
      breakpoints: {
        '960px': '95vw',
        '640px': '95vw',
      },
      data: { so_id: e.id},
    });
  }

}

