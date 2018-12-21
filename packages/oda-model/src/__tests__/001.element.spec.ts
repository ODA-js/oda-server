import 'jest';
import { Element, elementDefaultInput, elementDefaultMetaInfo } from '..';
import { IValidator } from '../validation';

describe('element', () => {
  it('empty', () => {
    const res = new Element({});
    expect(res.metadata).toMatchObject(elementDefaultMetaInfo);
    expect(res.toObject()).toMatchObject(elementDefaultInput);
  });
  it('create', () => {
    const res = new Element({
      metadata: { some: 'data' },
    });
    expect(res.metadata.some).toBe('data');
  });
  it('run validator', () => {
    const res = new Element({ metadata: { some: 'data' } });
    const mockValidator: IValidator = {
      check: jest.fn(() => []),
    };
    res.validate(mockValidator);
    expect(mockValidator.check).toBeCalledTimes(1);
  });

  it('updateWith merges metadata', () => {
    const res = new Element({
      metadata: { some: 'data' } as { [key: string]: any },
    });
    res.updateWith({ metadata: { someother: 'data' } });
    expect(res.metadata.some as any).toBe('data');
    expect(res.metadata.someother as any).toBe('data');
  });

  it('updateWith merges clean', () => {
    const res = new Element({
      metadata: { some: 'data' } as { [key: string]: any },
    });
    res.updateWith({ metadata: { some: null } });
    expect(res.metadata.some as any).toBe(null);
    res.updateWith({ metadata: null });
    expect(res.metadata).toMatchObject({});
  });

  it('run to Object', () => {
    const res = new Element({
      metadata: { some: 'data' },
    });
    expect(res.toObject()).toMatchObject({
      metadata: { some: 'data' },
    });
  });
});
