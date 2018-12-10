import 'jest';
import { BelongsTo } from '../src';

describe('belongsto ', () => {
  it('loads', () => {
    const bt = new BelongsTo({
      belongsTo: 'name:#id',
      entity: 'user',
      field: 'name',
    });
    expect(bt).toMatchSnapshot();
  });
});
