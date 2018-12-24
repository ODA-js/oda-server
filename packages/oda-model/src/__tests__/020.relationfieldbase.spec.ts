import 'jest';
import { RelationFieldBase } from '../relationfieldbase';

describe('RelationFieldBase', () => {
  it('default', () => {
    const res = new RelationFieldBase({ name: 'defaultField' });
    expect(res.toObject()).toMatchSnapshot('default');
  });
});
