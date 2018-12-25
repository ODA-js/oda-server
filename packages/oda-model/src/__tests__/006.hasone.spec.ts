import 'jest';
import { HasOne, hasOneDefaultMetaInfo, hasOneDefaultInput } from '../hasone';
import { merge } from 'lodash';

describe('hasOne', () => {
  it('default', () => {
    const res = new HasOne({ hasOne: 'A#' });
    expect(res.metadata).toMatchObject(hasOneDefaultMetaInfo);
    expect(res.toObject()).toMatchObject(
      merge({ hasOne: 'id@A#id' }, hasOneDefaultInput),
    );
    expect(res.modelType).toBe('HasOne');
    expect(res.verb).toBe('HasOne');
    expect(res.toObject()).toMatchSnapshot('toObject');
  });
});
