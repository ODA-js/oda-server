export default {
  graphql: true,
  ts: true,
  schema: false,
  ui: true,
  package: {
    mutation: {
      entry: true,
      types: true,
      resolver: true,
      index: true,
    },
    entity: {
      index: true,
      type: {
        entry: true,
        enums: true,
        resolver: true,
      },
      query: {
        entry: true,
        resolver: true,
      },
      viewer: {
        entry: true,
        resolver: true,
      },
      dataPump: {
        queries: true,
        config: true,
      },
      UI: {
        queries: true,
        forms: true,
        index: true,
      },
      mutations: {
        entry: true,
        types: true,
        resolver: true,
      },
      subscriptions: {
        entry: true,
        types: true,
        resolver: true,
      },
      data: {
        adapter: {
          connector: true,
          schema: true,
        },
        types: {
          model: true,
        },
      },
      connections: {
        mutations: {
          entry: true,
          types: true,
          resolver: true,
        },
        types: true,
      },
    },
    enums: {
      UI: true,
    },
    packages: {
      typeIndex: true,
      mutationIndex: true,
    },
  },
};
