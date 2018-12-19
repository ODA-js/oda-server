import 'jest';
import schema from './schema';
import { MetaModel, IModel } from '../metamodel';

describe('Metadata', () => {
  it('load model', () => {
    expect(() => new MetaModel(schema)).not.toThrow();
  });
  it('builds', () => {
    const model = new MetaModel(schema);
    expect(model).toMatchSnapshot('schema');
  });
});
