import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

import { IMsg } from '../models/msg.interface';

@Injectable({
  providedIn: 'root'
})
export class NotifyService {
  private _msgSource = new Subject<IMsg | null>();

  msg = this._msgSource.asObservable();

  update(content: string, style: 'error' | 'info' | 'success') {
    const msg: IMsg = { content, style };
    this._msgSource.next(msg);
  }

  clear() {
    this._msgSource.next(null);
  }
}
