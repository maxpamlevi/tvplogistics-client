import { Component, ViewChild, OnInit } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ClickEventArgs } from '@syncfusion/ej2-angular-navigations';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  ColumnChooserService,
  EditService,
  ExcelExportProperties,
  ExcelExportService,
  FilterService,
  GridComponent,
  GridModule,
  GroupService,
  IEditCell,
  PageService,
  RecordDoubleClickEventArgs,
  SortService,
  ToolbarService,
  ResizeService,
} from '@syncfusion/ej2-angular-grids';
import { DataManager, Query } from '@syncfusion/ej2-data';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessagesModule } from 'primeng/messages';
import { SharedDataService } from '../services/shared-data.service';
import { DropdownModule } from 'primeng/dropdown';
import { UserService } from '../services/user.service';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { AutoCompleteModule } from '@syncfusion/ej2-angular-dropdowns';
import { ActivatedRoute } from '@angular/router';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-payment-request',
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
  ],
  templateUrl: './payment-request.component.html',
  styleUrl: './payment-request.component.css',
  providers: [
    ResizeService,
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
    GroupService,
    ColumnChooserService,
  ],
})
export class PaymentRequestComponent implements OnInit {
  @ViewChild('grid') public grid?: GridComponent;
  options = [
    { name: 'List', value: 'listing' },
    { name: 'Pending', value: 'pending' },
    { name: 'Done', value: 'done' },
  ];
  selectedOption: any;
  data: any[] = [];
  editSettings: any;
  toolbar: string[] = [];
  pageSettings: any;
  filterSettings: any;
  fieldName: string | any = '';
  originData: any;
  requestEdit: IEditCell = {
    params: {
      popupHeight: 300,
      popupWidth: 300,
      actionComplete: () => false,
      allowFiltering: true,
      dataSource: new DataManager([{ name: 'Huỳnh Thúy Vi' }, { name: 'Yến Như' }, { name: 'Trần Phạm Minh Hiếu' }]),
      fields: { text: 'name', value: 'name' },
      query: new Query(),
    },
  };
  vendorEdit: IEditCell = {};
  vendor: any;
  show = false;
  id: any = 0;

  constructor(
    public sharedDataService: SharedDataService,
    private http: HttpClient,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private user: UserService,
    private route: ActivatedRoute,
    public config: DynamicDialogConfig,
  ) {}

