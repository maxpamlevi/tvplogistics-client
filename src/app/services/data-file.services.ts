import {Injectable} from '@angular/core';
import * as XLSX from 'xlsx';
import {HttpClient} from '@angular/common/http';
import {MessageService} from 'primeng/api';

@Injectable({
  providedIn: 'root',
})

export class DataFileServices {
  data: any = [];
  so: any;
  bill_of_lading: string;
  month: any;
  commodity: string;
  customer: string;
  workbook: any;
  params: any = {};

  constructor(private http: HttpClient,private messageService: MessageService) {
  }

  importFile(evt: any, so: any): any {
    this.so = so;
    this.bill_of_lading = so.bill_of_lading;
    this.month = so.month;
    this.customer = so.customer_no;
    this.commodity = so.commodity;

    const file = evt.target.files[0];

    return new Promise((resolve, reject) => {
      if (file) {
        const r = new FileReader();
        r.onload = e => {
          try {
            // @ts-ignore
            const data = new Uint8Array(e.target?.result);
            this.workbook = XLSX.read(data, { type: 'array', raw: false, cellDates: true });
            const data_obj = this.getData(so);
            for (const key in data_obj) {
              if (data_obj.hasOwnProperty(key)) {
                data_obj[key] = Number(data_obj[key].toFixed(3));
              }
            }
            resolve(data_obj);

          } catch (error) {
            reject(error);
          }
        };
        r.onerror = error => reject(error);
        r.readAsArrayBuffer(file);
      } else {
        reject('Failed to load file');
      }
    });
  }

  getDataFromSheet(sheet: any) {
    let data =  XLSX.utils.sheet_to_json(this.workbook?.Sheets[sheet],  {header: 1});
    data = data.filter( (e:any)=> e.length ).map((row:any) =>
      row.map( (cell:any) =>
        typeof cell === 'string' ? cell.replace(/\n/g, '').trim() : cell,
      ),
    );
    return data;
  }

  mergeArrays(a: any[], b: any[]): any[] {
    const length = a.length > a.length ? a.length : b.length;
    const arr: any = [];
    for (let i = 0; i <= length; i++) {
      if(b[i]) {
        arr.push(b[i]);
      } else {
        arr.push(a[i]);
      }
    }
    return arr;
  }

  getData( data: any) {
    switch (data.so_type) {
      case 'SO':
        return this.noType();
      case 'SO DISC':
        return this.discType();
      case 'SO LOAD':
        return this.loadType();
      case 'SO CONT':
        return this.contType();
      case 'SO BINH KHUONG':
        return this.bkType();
      default:
        return [];
    }

  }

  noType(){
    const data:any = {
      internal: 0,
      external: 0,
      barge: 0,
      wh_barge: 0,
      tvpl_truck: 0,
      tvpl_load: 0,
      external_wh: 0,
      internal_wh: 0,
    };
    const barge:any = this.getDataFromSheet('BARGE');
    const load:any = this.getDataFromSheet('WL LOAD');
    const discharge:any = this.getDataFromSheet('WL DISCHARGE');
    const import_sheet:any = this.getDataFromSheet('IMPORT');
    data.tvpl_barge = 0;
    for (const e of barge) {
      if (e[5] instanceof Date && e[5].getUTCMonth() + 1 == this.month) {
        data.tvpl_barge += e[7] / 1000;
      }
    }
    data.discharge = 0;
    for (const e of discharge) {
      if( e[8] instanceof Date && e[8].getUTCMonth() + 1 == this.month) {
        data.discharge += e[5] / 1000;
      }
    }
    data.internal_wh = 0;
    for (const e of import_sheet) {
      if (e[1] instanceof Date && e[1].getUTCMonth() + 1 == this.month) {
        data.internal_wh += e[6] / 1000;
      }
    }
    data.external_wh = 0;
    for (const e of import_sheet) {
      if (e[1] instanceof Date && e[1].getUTCMonth() + 1 == this.month) {
        data.external_wh += e[6] / 1000;
      }
    }
    data.tvpl_load = 0;
    for (const e of load) {
      if (e[8] instanceof Date && e[8].getUTCMonth() + 1 == this.month) {
        data.tvpl_load += e[5] / 1000;
      }
    }

    return this.params = data;

  }

  discType(){
    const final_sharing:any = this.getDataFromSheet('FINAL SHARING');

    const wl_wh:any = this.getDataFromSheet('WL WH');

    let internal = 0;
    const data: any = {};
    data.tvpl_barge = 0;
    data.discharge = 0;
    data.tvpl_truck = 0;
    data.tvpl_load = 0;
    for (const e of final_sharing) {

      if ( e[0] == this.bill_of_lading && e[2] == this.commodity
        && e.includes(this.customer) && e[21] == this.month) {
        internal = e[10];
        data.discharge = e[7];

        break;
      }
    }
    let external = 0;
    for (const e of wl_wh) {
      if (e[0] instanceof Date && e[0].getUTCMonth() + 1 == this.month
        && e.includes(this.bill_of_lading) && e.includes(this.commodity) && e.includes(this.customer) && e[13] == 'E') {
        external += e[8]/ 1000;

      }
    }
    let wh_barge = 0;

    for (const e of wl_wh) {
      if (e.includes(this.bill_of_lading) && e.includes(this.commodity) &&
        e.includes(this.customer) && e[0] instanceof Date && e[0].getUTCMonth() + 1 && e[12] == 'WH-BARGE') {
        wh_barge += e[8]/ 1000;
      }
    }
    const internal_total = internal - external;
    data.external_wh = external;
    data.internal_wh = internal_total;
    data.tvpl_truck = internal + wh_barge;
    if (wh_barge != 0) {
      data.tvpl_load = wh_barge;
    }

    return this.params = data;

  }

