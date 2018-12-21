import 'jest';
import { Scalar, scalarDefaultMetaInfo } from '../scalar';

describe('Scalar', () => {
  it('default', () => {
    const res = new Scalar({ name: 'JSON' });
    expect(res.metadata).toMatchObject(scalarDefaultMetaInfo);
    expect(res.toObject()).toMatchSnapshot('toObject');
  });
});
