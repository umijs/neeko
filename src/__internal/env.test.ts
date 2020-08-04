import { isTestEnv } from './env';

describe('__internal/env', () => {
  it('should in test env', () => {
    expect(isTestEnv()).toBeTruthy();
  });
});
