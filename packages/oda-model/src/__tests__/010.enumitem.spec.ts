import 'jest';
import { EnumItem, enumItemDefaultMetaInfo } from '../enumItem';

describe('enumItem', () => {
  it('default', () => {
    const res = new EnumItem({ name: 'ITEM', value: 'I_T_E_M' });
    expect(res.metadata).toMatchObject(enumItemDefaultMetaInfo);
    expect(res.toObject()).toMatchSnapshot('toObject');
  });
  it('default value is name', () => {
    const res = new EnumItem({ name: 'ITEM' });
    expect(res.value).toBe('ITEM');
    expect(res.toObject().value).toBeUndefined();
  });
});
