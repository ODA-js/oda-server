import 'jest';
import {
  idField,
  uniqueField,
  mutableFields,
  storedRelations,
  getGeneralIndexedFields,
  getUniqueIndexedFields,
  ArgsFromTuples,
} from '../utils/queries';
import { SimpleField } from '../simplefield';
import { RelationField } from '../relationfield';
import { Entity } from '../entity';

describe('queries', () => {
  it('idField', () => {
    expect(
      idField(new SimpleField({ name: '_id', identity: true })),
    ).toBeTruthy();
    expect(
      idField(new SimpleField({ name: 'id', identity: true })),
    ).toBeTruthy();
  });
  it('uniqueField', () => {
    expect(
      uniqueField(new SimpleField({ name: 'abc', identity: true })),
    ).toBeTruthy();
  });
  it('mutableFields', () => {
    expect(
      mutableFields(
        new SimpleField({ name: 'abc', identity: true, persistent: true }),
      ),
    ).toBeTruthy();
  });
  it('storedRelations', () => {
    expect(
      storedRelations(
        new RelationField({
          name: 'PD',
          relation: {
            belongsTo: 'D#',
          },
        }),
      ),
    ).toBeTruthy();
  });
  it('indexes', () => {
    const entity = new Entity({
      name: 'ABC',
      fields: [
        {
          name: 'a',
          indexed: true,
        },
        {
          name: 'b',
          indexed: 'b',
        },
        {
          name: 'c',
          indexed: 'b',
        },
      ],
    });
    expect(
      ArgsFromTuples(getGeneralIndexedFields(entity), name => name),
    ).toMatchSnapshot('all ndexes');
  });
  it('unique indexes', () => {
    const entity = new Entity({
      name: 'ABC',
      fields: [
        {
          name: 'a',
          identity: true,
        },
        {
          name: 'b',
          identity: 'b',
        },
        {
          name: 'c',
          identity: 'b',
        },
      ],
    });
    expect(
      ArgsFromTuples(getUniqueIndexedFields(entity), name => name),
    ).toMatchSnapshot('all identity indexes');
  });
});
