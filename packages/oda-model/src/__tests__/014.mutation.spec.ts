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
  it('kill dupes for args & for payload', () => {
    const res = new Mutation({
      name: 'LoginUser',
      args: [
        { name: 'login' },
        {
          name: 'login',
          description: 'login field description',
          title: 'some title',
        },
      ],
      payload: [
        { name: 'token' },
        { name: 'token', description: 'this is the token' },
      ],
    });
    expect(res.args.size).toBe(1);
    expect(res.args.get('login')).toHaveProperty('title', 'some title');
    expect(res.payload.size).toBe(1);
    expect(res.payload.get('token')).toHaveProperty(
      'description',
      'this is the token',
    );
  });
});
