import 'jest';
import { ObjectTypeField } from '../objecttypefield';
import { EnumType } from '../types';
import { ObjectTypeInput } from '../objecttype';

describe('ObjectTypeField', () => {
  it('default', () => {
    const res = new ObjectTypeField({
      name: 'A',
    });
    expect(res.name).toBe('A');
    expect(res.type).toMatchObject({ name: 'String', type: 'scalar' });
    expect(res.modelType).toBe('argument-simple-field');
    expect(res.multiplicity).toBe('one');
    expect(res).toMatchSnapshot('default');
    expect(res.toObject()).toMatchSnapshot('toObject');
  });

  it('default value only for persistent fields', () => {
    const res = new ObjectTypeField({
      name: 'A',
      defaultValue: 'NAME_OF_DEFAULT_VALUE',
    });
    expect(res.name).toBe('A');
    expect(res.defaultValue).toBe('NAME_OF_DEFAULT_VALUE');
  });

  it('required by default is false', () => {
    const res = new ObjectTypeField({
      name: 'A',
    });
    expect(res.name).toBe('A');
    expect(res.required).toBeFalsy();
  });
  it('required is setup', () => {
    const res = new ObjectTypeField({
      name: 'A',
      required: true,
    });
    expect(res.name).toBe('A');
    expect(res.required).toBeTruthy();
    expect(res.toObject()).toMatchSnapshot('required');
  });

  it('default enum', () => {
    const res = new ObjectTypeField({
      name: 'A',
      type: {
        type: 'enum',
        multiplicity: 'many',
        name: 'ENUM1',
      },
    });
    expect(res.name).toBe('A');
    expect(res.modelType).toBe('argument-enum-field');
    expect(res.multiplicity).toBe('many');
    expect((res.type as EnumType).type).toBe('enum');
    expect(res).toMatchSnapshot('default');
    expect(res.toObject()).toMatchSnapshot('toObject');
  });

  it('default enum list', () => {
    const res = new ObjectTypeField({
      name: 'A',
      multiplicity: 'many',
      type: {
        type: 'enum',
        name: 'ENUM1',
      },
    });
    expect(res.name).toBe('A');
    expect(res.modelType).toBe('argument-enum-field');
    expect(res.multiplicity).toBe('many');
    expect((res.type as EnumType).type).toBe('enum');
    expect((res.type as EnumType).multiplicity).toBe('many');
  });
  it('default enum multiplicity == one', () => {
    const res = new ObjectTypeField({
      name: 'A',
      type: {
        type: 'enum',
        name: 'ENUM1',
      },
    });
    expect(res.name).toBe('A');
    expect(res.modelType).toBe('argument-enum-field');
    expect(res.multiplicity).toBe('one');
    expect((res.type as EnumType).type).toBe('enum');
    expect((res.type as EnumType).multiplicity).toBe('one');
    expect(res).toMatchSnapshot('default');
    expect(res.toObject()).toMatchSnapshot('toObject');
  });
  it('ObjectType as field type ObjectType', () => {
    const res = new ObjectTypeField({
      name: 'A',
      type: {
        name: 'one',
        fields: [
          {
            name: 'a',
          },
          {
            name: 'b',
          },
          {
            name: 'c',
            type: {
              name: 'C',
              fields: [
                {
                  name: 'c1',
                },
              ],
            },
          },
        ],
      } as ObjectTypeInput,
    });
    expect(res).toMatchSnapshot('object');
    expect(res.toObject()).toMatchSnapshot('toObject');
  });
});
