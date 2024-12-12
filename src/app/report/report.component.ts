import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PivotView } from '@syncfusion/ej2-angular-pivotview';
import {
  AccumulationChartModule,
  CategoryService,
  ChartModule,
  ColumnSeriesService,
  LineSeriesService,
  AccumulationChartAllModule,
} from '@syncfusion/ej2-angular-charts';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import {
  FieldListService,
  GroupingBarService,
  IDataOptions,
  PivotFieldListAllModule,
  PivotViewAllModule,
  PivotViewModule,
  PivotChartService,
  ToolbarService,
  ToolbarItems,
  ConditionalFormattingService,
} from '@syncfusion/ej2-angular-pivotview';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [
    ChartModule,
    AccumulationChartModule,
    AccumulationChartAllModule,
    DropdownModule,
    ReactiveFormsModule,
    MultiSelectModule,
    FormsModule,
    PivotViewModule,
    PivotViewAllModule,
    PivotFieldListAllModule,
    CheckboxModule,
  ],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
  providers: [
    CategoryService,
    LineSeriesService,
    ColumnSeriesService,
    GroupingBarService,
    FieldListService,
    PivotChartService,
    ToolbarService,
    ConditionalFormattingService,
  ],
})
export class ReportComponent implements OnInit {
  @ViewChild('pivotview', { static: false }) pivotview!: PivotView;
  selectAll: boolean = false;
  public data: any[] = [{ x: 'Germany', y: 72 }, { x: 'Russia', y: 103.1 }, { x: 'Germany', y: 32 }];
  public Options: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  public selectedOption: number[] = [];
  public dataSourceSettings!: IDataOptions;
  public displayOption: any = { view: 'Both' };
  public chartSettings: any = { type: 'Column' };
  public chartTypes: any[] = [];
  public toolbarOptions: ToolbarItems[];
  public chartTypeOptions: any = ['Column', 'Bar', 'Line', 'Area', 'Pie', 'Doughnut', 'Spline', 'StackingColumn', 'StackingBar', 'StackingArea', 'Scatter', 'Bubble', 'Polar', 'Radar'];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.initializeChartTypes();
    this.loadData();
    this.toolbarOptions = [
      'Grid', 'Chart', 'Export', 'SubTotal', 'GrandTotal', 'ConditionalFormatting', 'NumberFormatting', 'FieldList'] as ToolbarItems[];
  }

  initializeChartTypes() {
    this.chartTypes = [
      { label: 'Column', value: { type: 'Column' } },
      { label: 'Bar', value: { type: 'Bar' } },
      { label: 'Line', value: { type: 'Line' } },
      { label: 'Area', value: { type: 'Area' } },
      { label: 'Pie', value: { type: 'Pie' } },
      { label: 'Doughnut', value: { type: 'Doughnut' } },
      { label: 'Spline', value: { type: 'Spline' } },
      { label: 'StackingColumn', value: { type: 'StackingColumn' } },
      { label: 'StackingBar', value: { type: 'StackingBar' } },
      { label: 'StackingArea', value: { type: 'StackingArea' } },
      { label: 'Scatter', value: { type: 'Scatter' } },
      { label: 'Bubble', value: { type: 'Bubble' } },
      { label: 'Polar', value: { type: 'Polar' } },
      { label: 'Radar', value: { type: 'Radar' } },
    ];
  }

  loadData() {
    if(!this.selectedOption.length) return;
    const apiUrl = '/api/v1/dashboard/report';
    this.http.post(apiUrl, { month: this.selectedOption }).subscribe({
      next: (response: any) => {
        this.dataSourceSettings = {
          dataSource: response,
          expandAll: false,
          enableSorting: true,
          columns: [],
          filters: [
            { name: 'commodity', caption: 'Commodity' },
            { name: 'equipment', caption: 'Equipment' },
            { name: 'type_cargo', caption: 'Type Cargo' },
            { name: 'month', caption: 'Month' },
            { name: 'key_customer', caption: 'Key Customer' },
            { name: 'location', caption: 'Location' },
          ],
          formatSettings: [
            { name: 'tvpl_load', format: 'N3' },
            { name: 'discharge', format: 'N3' },
            { name: 'tvpl_truck', format: 'N3' },
            { name: 'tvpl_barge', format: 'N3' },
            { name: 'internal_wh', format: 'N3' },
            { name: 'external_wh', format: 'N3' },
            { name: 'total_wh', format: 'N3' },
            { name: 'grand_total', format: 'N3' },
          ],
          rows: [
            { name: 'month', caption: 'Month' },
            // { name: 'commodity', caption: 'Commodity' },
            // { name: 'equipment', caption: 'Equipment' },
            // { name: 'type_cargo', caption: 'Type cargo' },
            // { name: 'key_customer', caption : 'Key customer' },
            // { name: 'location', caption: 'Location' },
          ],
          values: [
            { name: 'tvpl_load', caption: 'Load' },
            { name: 'discharge', caption: 'Discharge' },
            { name: 'tvpl_truck', caption: 'Truck' },
            { name: 'tvpl_barge', caption: 'Barge' },
            { name: 'internal_wh', caption: 'Internal WH' },
            { name: 'external_wh', caption: 'External WH' },
            { name: 'grand_total', caption: 'Grand Total' },
          ],
        };
      },
      error: () => {
        console.error('Error loading data');
      },
    });
  }

  onMonthChange() {
    this.loadData();
  }

  onSelectAllChange(event: any) {
    this.selectedOption = event.checked ? [1,2,3,4,5,6,7,8,9,10,11,12] : [];
    this.selectAll = event.checked;
  }

}

