import 'jest';
import { fromGlobalId, toGlobalId } from '../globalIds';

describe('globalId', () => {
  it('convert global id from global id', () => {
    const id = toGlobalId('user', '1');
    const id2 = toGlobalId('user', id);
    expect(id).toEqual(id2);
  });
  it('convert global id from id', () => {
    const id = fromGlobalId('1').id;
    const id1 = toGlobalId('user', '1');
    const id2 = fromGlobalId(id1).id;
    expect(id).toEqual(id2);
  });
});
