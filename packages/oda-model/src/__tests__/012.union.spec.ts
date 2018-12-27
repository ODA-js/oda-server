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
  it('dedupes', () => {
    const res = new Union({
      name: 'UNION',
      items: ['ITEM', 'Item', 'item', 'item', 'item'],
    });
    expect(res.metadata).toMatchObject(unionDefaultMetaInfo);
    expect(res.items.size).toBe(3);
  });
  it('merges', () => {
    const res1 = new Union({
      name: 'UNION',
      items: ['ITEM', 'Item2'],
    });
    const res2 = new Union({
      name: 'UNION',
      items: ['ITEM', 'Item1'],
    });

    const res = new Union({
      name: 'UNION',
      items: ['ITEM', 'Item'],
    });
    res.mergeWith(res1.toObject());
    res.mergeWith(res2.toObject());
    expect(res.items.size).toBe(4);
    expect(res.toObject()).toMatchSnapshot('merge');
  });
});
