import 'jest';

import { EntityInput } from '../entity';

describe('Merge Entities', () => {
  it('megres', () => {
    const only_system_user = ['system', 'user'];
    const only_system = ['system'];
    const read_only_field = {
      acl: {
        read: only_system_user,
        update: only_system,
      },
    };
    const read_update_field = {
      acl: {
        read: only_system_user,
        update: only_system_user,
      },
    };

    const read_only_relation = {
      acl: {
        read: only_system_user,
        update: only_system,
        create: only_system,
        delete: only_system,
      },
    };

    const read_update_relation = {
      acl: {
        read: only_system_user,
        update: only_system_user,
        create: only_system,
        delete: only_system,
      },
    };

    const read_update_create_relation = {
      acl: {
        read: only_system_user,
        update: only_system_user,
        create: only_system_user,
        delete: only_system,
      },
    };

    const full_access_relation = {
      acl: {
        read: only_system_user,
        update: only_system_user,
        create: only_system_user,
        delete: only_system_user,
      },
    };

    const initial: EntityInput = {
      name: 'A',
      fields: [
        { name: '_A', type: 'String' },
        { name: 'A', identity: true },
        { name: 'B', indexed: true },
        { name: 'C', indexed: true, identity: true },
        {
          name: 'D',
          type: { type: 'enum', multiplicity: 'many', name: 'ENUM1' },
          indexed: true,
          identity: true,
        },
        {
          name: 'E',
          type: { type: 'enum', multiplicity: 'one', name: 'ENUM1' },
          indexed: true,
          identity: true,
        },
        {
          name: 'F',
          type: {
            type: 'entity',
            name: 'ENT1',
            multiplicity: 'many',
          },
        },
        {
          name: 'F',
          type: {
            type: 'entity',
            name: 'ENT1',
            multiplicity: 'one',
          },
        },
        {
          name: 'G',
          relation: {
            belongsTo: 'ENT1#',
          },
        },
        {
          name: 'H',
          relation: {
            belongsToMany: 'ENT1#',
            using: 'ENT1_A#',
          },
        },
        {
          name: 'I',
          relation: {
            hasOne: 'ENT1#',
          },
        },
        {
          name: 'J',
          relation: {
            hasMany: 'ENT1#',
          },
        },
      ],
      metadata: { UI: { listName: ['userName'] } },
    };
  });
});
