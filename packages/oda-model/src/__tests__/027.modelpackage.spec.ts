import 'jest';
import { ModelPackage } from '../modelpackage';

describe('ModePackage', () => {
  it('default', () => {
    const res = new ModelPackage({
      name: 'a',
    });
    expect(res.name).toBe('A');
    expect(res.abstract).toBe(false);
    expect(res.defaultAccess).toBe('allow');
    expect(res.toObject()).toMatchSnapshot('default');
  });
  it('should setup all features well', () => {
    const res = new ModelPackage({
      name: 'a',
      abstract: true,
      defaultAccess: 'prohibit',
      extends: ['b'],
    });

    expect(res.name).toBe('A');
    expect(res.toObject()).toMatchSnapshot('all features default');
  });
});
