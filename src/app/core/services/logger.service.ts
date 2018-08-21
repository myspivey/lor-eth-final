import { Injectable } from '@angular/core';

import * as debug from 'debug';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  private _appKey = 'LOR';

  private _logger: debug.IDebugger;

  constructor() {
    this._logger = debug(`${this._appKey}:`);
  }

  setNamespace(namespace: String) {
    this._logger = debug(`${this._appKey}:${namespace}`);
  }

  log(msg: any, ...args: any[]) {
    if (!environment.production) {
      this._logger(msg, ...args);
    }
  }
}
