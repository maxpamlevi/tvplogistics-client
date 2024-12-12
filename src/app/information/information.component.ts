import {Component, ViewChild} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';

import {
  GridComponent,
  EditService,
  ToolbarService,
  PageService,
  SortService,
  FilterService,
  GridModule,
  ExcelExportService,
  ExcelExportProperties,
  RecordDoubleClickEventArgs, ColumnChooserService,
} from '@syncfusion/ej2-angular-grids';

import {ClickEventArgs} from '@syncfusion/ej2-angular-navigations';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Button} from 'primeng/button';
import {ConfirmationService, MessageService} from 'primeng/api';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {MessagesModule} from 'primeng/messages';

@Component({
  selector: 'app-information',
  standalone: true,
  imports: [CommonModule, FormsModule, GridModule, Button, ConfirmDialogModule, MessagesModule],
  templateUrl: './information.component.html',
  styleUrl: './information.component.css',
  providers: [ExcelExportService, ToolbarService, EditService,
    PageService, SortService, FilterService,
    ConfirmationService, ColumnChooserService, MessageService],
})

export class InformationComponent {
  @ViewChild('grid') public grid?: GridComponent;
  selection: string;

  data!: any[];
  editSettings!: any;
  toolbar!: string[];
  orderidrules!: any;
  customeridrules!: any;
  freightrules!: any;
  pageSettings: any;
  filterSettings!: any;
  editparams!: any;
  fieldName: string | any = '';
  originData: any;

  constructor(private http: HttpClient, private messageService: MessageService,private confirmationService: ConfirmationService) {
  }

  ngOnInit() {

    this.editSettings = {allowEditing: true, allowAdding: true, allowDeleting: true};
    this.toolbar = ['Search', 'ExcelExport', 'Add', 'Delete', 'ColumnChooser', 'Cancel'];
    this.orderidrules = {required: true, number: true};
    this.customeridrules = {required: true};
    this.freightrules = {required: true};
    this.editparams = {params: {popupHeight: '300px'}};
    this.pageSettings = {pageCount: 5, pageSize: 80};
    this.filterSettings = {type: 'Excel'};

  }

  toolbarClick(args: ClickEventArgs): void {
    console.log(args);
    if (args.item.id?.includes('export')) {
      const exportProperties: ExcelExportProperties = {
        exportType: 'CurrentPage',
      };
      (this.grid as GridComponent).excelExport(exportProperties);
    }
  }

  actionComplete(args: any) {
    if (args.requestType === 'beginEdit') {
      ((args.form as HTMLFormElement).elements[(this.grid as GridComponent).element.getAttribute('id') + this.fieldName] as HTMLInputElement).focus();
    }

    if (args.requestType === 'save' && args.action === 'edit') {
      this.confirmationService.confirm({
        message: 'Are you sure you want to perform this action?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.updateData(args);
        },
        reject: () => {
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
        reject: () => {
          this.grid?.updateRowValue(args.data.id, args.previousData);
        },
      });
    }

  }

  recordDoubleClick(args: RecordDoubleClickEventArgs) {
    this.fieldName = (this.grid as GridComponent).getColumnByIndex((args.cellIndex as number)).field;
  }

  loadVendors(): void {
    this.selection = 'vendors';

    const apiUrl = '/api/v1/informations/vendors';
    this.http.get<any>(apiUrl).subscribe((response) => {
      this.data = response;
      this.originData = response;
    });
  }

  loadCustomers(): void {
    this.selection = 'customers';
    const apiUrl = '/api/v1/informations/customers';
    this.http.get<any>(apiUrl).subscribe((response) => {
      this.data = response;
      this.originData = response;
    });
  }

  updateData(args: any) {
    const apiUrl = `/api/v1/informations/${args.data.id}`;
    this.http.patch<any>(apiUrl, {data: args.data, type: this.selection}, {observe: 'response'})
      .subscribe({
        next: () => {
          this.messageService.add({severity: 'success', summary: '', detail: 'Updated success'});
        }, error: () => {
          this.grid?.updateRowValue(args.data.id, args.previousData);
          this.messageService.add({severity: 'error', summary: '', detail: "Can't sign in !!!"});
        }, complete: () => {
        },
      });
  }

  deleteData(args: any) {
    const apiUrl = `/api/v1/informations/remove`;
    this.http.post<any>(apiUrl, {data: args.data.map((el: any) => el.id)})
      .subscribe({
        next: () => {
          this.messageService.add({severity: 'success', summary: '', detail: 'Delete success'});
        }, error: () => {
          this.messageService.add({severity: 'error', summary: '', detail: "Can't delete this value !!!"});
          this.data = this.originData;
        }, complete: () => {
        },
      });
  }

  createData(args: any) {

    const apiUrl = `/api/v1/informations/`;
    this.http.post<any>(apiUrl, {data: args.data, type: this.selection}, {observe: 'response'})
      .subscribe({
        next: (response: HttpResponse<any>) => {
          const index = this.data.findIndex((row: any) => row.id == null);
          this.data[index].id = response.body.id;
          this.grid?.refresh();
          this.messageService.add({severity: 'success', summary: '', detail: 'Create success'});
          return;

        }, error: () => {
          this.grid?.deleteRow(args.rowIndex);
          this.messageService.add({severity: 'error', summary: '', detail: "Can't delete this value !!!"});
          this.data = this.originData;
          return;
        }, complete: () => {
        },
      });
  }
}
