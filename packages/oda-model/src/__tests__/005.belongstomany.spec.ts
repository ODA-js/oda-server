import 'jest';
import {
  BelongsToMany,
  belongsToManyDefaultMetaInfo,
  belongsToManyDefaultInput,
} from '../belongstomany';
import { merge } from 'lodash';

describe('belongsToMany', () => {
  it('default', () => {
    const res = new BelongsToMany({ belongsToMany: 'A#id', using: 'AB#' });
    expect(res.metadata.persistence).toMatchObject(
      belongsToManyDefaultMetaInfo.persistence,
    );
    expect(res.toObject()).toMatchObject(
      merge(
        { belongsToMany: 'id@A#id', using: 'id@AB#id' },
        belongsToManyDefaultInput,
      ),
    );
    expect(res.modelType).toBe('BelongsToMany');
    expect(res.verb).toBe('BelongsToMany');
    expect(res.toObject()).toMatchSnapshot('toObject');
  });
});
