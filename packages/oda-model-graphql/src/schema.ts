export default {
  name: 'Education',
  packages: [],
  entities: [
    {
      name: 'MediaFiles',
      fields: {
        title: {},
        description: { type: 'RichText' },
        reference: {
          type: { type: 'entity', name: 'Image', multiplicity: 'one' },
        },
        catalog: {
          type: { type: 'entity', name: 'Image', multiplicity: 'many' },
        },
      },
      metadata: { UI: { listName: ['title'] } },
    },
    {
      implements: ['IFile'],
      name: 'Image',
      embedded: true,
      fields: {
        width: { type: 'Int' },
        height: { type: 'Int' },
        src: { inheritedFrom: 'IFile', identity: true },
        type: { inheritedFrom: 'IFile' },
        path: { inheritedFrom: 'IFile' },
        name: { inheritedFrom: 'IFile' },
      },
      metadata: { UI: { listName: ['src'] } },
    },
    {
      abstract: true,
      name: 'IFile',
      fields: {
        src: { identity: true },
        type: {},
        path: {},
        name: {},
      },
      metadata: { UI: { listName: ['src'] } },
    },
    {
      name: 'User',
      description: 'Person role to be user identified in the system',
      fields: {
        userName: { identity: true },
        password: {},
        isAdmin: { type: 'Boolean' },
        isSystem: { type: 'Boolean' },
        enabled: { type: 'Boolean' },
      },
      metadata: { UI: { listName: ['userName'] } },
    },
  ],
  mutations: [],
  queries: [],
  enums: [],
};
