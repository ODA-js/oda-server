import 'jest';
import { Mutation, mutationDefaultMetaInfo } from '../mutation';

describe('Mutation', () => {
  it('default', () => {
    const res = new Mutation({
      name: 'LoginUser',
      args: [{ name: 'login' }, { name: 'password' }],
      payload: [{ name: 'token' }],
    });
    expect(res.name).toBe('loginUser');
    expect(res.metadata).toMatchObject(mutationDefaultMetaInfo);
    expect(res.toObject()).toMatchSnapshot('toObject');
  });
});
