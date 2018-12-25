import 'jest';
import { Mixin } from '../mixin';

describe('Mixin', () => {
  it('default', () => {
    const res = new Mixin({ name: 'IMix  ', fields: [{ name: 'id' }] });
    expect(res.toObject()).toMatchSnapshot('default');
  });
});
