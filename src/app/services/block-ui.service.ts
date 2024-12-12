import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BlockUIService {
  private blockUI = new BehaviorSubject<boolean>(false);
  blockUI$ = this.blockUI.asObservable();

  show() {
    this.blockUI.next(true);
  }

  hide() {
    this.blockUI.next(false);
  }
}
