import 'jest';
import { RelationBase } from '../relationbase';

describe('RelationBase', () => {
  it('creates', () => {
    const res = new RelationBase({});
    expect(res).toMatchObject({ metadata: {} });
    expect(res.toObject()).toMatchSnapshot('toObject');
  });
});
