import { Injectable } from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public user: any = {};
  public role: any;


  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    try {
      const user_jsonString:string | null =  localStorage.getItem('user');
      if(!user_jsonString){
        this.removeUser();
        throw new Error('User not found');
      }
      else {
        this.user = JSON.parse(atob(user_jsonString));
        this.role = this.user.role;
      }
    }
    catch (e){
      this.router.navigate(['/login']);
    }

  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(
      `/api/v1/users/sign_in`,
      { user: { email, password } });
  }

  logout() {
    this.removeUser();
    location.reload();
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('user');
  }

  setUser(user: any): void {
    this.user = user;
  }

  removeUser(){
    localStorage.removeItem('user');
  }

  getUser(): any {
    return this.user;
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

}
