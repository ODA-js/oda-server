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
                  delete: ['11'],
                  create: ['12'],
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
                  delete: ['23'],
                  create: ['24'],
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
});
