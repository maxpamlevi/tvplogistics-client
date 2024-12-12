import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DropDownListModule} from '@syncfusion/ej2-angular-dropdowns';
import {TextBoxModule} from '@syncfusion/ej2-angular-inputs';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {ButtonDirective} from 'primeng/button';
import {DropdownModule} from 'primeng/dropdown';
import {InputTextModule} from 'primeng/inputtext';
import {FloatLabelModule} from 'primeng/floatlabel';
import {NgIf} from '@angular/common';
import {CalendarModule} from 'primeng/calendar';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {MessageService} from 'primeng/api';
import {ActivatedRoute} from '@angular/router';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {MessagesModule} from 'primeng/messages';
import {MultiSelectModule} from 'primeng/multiselect';


@Component({
  selector: 'app-new',
  standalone: true,
  imports: [
    DropDownListModule,
    TextBoxModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextareaModule,
    ButtonDirective,
    DropdownModule,
    InputTextModule,
    FloatLabelModule,
    NgIf,
    CalendarModule,
    ConfirmDialogModule,
    MessagesModule,
    MultiSelectModule,
  ],
  providers: [MessageService],
  templateUrl: './new.component.html',
  styleUrl: './new.component.css',
})
export class NewComponent {

  serviceOrderForm: FormGroup;
  branchOptions = ['tvpl','nnp'];
  soTypeOptions = ['SO', 'SO DISC', 'SO LOAD', 'SO CONT', 'SO BINH KHUONG'];
  commodityOptions = ['Wood pellet',
    'Corn',
    'AH 2',
    'APW',
    'DDGS',
    'SBM',
    'Kali',
    'Ure',
    'AUH',
    'Wheat',
    'CORN',
    'WHEAT 11.5',
    'MOP',
    'Hard drives',
    'WHEAT',
    'SFMP',
    'NPK',
    'Scrap Paper',
    'Spare part',
    'Fertilizer',
    'CWRS',
    'WCW',
    'SBM, Corn',
    'Fly ash',
    'Corn, Wheat',
    'AH',
    'HIPRO SBM',
    'WHEAT 10.5',
    'WHEAT 12.5',
    'Ceramic tiles',
    'GMOP',
    'Roll Paper',
    'yellow millet',
    'Soda',
    'Sugar',
    'Wood chip'];
  cargoOptions = ['Wood pellet', 'Agri-com', 'Fertilizer', 'AIR', 'Container', 'Scrap Paper', 'Fly ash', 'Ceramic tiles', 'Roll Paper', 'Soda ash', 'Sugar', 'Wood chip'];
  id: any;
  public vendor: any = [];
  public customer: any = [];
  public users_data: any = [];
  constructor(private fb: FormBuilder, private http: HttpClient,private messageService: MessageService,
              private route: ActivatedRoute) {}

  ngOnInit(): void {

    this.serviceOrderForm = this.fb.group({
      branch: ['tvpl', Validators.required],
      month: ['', Validators.required],
      date_so: ['', Validators.required],
      so: ['', Validators.required],
      so_type: ['', Validators.required],
      location: ['', Validators.required],
      customer_no: ['', Validators.required],
      customer: ['', Validators.required],
      key_customer: ['', Validators.required],
      vendor: ['', Validators.required],
      vendor_no: ['', Validators.required],
      type_cargo: ['', Validators.required],
      commodity: ['', Validators.required],
      vehicle: ['', Validators.required],
      name_of_vessel: ['', Validators.required],
      description: ['',Validators.required],
      user_ids: ['', Validators.required],
      equipment: ['',Validators.required],
    });

    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
      if (this.id){
        this.loadSO();
      }
    });

    this.loadVendors();
    this.loadCustomers();
    this.loadUsers();
  }

  onSubmit() {
    if(this.id){
      const apiUrl = `/api/v1/dashboard/${this.id}`;
      this.http.patch<any>(apiUrl, {data: this.serviceOrderForm.value})
        .subscribe({
          next: () => {
            this.messageService.add({severity: 'success', summary: '', detail: 'Update success'});
          }, error: () => {
            this.messageService.add({severity: 'error', summary: '', detail: "Can't update this SO !!!"});
          }, complete: () => {
          },
        });
    }else{
      const apiUrl = `/api/v1/dashboard`;
      this.http.post<any>(apiUrl, {data: this.serviceOrderForm.value})
        .subscribe({
          next: () => {
            this.messageService.add({severity: 'success', summary: '', detail: 'Create success!!'});
            return;
          }, error: () => {
            this.messageService.add({severity: 'error', summary: '', detail: "Can't create this SO !!!"});
            return;
          }, complete: () => {
          },
        });
    }

  }

  isInvalid(controlName: string) {
    const control = this.serviceOrderForm.get(controlName);
    // return control?.invalid && (control?.touched || control?.dirty);
    return control?.invalid;
  }

  loadVendors(): void {
    const apiUrl = '/api/v1/informations/vendors';
    this.http.get<any>(apiUrl).subscribe((response) => {
      this.vendor = response;

    });
  }

  loadCustomers(): void {
    const apiUrl = '/api/v1/informations/customers';
    this.http.get<any>(apiUrl).subscribe((response) => {
      this.customer = response;
    });
  }

  loadSO(){
    const apiUrl = `/api/v1/dashboard/${this.id}/get_so`;
    this.http.get<any>(apiUrl)
      .subscribe({
        next: (data: HttpResponse<any>) => {
          // @ts-ignore
          const response:any = data[0];
          response['customer'] = [response['customer']];
          response['user_ids'] = [response['users'].map((e:any)=> e.id)];
          response['vendor'] = [response['vendor']];
          this.serviceOrderForm = this.fb.group(response);

        }, error: () => {

        }, complete: () => {
        },
      });
  }

  loadUsers(): void {
    const apiUrl = `/api/v1/dashboard/get_user_info`;
    this.http.post<any>(apiUrl,{})
      .subscribe({
        next: (response: HttpResponse<any>) => {
          this.users_data = response;
        }, error: () => {

        }, complete: () => {
        },
      });
  }

}
