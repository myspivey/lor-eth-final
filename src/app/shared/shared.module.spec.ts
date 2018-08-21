import { SharedModule } from './shared.module';

describe('SharedModule', () => {
  let sharedModule: SharedModule;

  beforeEach(() => {
    sharedModule = new SharedModule();
  });

  test('should create an instance', () => {
    expect(sharedModule).toBeTruthy();
  });
});
