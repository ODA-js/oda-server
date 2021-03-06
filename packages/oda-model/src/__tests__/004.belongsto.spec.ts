import 'jest';
import {
  BelongsTo,
  belongsToDefaultMetaInfo,
  belongsToDefaultInput,
} from '../belongsto';
import { merge } from 'lodash';

describe('BelongsTo', () => {
  it('default', () => {
    const res = new BelongsTo({ belongsTo: 'A#' });
    expect(res.metadata.persistence).toMatchObject(
      belongsToDefaultMetaInfo.persistence,
    );
    expect(res.toObject()).toMatchObject(
      merge({ belongsTo: 'A#id' }, belongsToDefaultInput),
    );
    expect(res.toObject()).toMatchSnapshot('toObject');
  });
  it('create by default', () => {
    const res = new BelongsTo({
      entity: 'AA',
      field: 'a',
      belongsTo: 'A#id',
    });
    expect(res.modelType).toBe('BelongsTo');
    expect(res.verb).toBe('BelongsTo');
    expect(res.ref).toMatchObject({ entity: 'A', field: 'id' });
    expect(res.entity).toBe('AA');
    expect(res.field).toBe('a');
    expect(res.metadata.persistence.single).toBe(true);
    expect(res.metadata.persistence.stored).toBe(true);
    expect(res.name).toBe('AABelongsToA');
  });
});
