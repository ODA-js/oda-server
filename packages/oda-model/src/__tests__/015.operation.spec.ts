import 'jest';
import { Operation, operationDefaultMetaInfo } from '../operation';

describe('Operation', () => {
  it('default', () => {
    const res = new Operation({
      name: 'updateUser',
      entity: 'User',
      actionType: 'create',
      payload: [{ name: 'result', multiplicity: 'many' }],
      args: [{ name: 'id' }, { name: 'fields', multiplicity: 'many' }],
    });
    expect(res.metadata).toMatchObject(operationDefaultMetaInfo);
    expect(res.toObject()).toMatchSnapshot('toObject');
  });
});
