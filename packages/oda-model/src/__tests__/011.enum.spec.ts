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
      name: 'localtion',
      items: ['WORK', 'WORK', 'HOME'],
    });
    expect(res.items.size).toBe(2);
  });
  it('dedupes items when it is objects and string', () => {
    const res = new Enum({
      name: 'localtion',
      items: ['WORK', { name: 'WORK' }, 'HOME'],
    });
    expect(res.items.size).toBe(2);
  });
  it('dedupes items when it is objects ', () => {
    const res = new Enum({
      name: 'localtion',
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
});
