import 'jest';
import { Query, queryDefaultMetaInfo } from '../query';

describe('Query', () => {
  it('default', () => {
    const res = new Query({
      name: 'GetAllUsersThat',
      args: [{ name: 'disabled', type: 'boolean', multiplicity: 'one' }],
      payload: [{ name: 'id', required: true, multiplicity: 'many' }],
    });
    expect(res.metadata).toMatchObject(queryDefaultMetaInfo);
    expect(res.toObject()).toMatchSnapshot('toObject');
  });
});
