import { TestBed } from '@angular/core/testing';

import { CoreModule } from './core.module';

describe('CoreModule', () => {
  let coreModule: CoreModule;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CoreModule],
    });

    coreModule = TestBed.get(CoreModule);
  });

  test('should create an instance', () => {
    expect(coreModule).toBeTruthy();
  });
});
