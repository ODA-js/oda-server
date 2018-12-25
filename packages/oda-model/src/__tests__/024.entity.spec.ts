import 'jest';
import { Entity } from '../entity';

describe('Entity', () => {
  it('default', () => {
    const res = new Entity({
      name: 'a',
      embedded: true,
      abstract: true,
      implements: ['IA'],
    });
    expect(res.toObject()).toMatchSnapshot('toObject');
  });
});
