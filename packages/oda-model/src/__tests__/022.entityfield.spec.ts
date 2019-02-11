import 'jest';
import { EntityField } from '../entityfield';

describe('EntityField', () => {
  it('default', () => {
    const res = new EntityField({
      name: 'A',
      type: { type: 'entity', name: 'b' },
    });
    expect(res.type.multiplicity).toBe('one');
    expect(res.relation.verb).toBe('HasOne');
    expect(res.toObject()).toMatchSnapshot('default');
    expect(res).toMatchSnapshot('default');
  });
  it('default many', () => {
    const res = new EntityField({
      name: 'A',
      multiplicity: 'many',
      type: { type: 'entity', name: 'b' },
    });
    expect(res.type.multiplicity).toBe('many');
    expect(res.relation.verb).toBe('HasMany');
    expect(res.toObject()).toMatchSnapshot('default');
    expect(res).toMatchSnapshot('default');
  });
});
