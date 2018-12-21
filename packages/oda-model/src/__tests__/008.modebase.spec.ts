import 'jest';
import {
  ModelBase,
  modelBaseDefaultInput,
  modelBaseDefaultMetaInfo,
} from '../modelbase';
import { merge } from 'lodash';

describe('ModeBase', () => {
  it('default', () => {
    const res = new ModelBase({ name: 'A' });
    expect(res.metadata).toMatchObject(modelBaseDefaultMetaInfo);
    expect(res.toObject()).toMatchSnapshot('toObject');

    expect(res.toObject()).toMatchObject(
      merge({ name: 'A' }, modelBaseDefaultInput),
    );
  });
  it('do not change input name, title and descriptions start letters, but only trim it', () => {
    const res = new ModelBase({
      name: ' A ',
      title: ' a ',
      description: ' b ',
    });
    expect(res.name).toBe('A');
    expect(res.title).toBe('a');
    expect(res.description).toBe('b');
  });
});
