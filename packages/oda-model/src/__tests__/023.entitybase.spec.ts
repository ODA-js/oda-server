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
  it('not serialize exact property', () => {
    const res = new EntityBase({ name: 'A', exact: true });
    expect(res.exact).toBeTruthy();
    expect((res.toObject() as any).exact).toBeUndefined();
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

  it('should deduplicates operations', () => {
    const res = new EntityBase({
      name: 'A',
      fields: [{ name: 'a', indexed: true }],
      operations: [
        {
          name: 'op1',
          args: [{ name: '1' }],
          payload: [{ name: 'result' }],
          actionType: 'readOne',
        },
        { name: 'op1', description: 'this is for description' } as any,
      ],
    });
    expect(res.operations.size).toBe(1);
  });
  it('should deduplicates fields', () => {
    const res = new EntityBase({
      name: 'A',
      fields: [
        { name: 'a', indexed: true },
        { name: 'a', description: 'field a description' },
      ],
    });
    //+1 for ID
    expect(res.fields.size).toBe(2);
  });
});

describe('Indexing', () => {
  it('should create index entry', () => {
    const res = new EntityBase({
      name: 'A',
      fields: [{ name: 'a', indexed: true }],
      metadata: {
        persistence: {
          indexes: {
            coolIndex: {
              name: 'some',
              fields: {
                a: 'Asc',
              },
            },
          },
        },
      },
    });
    expect(res.metadata.persistence.indexes['a']).toMatchObject({
      name: 'a',
      fields: { a: 'Asc' },
      options: { sparse: false, unique: false },
    });
    expect(res).toMatchSnapshot('indexed entity');
  });
  it('should create unique index entry', () => {
    const res = new EntityBase({
      name: 'A',
      fields: [{ name: 'a', identity: true }],
    });
    expect(res.metadata.persistence.indexes['a']).toMatchObject({
      name: 'a',
      fields: { a: 'Asc' },
      options: { sparse: false, unique: true },
    });
  });
  // тут тестируем
  it('should create complex index entry', () => {
    const res = new EntityBase({
      name: 'A',
      fields: [{ name: 'a', indexed: 'text' }, { name: 'b', indexed: 'text' }],
    });
    expect(res.toObject()).toMatchSnapshot('complex index text');
    expect(res.metadata.persistence.indexes['text']).toMatchObject({
      name: 'text',
      fields: { a: 'text', b: 'text' },
      options: { sparse: false },
    });
  });
  it('should create complex unique index entry 1', () => {
    const res = new EntityBase({
      name: 'A',
      fields: [{ name: 'a', identity: 'ab ' }, { name: 'b', identity: 'ab' }],
    });
    expect(res.toObject()).toMatchSnapshot('complex identity index text');
    expect(res.metadata.persistence.indexes['ab']).toMatchObject({
      name: 'ab',
      fields: { a: 'Asc', b: 'Asc' },
      options: { sparse: false, unique: true },
    });
  });

  it('should create text index type from `text` string', () => {
    const res = new EntityBase({
      name: 'A',
      fields: [
        { name: 'd', indexed: 'text ab d' }, //
      ],
    });

    expect(res.metadata.persistence.indexes['text']).toMatchObject({
      name: 'text',
      fields: { d: 'text' },
      options: { sparse: false, unique: false },
    });
  });

  it('should create complex unique index entry 2', () => {
    const res = new EntityBase({
      name: 'A',
      fields: [
        { name: 'a', identity: 'ab', indexed: 'text' },
        { name: 'b', indexed: 'ab' }, // not mentioned as identity
        { name: 'c', indexed: 'text' },
        { name: 'd', indexed: 'text ab d' }, //
      ],
    });
    const a = res.fields.get('a');
    if (a) {
      expect(a.identity).toBe(true);
      expect(a.indexed).toBe(true);
    }
    const b = res.fields.get('b');
    if (b) {
      expect(b.identity).toBe(false);
      expect(b.indexed).toBe(true);
    }
    const c = res.fields.get('c');
    if (c) {
      expect(c.identity).toBe(false);
      expect(c.indexed).toBe(true);
      expect((c.indexes.text.type = 'text'));
    }
    const d = res.fields.get('d');
    if (d) {
      expect(d.identity).toBe(false);
      expect(d.indexed).toBe(true);
    }
    expect(res.toObject()).toMatchSnapshot('complex identity index text');
    // тут
    expect(res.metadata.persistence.indexes['ab']).toMatchObject({
      name: 'ab',
      fields: { a: 'Asc', b: 'Asc', d: 'Asc' },
      options: { sparse: false, unique: true },
    });
    expect(res.metadata.persistence.indexes['text']).toMatchObject({
      name: 'text',
      fields: { a: 'text', c: 'text', d: 'text' },
      options: { sparse: false, unique: false },
    });
    expect(res.metadata.persistence.indexes['d']).toMatchObject({
      name: 'd',
      fields: { d: 'Asc' },
      options: { sparse: false, unique: false },
    });
  });
});
