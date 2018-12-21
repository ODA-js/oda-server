import 'jest';
import { Enum } from '../enum';
import { enumItemDefaultMetaInfo } from '../enumItem';

describe('Enum', () => {
  it('default', () => {
    const res = new Enum({
      name: 'LOCATION',
      items: [{ name: 'HOME' }, { name: 'WORk' }],
    });
    expect(res.metadata).toMatchObject(enumItemDefaultMetaInfo);
    expect(res.toObject()).toMatchSnapshot('toObject');
  });
});
