import 'jest';
import { MetaModel } from '../metamodel';
import { EntityInput } from '../entity';
import { MixinInput } from '../mixin';

describe('MetaModel', () => {
  it('default', () => {
    const res = new MetaModel({ name: 'a' });
    expect(res.name).toBe('A');
    expect(res.toObject()).toMatchSnapshot('default');
  });

  it('kill dupes for packages & hooks', () => {
    const res = new MetaModel({
      name: 'a',
      hooks: [{ name: 'hook' }, { name: 'hook' }],
      packages: ['a', 'b', 'a'],
    });
    expect(res.name).toBe('A');
    expect(res.hooks.size).toBe(1);
    expect(res.packages.size).toBe(2);
  });

  it('discovers packages', () => {
    const res = new MetaModel({
      name: 'A',
      packages: ['01'],
      entities: [
        {
          name: '1',
          metadata: {
            acl: {
              create: ['02'],
              delete: ['03'],
              readMany: ['04'],
              readOne: ['05'],
              update: ['06'],
            },
          },
          fields: [
            {
              name: 'a',
              metadata: { acl: { read: ['07'], update: ['08'] } },
            },
            {
              name: 'b',
              metadata: {
                acl: {
                  read: ['09'],
                  update: ['10'],
                  addTo: ['11'],
                  removeFrom: ['12'],
                },
              },
              relation: {
                hasMany: 'a#',
              },
            },
          ],
          operations: [
            {
              name: 'c',
              metadata: { acl: { execute: ['13'] } },
              args: [{ name: 'arg' }],
              payload: [{ name: 'payload' }],
            },
          ],
        } as EntityInput,
      ],
      mixins: [
        {
          name: '2',
          metadata: {
            acl: {
              create: ['14'],
              delete: ['15'],
              readMany: ['16'],
              readOne: ['17'],
              update: ['18'],
            },
          },
          fields: [
            {
              name: 'a',
              metadata: { acl: { read: ['19'], update: ['20'] } },
            },
            {
              name: 'b',
              metadata: {
                acl: {
                  read: ['21'],
                  update: ['22'],
                  addTo: ['23'],
                  removeFrom: ['24'],
                },
              },
              relation: {
                hasMany: 'a#',
              },
            },
          ],
          operations: [
            {
              name: 'c',
              metadata: { acl: { execute: ['25'] } },
              args: [{ name: 'arg' }],
              payload: [{ name: 'payload' }],
            },
          ],
        } as MixinInput,
      ],
      mutations: [
        {
          name: 'd',
          metadata: { acl: { execute: ['26'] } },
          args: [{ name: 'arg' }],
          payload: [{ name: 'payload' }],
        },
      ],
      queries: [
        {
          name: 'e',
          metadata: { acl: { execute: ['27'] } },
          args: [{ name: 'arg' }],
          payload: [{ name: 'payload' }],
        },
      ],
    });
    expect(res.discoverPackages()).toMatchSnapshot('packages');
  });
  it('expand packages', () => {
    const res = new MetaModel({
      name: 'A',
      packages: [
        {
          name: '01',
          entities: [
            {
              name: '1',
              fields: [
                {
                  name: 'a',
                },
                {
                  name: 'b',
                  relation: {
                    hasMany: 'a#',
                  },
                },
              ],
              operations: [
                {
                  name: 'create',
                  args: [{ name: 'arg' }],
                  payload: [{ name: 'payload' }],
                  actionType: 'create',
                },
              ],
            } as EntityInput,
          ],
          mutations: [
            {
              name: 'd',
              args: [{ name: 'arg' }],
              payload: [{ name: 'payload' }],
            },
          ],
          queries: [
            {
              name: 'e',
              args: [{ name: 'arg' }],
              payload: [{ name: 'payload' }],
            },
          ],
        },
      ],
      mixins: [
        {
          name: '2',
          metadata: {
            acl: {
              create: ['14'],
              delete: ['15'],
              readMany: ['16'],
              readOne: ['17'],
              update: ['18'],
            },
          },
          fields: [
            {
              name: 'a',
              metadata: { acl: { read: ['19'], update: ['20'] } },
            },
            {
              name: 'b',
              metadata: {
                acl: {
                  read: ['21'],
                  update: ['22'],
                  addTo: ['23'],
                  removeFrom: ['24'],
                },
              },
              relation: {
                hasMany: 'a#',
              },
            },
          ],
          operations: [
            {
              name: 'c',
              metadata: { acl: { execute: ['25'] } },
              args: [{ name: 'arg' }],
              payload: [{ name: 'payload' }],
            },
          ],
        } as MixinInput,
      ],
    });
    expect(res.discoverPackages()).toMatchSnapshot('packages');
    expect(res.toObject()).toMatchSnapshot('metamodel');
  });
});
