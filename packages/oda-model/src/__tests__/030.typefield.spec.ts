import 'jest';
import { RecordField } from '../recordfield';
import { EnumType } from '../types';

describe('RecordField', () => {
  it('default', () => {
    const res = new RecordField({
      name: 'A',
    });
    expect(res.name).toBe('A');
    expect(res.type).toBe('string');
    expect(res.modelType).toBe('argument-simple-field');
    expect(res.multiplicity).toBe('one');
    expect(res).toMatchSnapshot('default');
    expect(res.toObject()).toMatchSnapshot('toObject');
  });

  it('default value only for persistent fields', () => {
    const res = new RecordField({
      name: 'A',
      defaultValue: 'NAME_OF_DEFAULT_VALUE',
    });
    expect(res.name).toBe('A');
    expect(res.defaultValue).toBe('NAME_OF_DEFAULT_VALUE');
  });

  it('required by default is false', () => {
    const res = new RecordField({
      name: 'A',
    });
    expect(res.name).toBe('A');
    expect(res.required).toBeFalsy();
  });
  it('required is setup', () => {
    const res = new RecordField({
      name: 'A',
      required: true,
    });
    expect(res.name).toBe('A');
    expect(res.required).toBeTruthy();
    expect(res.toObject()).toMatchSnapshot('required');
  });

  it('default enum', () => {
    const res = new RecordField({
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
    const res = new RecordField({
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
    const res = new RecordField({
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
});
