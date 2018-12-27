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
  it('dedupes items when it is strings', () => {
    const res = new Enum({
      name: 'location',
      items: ['WORK', 'WORK', 'HOME'],
    });
    expect(res.items.size).toBe(2);
  });
  it('dedupes items when it is objects and string', () => {
    const res = new Enum({
      name: 'location',
      items: ['WORK', { name: 'WORK' }, 'HOME'],
    });
    expect(res.items.size).toBe(2);
  });
  it('dedupes items when it is objects ', () => {
    const res = new Enum({
      name: 'location',
      items: [
        { name: 'WORK', description: 'work place' },
        { name: 'WORK' },
        { name: 'WORK', value: '_WORK_' },
        'HOME',
      ],
    });
    expect(res.items.size).toBe(2);
    const item = res.items.get('WORK');
    expect(item).not.toBeUndefined();
    if (item) {
      expect(item.description).toBe('work place');
      expect(item.value).toBe('_WORK_');
    }
  });
  it('merges', () => {
    const res1 = new Enum({
      name: 'location1',
      items: ['WORK1', 'WORK', 'HOME'],
    });
    const res2 = new Enum({
      name: 'localtion2',
      items: [
        'WORK2',
        { name: 'WORK', description: 'just work location' },
        'HOME',
      ],
    });
    const res = new Enum({
      name: 'location',
      items: ['WORK', 'WORK', 'HOME'],
    });
    expect(res.name).toBe('location');
    res.mergeWith(res1.toObject());
    res.mergeWith(res2.toObject());
    expect(res.items.size).toBe(4);
    expect(res.toObject()).toMatchSnapshot('merge');
  });
});