  discTypeOld(){
    const data:any = {
      internal: 0,
      external: 0,
      barge: 0,
      wh_barge: 0,
      tvpl_truck: 0,
      tvpl_load: 0,
      external_wh: 0,
      internal_wh: 0,
    };

    let final_sharing = this.getDataFromSheet('FINAL SHARING');
    const h1= ['B/L in Details','Shared Quantity (Mt)'];
    const h2= ['B/L No.',	'Consignee','Cargo'];
    const header = this.getHeader(final_sharing,h1,h2);


    const wl_wh = this.getDataFromSheet('WL WH');
    const header2 = this.getHeader(wl_wh,['Ngày Date', 'Phương án'],null);

    final_sharing = final_sharing.filter( (e:any) => e.some((e1:any) => e1 == this.bill_of_lading) );
    final_sharing = final_sharing.filter( (e:any) => e.some((e1:any) => e1 == this.customer) );
    final_sharing = final_sharing.filter( (e:any) => e.some((e1:any) => e1 == this.commodity) );
    const fs_obj = this.arrayToObject(final_sharing,header)[0];
    const wh_obj = this.arrayToObject(wl_wh,header2);
    if (fs_obj && wh_obj){

    data.internal = fs_obj['Quantity of Cargo to be received from Warehouse(Mt) - Included 0.3%'];

    const wh_filtered = wh_obj.filter((e: any) => e['Ngày Date'] instanceof Date
      && e['Ngày Date'].getUTCMonth() + 1 == Number(this.month) && e['Số vận đơnBill no.'] == this.bill_of_lading);

    data.external = wh_filtered.filter((e: any) => e['Kho(Internal or external)'] == 'E').reduce((total:any, wl:any) => total + wl['TL hàngCargo weight'] /1000 , 0);

    data.wh_barge = wh_filtered.filter((e: any) => e['Phương án'] == 'WH-BARGE').reduce((total:any, wl:any) => total + wl['TL hàngCargo weight'] / 1000, 0);

    const internal_total = data.internal - data.external;
    data.external_wh = data.external;
    data.internal_wh = internal_total;
    data.tvpl_truck = data.internal + data.wh_barge;
    if (data.wh_barge) {
      data.tvpl_load = data.wh_barge;
    }
    data.discharge =  fs_obj['Quantity Entitlement'];
    this.params = data;

    }

    return this.params;
  }

  loadType(){
    const data:any = {
      internal: 0,
      external: 0,
      barge: 0,
      wh_barge: 0,
      tvpl_truck: 0,
      tvpl_load: 0,
      external_wh: 0,
      internal_wh: 0,
      tvpl_barge: 0,
    };

    const barge:any = this.getDataFromSheet('Barge');
    const truck:any = this.getDataFromSheet('Truck');
    const load:any = this.getDataFromSheet('SHIFTLY REPORT');


    for (const e of barge) {
      if (e.includes('TỔNG')) {
        data.tvpl_barge = e[2]/ 1000 ;
        break;
      }
    }

    for (const e of truck) {
      if (e.includes('TỔNG CỘNG')) {
        data.tvpl_truck = e[5]/ 1000 ;
        break;
      }
    }

    for (const e of load) {
      if (e.includes('TOTAL')) {
        data.tvpl_load = e[7]/ 1000 ;
        break;
      }
    }

    this.params = data;

    return this.params;

  }


  contType(){
    const cont:any = this.getDataFromSheet('HẠ CONT');
    const data: any = {};
    data.external_wh = 0;
    for (const e of cont) {
      if ( e[2] && e[2] == Number(this.month)) {
        data.external_wh += e[7]/ 1000 ;
      }
    }

    this.params = data;

    return this.params;

  }

  bkType(){
    const truck:any = this.getDataFromSheet('QT');
    const data:any = {};
    for (const e of truck) {
      if (e.includes('TỔNG (I)')) {
        data.tvpl_truck = e[10]/ 1000 ;
        break;
      }
    }

    this.params = data;

    return this.params;

  }

  getHeader(data: any, header1: any, header2: any) {
    let columns:any;
    const columns1: any = data.filter((e:any) =>  header1.every((item: any) => e.includes(item)));
    if (header2){
      const columns2: any = data.filter((e:any) =>  header2.every((item: any) => e.includes(item)));
      columns = this.mergeArrays(columns1[0], columns2[0]);
    }else{
      columns = columns1[0];
    }

    return columns;
  }

  arrayToObject(arr: any, key:any) {
    return arr.map((e:any) => {
      const obj: any = {};
      e.forEach((e1:any, index1:any) => {
        obj[key[index1]] = e1;
      });
      return obj;
    });
  }

  convertNumber(num:any):any {
    if (!num || isNaN(parseFloat(num))) {
      return 0;
    }
    if(typeof num == 'number'){
      return num.toFixed(3);
    }

    return parseFloat(num.replaceAll(',', '')).toFixed(3);

  }



}
