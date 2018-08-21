import { Web3Wrapper } from '@0xproject/web3-wrapper';
import { Injectable } from '@angular/core';

import { BigNumber } from 'bignumber.js';
import { bindCallback, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as HDWalletProvider from 'truffle-hdwallet-provider';
import * as Web3 from 'web3';

import { environment } from '../../../environments/environment';
import { LoggerService } from './logger.service';

declare var web3: any;

@Injectable({
  providedIn: 'root'
})
export class Web3Service {

  // We store this twice so we have a nice async wrapped and the generic one
  private _web3: Web3;
  private _web3wrapper: Web3Wrapper;

  constructor(
    private _loggingService: LoggerService
  ) {
    this.checkAndInstantiateWeb3();
  }

  checkAndInstantiateWeb3 = () => {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      const { gas, gasPrice } = environment.contracts;
      this._loggingService.log('Using web3 detected from external source.');
      this._web3 = new Web3(web3.currentProvider);
      this._web3wrapper = new Web3Wrapper(web3.currentProvider, { gas, gasPrice });
    } else if (environment.w3HttpProvider !== '') {
      this._loggingService.log(`No web3 detected. Falling back to ${environment.w3HttpProvider}.`);
      this._web3 = new Web3(
        new Web3.providers.HttpProvider(environment.w3HttpProvider),
      );
      this._web3wrapper = new Web3Wrapper(
        new Web3.providers.HttpProvider(environment.w3HttpProvider),
      );
    } else {
      this._loggingService.log(`No web3 w3HttpProvider. Falling back to HDWalletProvider.`);
      this._web3 = new Web3(
        new HDWalletProvider(environment.infura.mnemonic, environment.infura.url),
      );
      this._web3wrapper = new Web3Wrapper(
        new HDWalletProvider(environment.infura.mnemonic, environment.infura.url),
      );
    }
  }

  get provider(): Web3 {
    return this._web3; // TODO: Get TypeChain to work with Web3Wrapper
  }

  get wrapper(): Web3Wrapper {
    return this._web3wrapper;
  }

  getAccounts(): Observable<string[]> {
    return from(this._web3wrapper.getAvailableAddressesAsync());
  }

  getAccountBalance(account): Observable<string> {
    const getBalance = bindCallback<string, BigNumber>(this._web3.eth.getBalance);
    return getBalance(account).pipe(
      map((result) => result[1]),
      map((balanceInWei: BigNumber) => this._web3.fromWei(balanceInWei, 'ether')),
      map((balanceInEth: BigNumber) => balanceInEth.toString()),
    );
  }

  getLatestBlock() {
    return this._web3wrapper.getBlockNumberAsync();
  }

}
