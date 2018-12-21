import 'jest';
import { Args, argsDefaultMetaInfo } from '../args';

describe('Args', () => {
  it('default', () => {
    const res = new Args({ name: 'field' });
    expect(res.metadata).toMatchObject(argsDefaultMetaInfo);
    expect(res.toObject()).toMatchSnapshot('default');
  });
});
