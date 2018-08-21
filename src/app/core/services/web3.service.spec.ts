import { inject, TestBed } from '@angular/core/testing';

import { Web3Service } from './web3.service';

describe('Web3Service', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Web3Service]
    });
  });

  test('should be created', inject([Web3Service], (service: Web3Service) => {
    expect(service).toBeTruthy();
  }));
});
