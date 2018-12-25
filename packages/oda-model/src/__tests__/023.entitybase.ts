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
          entity: 'User',
          actionType: 'create',
          payload: [{ name: 'result', multiplicity: 'many' }],
          args: [{ name: 'id' }, { name: 'fields', multiplicity: 'many' }],
        },
      ],
    });
    expect(res.fields.size).toBe(1);
    expect(res.fields.get('id')).not.toBeUndefined();

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
    expect(res.fields.get('b')).not.toBeUndefined();
    expect(res.fields.get('c')).not.toBeUndefined();
    expect(res.fields.get('d')).not.toBeUndefined();
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
});
