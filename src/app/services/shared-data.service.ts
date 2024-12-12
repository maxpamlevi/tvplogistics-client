import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class SharedDataService {
  public subject = new Subject<any>();
  currentMessage = this.subject.asObservable();

  sendMessage(message: any) {
    // console.log('Received message', message)
    this.subject.next(message);
  }

  getMessage(): Observable<any> {
    return this.currentMessage;
  }
}
