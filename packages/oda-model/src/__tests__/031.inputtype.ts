import 'jest';
import { MetaData } from '../element';
import { InputType, InputTypeDefaultMetaInfo } from '../inputtype';

describe('InputType', () => {
  it('default', () => {
    const res = new InputType({ name: 'A' });
    expect(res[MetaData]).toMatchObject(InputTypeDefaultMetaInfo);
    expect(res.toObject()).toMatchSnapshot('toObject');
  });
  it('default has no Singular', () => {
    const res = new InputType({ name: 'Species' });
    expect(res.plural).toBe('AllSpecies');
    expect(res.toObject()).toMatchSnapshot('toObject');
  });
  it('should Capitalize name', () => {
    const res = new InputType({ name: 'entity' });
    expect(res.name).toBe('entity');
  });
  it('take TitlePlural from Plural name', () => {
    const res = new InputType({ name: 'Child', plural: 'Children  ' });
    expect(res.plural).toBe('Children');
    expect(res.titlePlural).toBe('Children');
  });
  it('should take Plural Title plural', () => {
    const res = new InputType({
      name: 'Species',
      plural: 'Species',
      titlePlural: 'All Species',
    });
    expect(res.titlePlural).toBe('All Species');
    expect(res.plural).toBe('AllSpecies');
  });

  it('creates specified field with specified types', () => {
    const res = new InputType({
      name: 'A',
      fields: [
        {
          name: 'A',
        },
        {
          name: 'B',
          type: { type: 'enum', name: 'BBB' },
        },
      ],
    });
    expect(res.fields.size).toBe(2);
    expect(res.fields.get('A')).not.toBeUndefined();
    const a = res.fields.get('a');
    if (a) {
      expect(a.modelType).toBe('input-simple-field');
    }
    expect(res.fields.get('A')).not.toBeUndefined();
    const b = res.fields.get('B');
    if (b) {
      expect(b.modelType).toBe('input-enum-field');
    }
    expect(res).toMatchSnapshot('object with fields');
    expect(res.toObject()).toMatchSnapshot('toObject with fields');
  });

  it('should pass entity name to fields', () => {
    const res = new InputType({
      name: 'A',
      fields: [{ name: 'a' }],
    });
    const a = res.fields.get('a');
    if (a) {
      expect(a.metadata.entity).toBe('A');
      expect(a.metadata.order).toBe(0);
    }
  });

  it('should deduplicates fields', () => {
    const res = new InputType({
      name: 'A',
      fields: [
        { name: 'a' },
        { name: 'a', description: 'field a description' },
      ],
    });
    expect(res.fields.size).toBe(1);
  });
});
