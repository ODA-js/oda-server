import 'jest';
import {
  RelationBase,
  relationBaseDefaultMetaInfo,
  relationBaseDefaultInput,
} from '../relationbase';
import { MetaData } from '../element';

describe('RelationBase', () => {
  it('creates', () => {
    const res = new RelationBase({});
    expect(res[MetaData]).toMatchObject(relationBaseDefaultMetaInfo);
    expect(res.toObject()).toMatchObject(relationBaseDefaultInput);
  });
  it('create base fields', () => {
    const res = new RelationBase({
      name: 'A',
      embedded: true,
      entity: 'AA',
      field: 'F',
      opposite: 'F',
    });
    expect(res.name).toBe('A');
    expect(res.embedded).toBe(true);
    expect(res.entity).toBe('AA');
    expect(res.field).toBe('F');
    expect(res.opposite).toBe('f');
  });
});
