import 'jest';
import { Directive } from '..';

describe('directive', () => {
  it('loads', () => {
    const res = new Directive({
      name: 'ReadOnly',
      on: ['FIELD'],
      args: [
        {
          name: 'field',
          type: 'string',
          required: false,
          defaultValue: 'default',
        },
      ],
    });
    expect(res).toMatchSnapshot('raw');
    expect(res.toObject()).toMatchSnapshot('toObject');
  });
});
