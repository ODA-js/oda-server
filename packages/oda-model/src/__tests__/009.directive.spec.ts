import 'jest';
import { Directive, directiveDefaultMetaInfo } from '../directive';

describe('Directive', () => {
  it('default', () => {
    const res = new Directive({
      name: 'readOnly',
      on: ['ENUM'],
      args: [
        {
          name: 'message',
          required: false,
          defaultValue: 'THIS PROP IS READ ONLY',
        },
      ],
    });
    expect(res.metadata).toMatchObject(directiveDefaultMetaInfo);
    expect(res.toObject()).toMatchSnapshot('toObject');
  });
  it('name by default not touched', () => {
    const res = new Directive({ name: 'AbT', on: ['ENUM'] });
    expect(res.name).toBe('AbT');
  });
});
