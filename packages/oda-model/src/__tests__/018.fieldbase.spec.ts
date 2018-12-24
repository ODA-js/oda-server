import 'jest';
import { FieldBase } from '../fieldbase';

describe('FieldBase', () => {
  it('default', () => {
    const res = new FieldBase({
      name: 'FieldName',
      derived: true,
      args: [{ name: 'demoARG' }],
      inheritedFrom: '_B',
      persistent: true,
      entity: 'B',
      order: 1,
      required: true,
      identity: true,
      indexed: true,
      type: 'SomString',
    });
    expect(res.name).toBe('fieldName');
    expect(res.toObject()).toMatchSnapshot('toObject clean');
    expect(res).toMatchSnapshot('internal');
  });
});
