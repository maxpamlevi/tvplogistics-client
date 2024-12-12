import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { UserService } from '../services/user.service';
import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import {environment} from "../../environments/environment";

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  // @ts-ignore
  const BASE_URL = environment.baseUrl;

  const userService = inject(UserService);
  const router = inject(Router);
  const authToken = userService.getToken();
  let baseUrl =  BASE_URL

  const branch = localStorage.getItem('branch');

  if(req.url.includes('http')){
    baseUrl = '';
  }

  req = req.clone({
    url: `${baseUrl}${req.url}`,
    withCredentials: true,
  });

  if (authToken) {
    req = req.clone({
      headers: req.headers.set('Authorization', authToken),
    });
  }

  if (branch) {
    req = req.clone({
      headers: req.headers.set('Branch', branch),
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/login')) {
        router.navigate(['/login']);
        localStorage.removeItem('user');
      }
      console.error('HTTP Error:', error);
      return throwError(() => error);
    }),
  );
};
