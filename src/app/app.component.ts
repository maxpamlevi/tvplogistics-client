import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {MenubarComponent} from './menubar/menubar.component';
import {PrimeNGConfig, PrimeTemplate} from 'primeng/api';
import {BlockUIModule} from 'primeng/blockui';
import {Button} from 'primeng/button';
import {CommonModule} from '@angular/common';
import {BlockUIService } from './services/block-ui.service';
import {TooltipModule} from 'primeng/tooltip';
import {TitleService} from './services/title.service';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
    MenubarComponent,
    BlockUIModule,
    PrimeTemplate,
    Button,
    CommonModule,
    TooltipModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [
    DynamicDialogConfig,
  ],
})

export class AppComponent implements OnInit{
  isBlocked = false;

  public menu: any = true;

  constructor(private primengConfig: PrimeNGConfig,
              private cdRef: ChangeDetectorRef,
              private blockUIService: BlockUIService,
              private titleService: TitleService,
              ) {}

  ngOnInit() {
    this.blockUIService.blockUI$.subscribe(isBlocked => {
      this.isBlocked = isBlocked;
      this.cdRef.detectChanges();
    });

    this.primengConfig.ripple = true;
    this.primengConfig.zIndex = {
      modal: 1100,    // dialog, sidebar
      overlay: 1000,  // dropdown, overlaypanel
      menu: 1000,     // overlay menus
      tooltip: 1100,   // tooltip
    };
  }

  hiddenMenu(){
    this.menu = !this.menu;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngAfterViewInit() {
    this.cdRef.detectChanges();
  }

}
