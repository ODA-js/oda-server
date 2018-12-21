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
    expect(res.toObject()).toMatchSnapshot('toObject');
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

  it('update Name', () => {
    debugger;
    const res = new RelationBase({
      embedded: true,
      entity: 'AA',
      field: 'F',
      opposite: 'F',
    });
    expect(res.name).toBe('AARelatedToFs');
    expect(res.fullName).toBe('AARelatedToFs');
    expect(res.shortName).toBe('Fs');
    expect(res.normalName).toBe('AAFs');
    expect(res.embedded).toBe(true);
    expect(res.entity).toBe('AA');
    expect(res.field).toBe('F');
    expect(res.opposite).toBe('f');
    expect(res.verb).toBe('RelatedTo');
    expect(res.single).toBe(undefined);
    expect(res.stored).toBe(undefined);
    expect(() => res.ref).toThrow();
  });
  it('opposite is settable', () => {
    debugger;
    const res = new RelationBase({
      embedded: true,
      entity: 'AA',
      field: 'F',
    });
    expect(res.opposite).toBe(undefined);
    expect(() => (res.opposite = 'F')).not.toThrow();
    expect(res.opposite).toBe('f');
  });
});
