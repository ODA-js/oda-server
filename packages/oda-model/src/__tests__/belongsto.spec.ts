import 'jest';
import { BelongsTo } from '../';

describe('belongsto ', () => {
  it('loads', () => {
    const bt = new BelongsTo({
      belongsTo: 'A#',
      entity: 'B',
      field: 'a',
    });
  });
});
