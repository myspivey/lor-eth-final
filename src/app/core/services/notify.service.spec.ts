import { inject, TestBed } from '@angular/core/testing';

import { NotifyService } from './notify.service';

describe('NotifyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotifyService]
    });
  });

  test('should be created', inject([NotifyService], (service: NotifyService) => {
    expect(service).toBeTruthy();
  }));
});
