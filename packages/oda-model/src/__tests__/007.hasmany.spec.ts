import 'jest';
import {
  HasMany,
  hasManyDefaultMetaInfo,
  hasManyDefaultInput,
} from '../hasmany';
import { merge } from 'lodash';

describe('haOne', () => {
  it('default', () => {
    const res = new HasMany({ hasMany: 'A#' });
    expect(res.metadata).toMatchObject(hasManyDefaultMetaInfo);
    expect(res.toObject()).toMatchObject(
      merge({ hasMany: 'id@A#id' }, hasManyDefaultInput),
    );
    expect(res.toObject()).toMatchSnapshot('toObject');
  });
});
