import 'jest';
import { Query, queryDefaultMetaInfo } from '../query';

describe('Query', () => {
  it('default', () => {
    const res = new Query({
      name: 'GetAllUsersThat',
      args: [{ name: 'disabled', type: 'Boolean', multiplicity: 'one' }],
      payload: [{ name: 'id', required: true, multiplicity: 'many' }],
    });
    expect(res.metadata).toMatchObject(queryDefaultMetaInfo);
    expect(res.toObject()).toMatchSnapshot('toObject');
  });
  it('default', () => {
    const res = new Query({
      name: 'GetAllUsersThat',
      args: [
        { name: 'disabled', type: 'Boolean', multiplicity: 'one' },
        { name: 'disabled', description: 'some' },
      ],
      payload: [
        { name: 'id', required: true, multiplicity: 'many' },
        { name: 'id', description: 'other' },
      ],
    });
    expect(res.args.size).toBe(1);
    expect(res.args.get('disabled')).toHaveProperty('description', 'some');
    if (res.payload instanceof Map) {
      expect(res.payload.size).toBe(1);
      expect(res.payload.get('id')).toHaveProperty('description', 'other');
    } else {
      throw new Error('not Map as expected');
    }
  });
});
