import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { BlockUIService } from '../services/block-ui.service';

@Injectable()

export class BlockUIInterceptor implements HttpInterceptor {
  constructor(private blockUIService: BlockUIService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.blockUIService.show();

    return next.handle(req).pipe(
      tap(
        event => {
          if (event instanceof HttpResponse) {
            this.blockUIService.hide();
          }
        },
        () => {
          this.blockUIService.hide();
        },
      ),
      finalize(() => {
        this.blockUIService.hide();
      }),
    );
  }
}
