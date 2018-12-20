import 'jest';
import { Element } from '..';

describe('element', () => {
  it('loads', () => {
    const res = new Element({
      metadata: { some: 'data' },
    });
    expect(res.hasOwnProperty);
  });
});