  ngOnInit() {
    this.loadVendors();
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id');
    });
    if (this.config.data?.so_id){
      this.id = this.config.data.so_id;
      console.log(this.id);
    }

    this.editSettings = { allowEditing: true, allowAdding: true, allowDeleting: true };

    this.toolbar = ['ColumnChooser', 'Search', 'Add', 'Delete', 'Cancel'];
    this.pageSettings = { pageCount: 5, pageSize: 80 };
    this.filterSettings = { type: 'Excel' };

    this.setOptionsBasedOnRole();
    this.selectedOption = this.options[0];
    this.changeOption();
  }

  setOptionsBasedOnRole() {
    switch (this.user.role) {
      case 'admin':
        this.options = [
          { name: 'List', value: 'listing' },
          { name: 'Pending', value: 'pending' },
          { name: 'Done', value: 'done' },
        ];
        break;
      case 'staff':
        this.options = [
          { name: 'Listing', value: 'listing' },
          { name: 'Pending', value: 'pending' },
        ];
        break;
      case 'accountant':
        this.options = [
          { name: 'Pending', value: 'pending' },
          { name: 'Done', value: 'done' },
        ];
        break;
    }
  }

  previewPdf() {
    if(!this.grid?.getSelectedRecords()) return;
    this.sharedDataService.sendMessage({ blocked: true });

    const base = '/api/v1/payment_requests/get_pdf';
    const url = `${base}?${this.grid?.getSelectedRecords().map((e:any) => `ids=${e.id}`).join('&')}`;

    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const newWin = window.open(URL.createObjectURL(blob));
        if (!newWin || newWin.closed || typeof newWin.closed == 'undefined') {
          this.messageService.add({ severity: 'error', summary: '', detail: 'Browser blocked the popup!' });
        }
      },
      complete: () => {
        this.sharedDataService.sendMessage({ blocked: false });
      },
    });
  }

  changeOption() {
    this.loadData();
    if ( this.selectedOption.value === 'listing' ){
      this.editSettings = { allowEditing: true, allowAdding: true, allowDeleting: true };
    }else{
      this.editSettings = { allowEditing: false, allowAdding: false, allowDeleting: false };
    }

    this.toolbar = this.selectedOption.value === 'listing' ? ['ColumnChooser', 'Search', 'Add', 'Delete', 'Cancel', 'Update'] : ['Search'];
    this.grid?.clearSelection();
  }

  loadData() {
    const apiUrl = '/api/v1/payment_requests';
    const params: any = { type: this.selectedOption.value };
    if (this.id) {
      params.id = this.id;
    }
    this.http.get<any>(apiUrl, { params }).subscribe((response) => {
      this.data = response;
      this.originData = response;
      this.grid?.clearSelection();
    });
  }

  toolbarClick(args: ClickEventArgs): void {
    if (args.item.id?.includes('export')) {
      const exportProperties: ExcelExportProperties = {
        exportType: 'CurrentPage',
      };
      this.grid?.excelExport(exportProperties);
    }
  }

  recordDoubleClick(args: RecordDoubleClickEventArgs) {
    this.fieldName = this.grid?.getColumnByIndex(args.cellIndex as number).field;
  }

  actionComplete(args: any) {
    if (args.requestType === 'columnstate') {
      this.saveColumnsToLocalStorage();
    }

    if (args.requestType === 'beginEdit') {
      (args.form.elements[this.grid?.element.getAttribute('id') + this.fieldName] as HTMLInputElement)?.focus();
    }

    if (args.requestType === 'save' && args.action === 'edit') {
      this.confirmationService.confirm({
        message: 'Are you sure you want to perform this action?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.updateData(args);
        },
        reject: () => {
          this.grid?.refresh();
          this.grid?.updateRowValue(args.data.id, args.previousData);
        },
      });
    }

    if (args.requestType === 'delete') {
      this.confirmationService.confirm({
        message: 'Are you sure you want to perform this action?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.deleteData(args);
        },
        reject: () => {
          this.grid?.updateRowValue(args.data.id, args.previousData);
        },
      });
    }

    if (args.requestType === 'save' && args.action === 'add') {
      this.confirmationService.confirm({
        message: 'Are you sure you want to perform this action?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.createData(args);
        },
      });
    }
  }

  updateData(args: any) {
    const apiUrl = `/api/v1/payment_requests/${args.data.id}`;
    this.http.patch<any>(apiUrl, { data: args.data }, { observe: 'response' }).subscribe({
      next: (response: HttpResponse<any>) => {
        this.grid?.updateRowValue(args.data.id, response.body);
        this.messageService.add({ severity: 'success', summary: '', detail: 'Updated successfully' });
      },
      error: () => {
        this.grid?.updateRowValue(args.data.id, args.previousData);
        this.messageService.add({ severity: 'error', summary: '', detail: 'Update failed!' });
      },
    });
  }

  deleteData(args: any) {
    const apiUrl = `/api/v1/payment_requests/remove`;
    this.http.post<any>(apiUrl, { data: args.data.map((el: any) => el.id) }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: '', detail: 'Deleted successfully' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: '', detail: 'Delete failed!' });
        this.data = this.originData;
      },
    });
  }

  createData(args: any) {
    const apiUrl = `/api/v1/payment_requests/`;
    const data = this.id ? { ...args.data, service_order_id: this.id } : args.data;
    this.http.post<any>(apiUrl, { data }, { observe: 'response' }).subscribe({
      next: (response: HttpResponse<any>) => {
        const index = this.data.findIndex((row: any) => row.id == null);
        this.data[index].id = response.body.id;
        this.grid?.refresh();
        this.messageService.add({ severity: 'success', summary: '', detail: 'Created successfully' });
      },
      error: () => {
        this.grid?.deleteRow(args.rowIndex);
        this.messageService.add({ severity: 'error', summary: '', detail: 'Create failed!' });
        this.data = this.originData;
      },
    });
  }

  submitData() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to perform this action?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const base = '/api/v1/payment_requests/submit';
        const ids = this.grid?.getSelectedRecords().map((el: any) => el.id);
        this.http.post<any>(base, { ids, type: this.getTypeSubmit() }).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: '', detail: 'Submitted successfully!' });
            this.changeOption();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: '', detail: 'Submit failed!' });
            this.data = this.originData;
          },
        });
      },
    });
  }

  returnData() {
    const base = '/api/v1/payment_requests/return_data';
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

  loadVendors() {
    const apiUrl = '/api/v1/informations/vendors';
    this.http.get<any>(apiUrl).subscribe((e) => {
      this.vendor = e;
      this.vendorEdit = {
        params: {
          popupHeight: 500,
          popupWidth: 600,
          actionComplete: () => false,
          filterType: 'Contains',
          allowFiltering: true,
          dataSource: new DataManager(this.vendor),
          fields: { text: 'name', value: 'name' },
          query: new Query(),
        },
      };
      this.show = true;
      this.loadColumnsFromLocalStorage();
    });
  }

  submitAccess(){
    // @ts-ignore
    return this.grid?.getSelectedRecords().length > 0 && this.selectedOption.value == 'listing' &&  ['admin'].includes(this.user.role);
  }

  doneAccess(){
    // @ts-ignore
    return this.grid?.getSelectedRecords().length > 0 && this.selectedOption.value == 'pending' &&  ['accountant'].includes(this.user.role);
  }

  returnAccess(){
    // @ts-ignore
    // this.selectedOption.value
    return this.grid?.getSelectedRecords().length > 0 && (this.selectedOption.value == 'pending' ) &&  ['accountant'].includes(this.user.role);
  }

  getTypeSubmit() {
    if (this.selectedOption.value === 'listing') {
      return 'pending';
    }
    if (this.selectedOption.value === 'pending') {
      return 'done';
    }
    return '';
  }

  saveColumnsToLocalStorage() {
    const columns = this.grid?.getColumns();
    if (columns) {
      const columnStates = columns.map((col: any) => ({
        field: col.field,
        visible: col.visible,
      }));
      localStorage.setItem('gridColumnStates_pr', JSON.stringify(columnStates));
    }
  }

  loadColumnsFromLocalStorage() {
    const columnStates = localStorage.getItem('gridColumnStates_pr');
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
}
