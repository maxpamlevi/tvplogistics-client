import {Component, ViewChild} from '@angular/core';
import {
  BeforeSaveEventArgs,
  SaveCompleteEventArgs,
  SpreadsheetAllModule,
  SpreadsheetComponent,
} from '@syncfusion/ej2-angular-spreadsheet';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-sheet',
  standalone: true,
  imports: [SpreadsheetAllModule],
  templateUrl: './sheet.component.html',
  styleUrl: './sheet.component.css',
})
export class SheetComponent {
  public data: any;
  constructor(private http: HttpClient, public route: ActivatedRoute) {
  }

  @ViewChild('spreadsheet') public spreadsheetObj?: SpreadsheetComponent;
  public openUrl: string =
    'https://services.syncfusion.com/angular/production/api/spreadsheet/open';

  ngOnInit() {
    this.data =  this.route.snapshot.queryParams;
    console.log(this.data);
    if(this.data?.url){
      this.openXlsx(this.data?.url);
    }

  }

  async openXlsx(url: string) {
    fetch(url)
      .then((response) => {
        console.log(response);
        response.blob().then((fileBlob) => {
          const file = new File([fileBlob], 'Sample.xlsx');
          this.spreadsheetObj!.open({ file: file });
        });
      });
  }

  beforeSave(args: BeforeSaveEventArgs): void {
    args.needBlobData = true; // To trigger the saveComplete event.
    args.isFullPost = false; // Get the spreadsheet data as blob data in the saveComplete event.
  };
  saveComplete(args: SaveCompleteEventArgs): void {
    // To obtain the Blob data.
    console.log('Spreadsheet BlobData: ', args.blobData);
  };

}
