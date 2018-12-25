import 'jest';
import { EntityBase, entityBaseDefaultMetaInfo } from '../entitybase';
import { MetaData } from '../element';
import { Field } from '../field';

describe('EntityBase', () => {
  it('default', () => {
    const res = new EntityBase({ name: 'A' });
    expect(res[MetaData]).toMatchObject(entityBaseDefaultMetaInfo);
    expect(res.toObject()).toMatchSnapshot('toObject');
  });
  it('default has no Singular', () => {
    const res = new EntityBase({ name: 'Species' });
    expect(res.plural).toBe('AllSpecies');
    expect(res.toObject()).toMatchSnapshot('toObject');
  });
  it('should Capitalize name', () => {
    const res = new EntityBase({ name: 'entity' });
    expect(res.name).toBe('Entity');
  });
  it('take TitlePlural from Plural name', () => {
    const res = new EntityBase({ name: 'Child', plural: 'Children  ' });
    expect(res.plural).toBe('Children');
    expect(res.titlePlural).toBe('Children');
  });
  it('should take Plural Title plural', () => {
    const res = new EntityBase({
      name: 'Species',
      plural: 'Species',
      titlePlural: 'All Species',
    });
    expect(res.titlePlural).toBe('All Species');
    expect(res.plural).toBe('AllSpecies');
  });
  it('should take operations', () => {
    const res = new EntityBase({
      name: 'A',
      operations: [
        {
          name: 'updateUser',
          actionType: 'create',
          payload: [{ name: 'result', multiplicity: 'many' }],
          args: [{ name: 'id' }, { name: 'fields', multiplicity: 'many' }],
        },
      ],
    });
    expect(res.fields.size).toBe(1);
    expect(res.fields.get('id')).not.toBeUndefined();
    const id = res.fields.get('id');
    if (id) {
      expect(id.order).not.toBeUndefined();
    }
    expect(res.operations.size).toBe(1);
    expect(res.toObject()).toMatchSnapshot('toObject with operations');
  });

  it('creates specified field with specified types', () => {
    const res = new EntityBase({
      name: 'A',
      fields: [
        {
          name: 'A',
        },
        {
          name: 'B',
          type: { type: 'enum', name: 'BBB' },
        },
        {
          name: 'C',
          type: { type: 'entity', name: 'CCC' },
        },
        {
          name: 'D',
          relation: {
            hasOne: 'CCC#',
          },
        },
      ],
    });
    expect(res.fields.size).toBe(5);
    expect(res.fields.get('id')).not.toBeUndefined();
    expect(res.fields.get('a')).not.toBeUndefined();
    const a = res.fields.get('a');
    if (a) {
      expect(a.modelType).toBe('simple-field');
    }
    expect(res.fields.get('b')).not.toBeUndefined();
    const b = res.fields.get('b');
    if (b) {
      expect(b.modelType).toBe('enum-field');
    }
    expect(res.fields.get('c')).not.toBeUndefined();
    const c = res.fields.get('c');
    if (c) {
      expect(c.modelType).toBe('entity-field');
    }
    expect(res.fields.get('d')).not.toBeUndefined();
    const d = res.fields.get('d');
    if (d) {
      expect(d.modelType).toBe('relation-field');
    }
    expect(res).toMatchSnapshot('object with fields');
    expect(res.toObject()).toMatchSnapshot('toObject with fields');
  });

  it('should accept non default identity field "id"', () => {
    const res = new EntityBase({ name: 'A', fields: [{ name: 'id' }] });
    expect(res.fields.size).toBe(1);
    expect(res.fields.get('id')).not.toBeUndefined();
    expect((res.fields.get('id') as Field).toObject()).toMatchSnapshot(
      'non default id fields',
    );
  });
  it('should accept non default identity field "_id"', () => {
    const res = new EntityBase({ name: 'A', fields: [{ name: '_id' }] });
    expect(res.fields.size).toBe(1);
    expect(res.fields.get('_id')).not.toBeUndefined();
    expect((res.fields.get('_id') as Field).toObject()).toMatchSnapshot(
      'non default _id fields',
    );
  });
  it('should pass entity name to children "operations" && "fields"', () => {
    const res = new EntityBase({
      name: 'A',
      fields: [{ name: 'a' }],
      operations: [{ name: 'op', args: [], payload: [], actionType: 'update' }],
    });
    const op = res.operations.get('op');
    const a = res.fields.get('a');
    if (op) {
      expect(op.metadata.entity).toBe('A');
      expect(op.metadata.order).toBe(0);
    }
    if (a) {
      expect(a.metadata.entity).toBe('A');
      expect(a.metadata.order).toBe(0);
    }
  });

  it('should store relation-fields names in relations prop', () => {
    const res = new EntityBase({
      name: 'A',
      fields: [
        {
          name: 'a',
          relation: {
            hasOne: 'AAA#',
          },
        },
      ],
    });
    expect(res.relations.has('a')).toBeTruthy();
  });
});

describe('Indexing', () => {
  it('should create index entry', () => {
    const res = new EntityBase({
      name: 'A',
      fields: [{ name: 'a', indexed: true }],
    });
    expect(res.metadata.persistence.indexes['a']).toMatchObject({
      name: 'a',
      fields: { a: 1 },
      options: { sparse: true },
    });
  });
  it('should create unique index entry', () => {
    const res = new EntityBase({
      name: 'A',
      fields: [{ name: 'a', identity: true }],
    });
    expect(res.metadata.persistence.indexes['a']).toMatchObject({
      name: 'a',
      fields: { a: 1 },
      options: { sparse: true, unique: true },
    });
  });
  it('should create complex index entry', () => {
    const res = new EntityBase({
      name: 'A',
      fields: [{ name: 'a', indexed: 'text' }, { name: 'b', indexed: 'text' }],
    });
    expect(res.toObject()).toMatchSnapshot('complex index text');
    expect(res.metadata.persistence.indexes['text']).toMatchObject({
      name: 'text',
      fields: { a: 1, b: 1 },
      options: { sparse: true },
    });
  });
  it('should create complex unique index entry', () => {
    const res = new EntityBase({
      name: 'A',
      fields: [{ name: 'a', identity: 'ab ' }, { name: 'b', identity: 'ab' }],
    });
    expect(res.toObject()).toMatchSnapshot('complex identity index text');
    expect(res.metadata.persistence.indexes['ab']).toMatchObject({
      name: 'ab',
      fields: { a: 1, b: 1 },
      options: { sparse: true, unique: true },
    });
  });
  it('should create complex unique index entry', () => {
    const res = new EntityBase({
      name: 'A',
      fields: [
        { name: 'a', identity: 'ab', indexed: 'text' },
        { name: 'b', indexed: 'ab' }, // not mentioned as identity
        { name: 'c', indexed: 'text' },
      ],
    });
    expect(res.toObject()).toMatchSnapshot('complex identity index text');
    expect(res.metadata.persistence.indexes['ab']).toMatchObject({
      name: 'ab',
      fields: { a: 1, b: 1 },
      options: { sparse: true, unique: true },
    });
    expect(res.metadata.persistence.indexes['text']).toMatchObject({
      name: 'text',
      fields: { a: 1, c: 1 },
      options: { sparse: true },
    });
  });
});
