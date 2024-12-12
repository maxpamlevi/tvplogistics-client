import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {importProvidersFrom, isDevMode} from '@angular/core';
import { AuthInterceptor } from './app/interceptors/auth.interceptor';
import { registerLicense } from '@syncfusion/ej2-base';
import { SharedDataService } from './app/services/shared-data.service';
import { MessageService } from 'primeng/api';
import { BlockUIInterceptor } from './app/interceptors/block-ui.interceptor';
import { enableProdMode } from '@angular/core';
import {environment} from "./environments/environment.development";


registerLicense(environment.registerLicense);

if (!isDevMode()) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    importProvidersFrom([BrowserAnimationsModule]),
    provideHttpClient(withInterceptors([AuthInterceptor]), withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: BlockUIInterceptor, multi: true },
    SharedDataService,
    MessageService,
  ],
}).catch((err) => console.error(err));
