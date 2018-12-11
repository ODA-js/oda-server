import 'jest';

import {
  ArrayToHash,
  HashToArray,
  ArrayToMap,
  HashToMap,
  MapToArray,
  MapToHash,
} from '../types';

describe('helpers', () => {
  it('ArrayToMap', () => {
    expect(
      ArrayToMap([{ name: '1', other: '2' }, { name: '2', other: '2' }]),
    ).toMatchSnapshot('ArrayToMap');
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
        value => ({ ...value, name: undefined }),
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
});
