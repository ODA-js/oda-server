import 'jest';
import { Union, unionDefaultMetaInfo } from '../union';

describe('Union', () => {
  it('default', () => {
    const res = new Union({
      name: 'UNION',
      items: ['ITEM', 'Item', 'item'],
    });
    expect(res.metadata).toMatchObject(unionDefaultMetaInfo);
    expect(res.toObject()).toMatchSnapshot('toObject');
  });
});
