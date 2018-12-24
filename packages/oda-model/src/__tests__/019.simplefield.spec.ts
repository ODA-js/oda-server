import 'jest';
import { SimpleField } from '../simplefield';
import { EnumType } from '../types';

describe('SimpleField', () => {
  it('default', () => {
    const res = new SimpleField({
      name: 'A',
    });
    expect(res.name).toBe('a');
    expect(res.type).toBe('string');
    expect(res.modelType).toBe('simple-field');
    expect(res.list).toBeFalsy();
    expect(res).toMatchSnapshot('default');
    expect(res.toObject()).toMatchSnapshot('toObject');
  });

  it('default value only for persistent fields', () => {
    const res = new SimpleField({
      name: 'A',
      defaultValue: 'NAME_OF_DEFAULT_VALUE',
    });
    expect(res.name).toBe('a');
    expect(res.defaultValue).toBe('NAME_OF_DEFAULT_VALUE');
  });

  it('default value not for persistent fields', () => {
    const res = new SimpleField({
      name: 'A',
      derived: true,
      defaultValue: 'NAME_OF_DEFAULT_VALUE',
    });
    expect(res.name).toBe('a');
    expect(res.defaultValue).toBeUndefined();
  });

  it('allow persistent derived', () => {
    const res = new SimpleField({
      name: 'A',
      derived: true,
      persistent: true,
      defaultValue: 'NAME_OF_DEFAULT_VALUE',
    });
    expect(res.name).toBe('a');
    expect(res.defaultValue).toBeUndefined();
    expect(res.persistent).toBeTruthy();
    expect(res.derived).toBeTruthy();
  });

  it('default enum', () => {
    const res = new SimpleField({
      name: 'A',
      type: {
        type: 'enum',
        multiplicity: 'many',
        name: 'ENUM1',
      },
    });
    expect(res.name).toBe('a');
    expect(res.modelType).toBe('enum-field');
    expect(res.list).toBeTruthy();
    expect((res.type as EnumType).type).toBe('enum');
    expect(res).toMatchSnapshot('default');
    expect(res.toObject()).toMatchSnapshot('toObject');
  });
  it('default enum multiplicity == one', () => {
    const res = new SimpleField({
      name: 'A',
      type: {
        type: 'enum',
        name: 'ENUM1',
      },
    });
    expect(res.name).toBe('a');
    expect(res.modelType).toBe('enum-field');
    expect(res.list).toBeFalsy();
    expect((res.type as EnumType).type).toBe('enum');
    expect((res.type as EnumType).multiplicity).toBe('one');
    expect(res).toMatchSnapshot('default');
    expect(res.toObject()).toMatchSnapshot('toObject');
  });
});
