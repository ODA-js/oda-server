import 'jest';
import { EntityReference } from '../entityreference';

describe('EntityReference', () => {
  it('empty string', () => {
    const ref = new EntityReference('');
    expect(ref).toMatchSnapshot();
  });
  it('creates from full string', () => {
    const ref = new EntityReference('me@A#id');
    expect(ref.backField).toBe('me');
    expect(ref.entity).toBe('A');
    expect(ref.field).toBe('id');
  });
  it('creates from short string', () => {
    const ref = new EntityReference('A#');
    expect(ref.backField).toBe('');
    expect(ref.entity).toBe('A');
    expect(ref.field).toBe('id');
  });
  it('creates from short string', () => {
    const ref = new EntityReference('A');
    expect(ref.backField).toBe('');
    expect(ref.entity).toBe('A');
    expect(ref.field).toBe('id');
  });
  it('creates from short string', () => {
    const ref = new EntityReference('me@A#');
    expect(ref.backField).toBe('me');
    expect(ref.entity).toBe('A');
    expect(ref.field).toBe('id');
  });
  it('creates from short object', () => {
    const ref = new EntityReference({ entity: 'A' });
    expect(ref.backField).toBe('');
    expect(ref.entity).toBe('A');
    expect(ref.field).toBe('id');
  });
  it('toString', () => {
    const ref = new EntityReference({ entity: 'A' });
    expect(ref.toString()).toBe('A#id');
  });
});
