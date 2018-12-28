import 'jest';

import { filter } from '../getFilter';
describe('Filter', () => {
  it('should omit fields', () => {
    const f = filter('[a,b,a]');
    expect(f('a')).toBeTruthy();
    expect(f('b')).toBeTruthy();
    expect(f('c')).toBeFalsy();
  });
  it('should all fields', () => {
    const f = filter('*');
    expect(f('a')).toBeTruthy();
    expect(f('b')).toBeTruthy();
    expect(f('c')).toBeTruthy();
  });
  it('should all fields', () => {
    const f = filter('^[a,b,d]');
    expect(f('a')).toBeFalsy();
    expect(f('b')).toBeFalsy();
    expect(f('d')).toBeFalsy();
    expect(f('c')).toBeTruthy();
  });
  it('should allow specific field', () => {
    const f = filter('a');
    expect(f('a')).toBeTruthy();
    expect(f('b')).toBeFalsy();
    expect(f('d')).toBeFalsy();
    expect(f('c')).toBeFalsy();
  });
});
