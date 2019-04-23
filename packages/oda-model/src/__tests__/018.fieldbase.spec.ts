import 'jest';
import {
  FieldBase,
  fieldBaseDefaultMetaInfo,
  fieldBaseDefaultInput,
} from '../fieldbase';
import { merge } from 'lodash';

describe('FieldBase', () => {
  it('default 0', () => {
    const res = new FieldBase({ name: 'a' });
    expect(res.metadata).toMatchObject(fieldBaseDefaultMetaInfo);
    expect(res.toObject()).toMatchObject(
      merge({ name: 'a' }, fieldBaseDefaultInput),
    );
  });
  it('default', () => {
    const res = new FieldBase({
      name: 'FieldName',
      derived: true,
      args: [{ name: 'demoARG' }],
      inheritedFrom: '_B',
      persistent: true,
      entity: 'B',
      order: 1,
      required: true,
      identity: true,
      indexed: true,
      type: 'SomString',
    });
    expect(res.name).toBe('fieldName');
    expect(res.toObject()).toMatchSnapshot('toObject clean');
    expect(res).toMatchSnapshot('internal');
  });

  it('identity make indexed', () => {
    const res = new FieldBase({ name: 'field', identity: true });
    expect(res).toMatchSnapshot('identity');
    expect(res.toObject()).toMatchObject({
      name: 'field',
      metadata: {
        persistence: {
          indexed: true,
          identity: true,
          indexes: {
            field: {
              name: 'field',
              sort: 'Asc',
              type: 'unique',
            },
          },
        },
      },
    });
  });

  it('should kill dupes by merging them', () => {
    const res = new FieldBase({
      name: 'FieldName',
      args: [
        { name: 'demoARG' },
        { name: 'demoARG', description: 'description for args' },
      ],
    });
    expect(res.args.size).toBe(1);
  });

  it('should create text index type from text string', () => {
    debugger;
    const res = new FieldBase(
      { name: 'd', indexed: 'text ab d' }, //
    );

    expect(res.metadata.persistence.indexes['text']).toMatchObject({
      name: 'text',
      sort: 'Asc',
      sparse: undefined,
      type: 'text',
    });
  });
});
