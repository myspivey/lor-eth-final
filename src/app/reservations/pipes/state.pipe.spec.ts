import { StatePipe } from './state.pipe';

describe('StatePipe', () => {
  test('create an instance', () => {
    const pipe = new StatePipe();
    expect(pipe).toBeTruthy();
  });
});
