import 'jest';
import { BelongsToMany } from '../';

describe('belongstomany ', () => {
  it('loads', () => {
    const bt = new BelongsToMany({
      belongsToMany: 'name#id',
      entity: 'user',
      field: 'name',
      using: 'C',
    });
    expect(bt).toMatchSnapshot('raw');
    expect(bt.toObject()).toMatchSnapshot('toObject');
  });
});
