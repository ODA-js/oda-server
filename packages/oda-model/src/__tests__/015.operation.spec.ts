import 'jest';
import { Operation, operationDefaultMetaInfo } from '../operation';
import { Entity } from '../entity';

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
  it('default actionType', () => {
    const res = new Operation({
      name: 'updateUser',
      entity: 'User',
      payload: [{ name: 'result', multiplicity: 'many' }],
      args: [{ name: 'id' }, { name: 'fields', multiplicity: 'many' }],
    } as any);
    expect(res.metadata).toMatchObject(operationDefaultMetaInfo);
    expect(res.toObject()).toMatchSnapshot('toObject');
  });
  it('default actionType', () => {
    const res = new Operation({
      name: 'updateUser',
      entity: 'User',
      payload: [{ name: 'result', multiplicity: 'many' }],
      args: [{ name: 'id' }, { name: 'fields', multiplicity: 'many' }],
    } as any);
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
    if (res.payload instanceof Map) {
      expect(res.payload.size).toBe(1);
      expect(res.payload.get('result')).toHaveProperty(
        'description',
        'simple description',
      );
    } else {
      throw new Error('Must be of Map type');
    }
  });
  it('toQuery', () => {
    const resMany = new Operation({
      name: 'ReadMany',
      entity: 'User',
      actionType: 'readMany',
    });
    const entity = new Entity({ name: 'User' });

    expect(resMany.toQuery(entity)).toMatchSnapshot('ReadManyToQuery');
    const resOne = new Operation({
      name: 'ReadOne',
      entity: 'User',
      actionType: 'readOne',
    });
    expect(resOne.toQuery(entity)).toMatchSnapshot('ReadManyToQuery');
  });
});
