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
  it('kill dupes', () => {
    const res = new Operation({
      name: 'updateUser',
      entity: 'User',
      actionType: 'create',
      payload: [
        { name: 'result', multiplicity: 'many' },
        { name: 'result', description: 'simple description' },
      ],
      args: [
        { name: 'id' },
        { name: 'fields', multiplicity: 'many' },
        { name: 'fields', description: 'simple description' },
      ],
    });
    expect(res.args.size).toBe(2);
    expect(res.args.get('fields')).toHaveProperty(
      'description',
      'simple description',
    );
    expect(res.payload.size).toBe(1);
    expect(res.payload.get('result')).toHaveProperty(
      'description',
      'simple description',
    );
  });
});
