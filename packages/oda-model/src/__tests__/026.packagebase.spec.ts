import 'jest';
import { ModelPackageBase } from '../packagebase';

describe('PackageBase', () => {
  it('should capitalize name', () => {
    const res = new ModelPackageBase({ name: 'a' });
    expect(res.name).toBe('A');
  });

  it('should update package with all the things', () => {
    const res = new ModelPackageBase({
      name: 'A',
      entities: [{ name: 'entity' }],
      enums: [{ name: 'enum', items: ['value'] }],
      scalars: [{ name: 'scalar' }],
      directives: [{ name: 'directive', on: ['FIELD'] }],
      mixins: [{ name: 'mixin' }],
      unions: [{ name: 'union', items: ['enum', 'entity'] }],
      mutations: [
        {
          name: 'mutation',
          payload: [{ name: 'payload' }],
          args: [{ name: 'arg' }],
        },
      ],
      queries: [
        {
          name: 'mutation',
          payload: [{ name: 'payload' }],
          args: [{ name: 'arg' }],
        },
      ],
    });
    expect(res.toObject()).toMatchSnapshot('toObject');
  });
});
