import 'jest';

import {
  ArrayToHash,
  HashToArray,
  ArrayToMap,
  HashToMap,
  MapToArray,
  MapToHash,
  INamed,
  isArrayScalar,
  getTypeName,
  stringToScalar,
} from '../types';

import { merge } from 'lodash';

describe('helpers', () => {
  it('ArrayToMap', () => {
    expect(
      ArrayToMap([{ name: '1', other: '2' }, { name: '2', other: '2' }]),
    ).toMatchSnapshot('ArrayToMap');
    expect(
      ArrayToMap<INamed>(
        [{ key: '1', other: '2' } as any, { key: '2', other: '2' } as any],
        (value: any) => ({ name: value.key, ...value }),
      ),
    ).toMatchSnapshot('ArrayToMap with process');

    const res = ArrayToMap(
      [{ name: 'a', title: 'one' }, { name: 'a', other: '10' }, { name: 'b' }],
      undefined,
      (obj, src) => merge(obj, src),
    );
    expect(res).toHaveProperty('size', 2);
    expect(res.get('a')).toHaveProperty('title', 'one');
    expect(res.get('a')).toHaveProperty('other', '10');
  });

  it('HashToMap', () => {
    expect(
      HashToMap({
        1: {
          other: 1,
        },
        2: {
          other: 2,
        },
      }),
    ).toMatchSnapshot('HashToMap');
    expect(
      HashToMap(
        {
          1: {
            other: 1,
          },
          2: {
            other: 2,
          },
        },
        (key, value) => ({ name: key, ...value }),
      ),
    ).toMatchSnapshot('HashToMap with process');
  });
  it('HashToArray', () => {
    expect(
      HashToArray({
        1: {
          other: 1,
        },
        2: {
          other: 2,
        },
      }),
    ).toMatchSnapshot('HashToArray');

    expect(
      HashToArray(
        {
          1: {
            other: 1,
          },
          2: {
            other: 2,
          },
        },
        (name, value) => ({ ...value, name }),
      ),
    ).toMatchSnapshot('HashToArray with process');
  });
  it('ArrayToHash', () => {
    expect(
      ArrayToHash([{ name: '1', other: '2' }, { name: '2', other: '2' }]),
    ).toMatchSnapshot('ArrayToHash');
  });
  it('MapToHash', () => {
    expect(
      MapToHash(
        new Map([
          ['1', { name: '2', other: '1' }],
          ['3', { name: '3', other: 3 }],
        ]),
        (_name, value) => ({ ...value, name: undefined } as any),
      ),
    ).toMatchSnapshot('MapToHash');
    expect(
      MapToHash(
        new Map([
          ['key 1', { name: '2', other: '1' }],
          ['key 2', { name: '3', other: 3 }],
        ]),
      ),
    ).toMatchSnapshot('MapToHash-Values');
    expect(
      MapToHash(
        new Map([
          ['key 1', { name: '2', other: '1' } as any],
          ['key 2', { name: '3', other: 3 } as any],
        ]),
        (name, value) => ({ name, ...value }),
      ),
    ).toMatchSnapshot('MapToHash-Values with process');
  });
  it('MapToArray', () => {
    expect(
      MapToArray(
        new Map([
          ['1', { name: '2', other: '1' }],
          ['3', { name: '3', other: 3 }],
        ]),
        (key, value) => ({ ...value, name: key }),
      ),
    ).toMatchSnapshot('MapToArray');
    expect(
      MapToArray(
        new Map([
          ['key 1', { name: '2', other: '1' }],
          ['key 2', { name: '3', other: 3 }],
        ]),
      ),
    ).toMatchSnapshot('MapToArray-Values');
  });
  it('isArrayScalar', () => {
    expect(isArrayScalar('string')).toBeFalsy();
    expect(isArrayScalar('string[]')).toBeTruthy();
    expect(isArrayScalar('string[4]')).toBeTruthy();
    expect(isArrayScalar('[string]')).toBeTruthy();
  });
  it('getTypeName', () => {
    expect(getTypeName('string')).toBe('string');
    expect(getTypeName('string[]')).toBe('string');
    expect(getTypeName('string[4]')).toBe('string');
    expect(getTypeName('[string]')).toBe('string');
  });
  it('stringToScalar', () => {
    expect(stringToScalar('string')).toMatchSnapshot();
    expect(stringToScalar('String')).toMatchSnapshot();
    expect(stringToScalar('strIng')).toMatchSnapshot();
    expect(stringToScalar('Int')).toMatchSnapshot();
    expect(stringToScalar('int')).toMatchSnapshot();
    expect(stringToScalar('InteGer')).toMatchSnapshot();
    expect(stringToScalar('float')).toMatchSnapshot();
    expect(stringToScalar('Double')).toMatchSnapshot();
    expect(stringToScalar('Id')).toMatchSnapshot();
    expect(stringToScalar('ID')).toMatchSnapshot();
    expect(stringToScalar('booleAn')).toMatchSnapshot();
    expect(stringToScalar('boolean')).toMatchSnapshot();
    expect(stringToScalar('Url')).toMatchSnapshot();
    expect(stringToScalar('uRl')).toMatchSnapshot();

    expect(stringToScalar('String[]')).toMatchSnapshot();
    expect(stringToScalar('Int[]')).toMatchSnapshot();
    expect(stringToScalar('Float[]')).toMatchSnapshot();
    expect(stringToScalar('ID[]')).toMatchSnapshot();
    expect(stringToScalar('Boolean[]')).toMatchSnapshot();
    expect(stringToScalar('Url[]')).toMatchSnapshot();

    expect(stringToScalar('String[1]')).toMatchSnapshot();
    expect(stringToScalar('Int[2]')).toMatchSnapshot();
    expect(stringToScalar('Float[3]')).toMatchSnapshot();
    expect(stringToScalar('ID[4]')).toMatchSnapshot();
    expect(stringToScalar('Boolean[5]')).toMatchSnapshot();
    expect(stringToScalar('Url[6]')).toMatchSnapshot();

    expect(stringToScalar('[String]')).toMatchSnapshot();
    expect(stringToScalar('[Int]')).toMatchSnapshot();
    expect(stringToScalar('[Float]')).toMatchSnapshot();
    expect(stringToScalar('[ID]')).toMatchSnapshot();
    expect(stringToScalar('[Boolean]')).toMatchSnapshot();
    expect(stringToScalar('[Url]')).toMatchSnapshot();
  });
});
