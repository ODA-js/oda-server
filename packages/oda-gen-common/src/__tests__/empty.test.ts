import 'jest';
import { GQLModule } from '../types//empty';

describe('override by name', () => {
  class UserHooks extends GQLModule {
    protected _name = 'UserHooks';
    protected _hooks = [
      {
        'RootMutation.createUser': 1,
        'RootMutation.updateUser': 1,
      },
    ];
  }

  class UserOriginal extends GQLModule {
    protected _name = 'User';
    protected _queryEntry = {
      queryEntry: [`original`],
    };
    protected _viewerEntry = {
      viewerEntry: [`original`],
    };
    protected _resolver = {
      User: {
        id: 'UserOriginal',
        isAdmin: true,
        toBeRemoved: true,
      },
    };
    protected _hooks = [
      {
        'RootMutation.createUser': false,
        'RootMutation.updateUser': true,
      },
    ];
  }

  class User extends GQLModule {
    protected _name = 'User';
    protected _queryEntry = {
      queryEntry: [`override`],
    };
    protected _viewerEntry;
    protected _resolver = {
      User: {
        id: 'User',
        isSystem: true,
        toBeRemoved: null,
      },
    };
    protected _hooks = [
      {
        'RootMutation.createUser': true,
        'RootMutation.updateUser': true,
      },
    ];
  }

  class FirstPackage extends GQLModule {
    protected _name = 'First';
    protected _composite = [new UserHooks({}), new UserOriginal({})];
  }

  class SecondPackage extends GQLModule {
    protected _name = 'Second';
    protected _composite = [new User({})];
  }

  class MainSchema extends GQLModule {
    protected _name = 'Main';
    protected _composite = [new FirstPackage({}), new SecondPackage({})];
  }

  it('override objects', () => {
    const schema = new MainSchema({});
    schema.build();
    expect(schema.resolver.User).not.toBeNull();
    expect(schema.resolver.User).not.toBeUndefined();
    expect(schema.resolver.User).toMatchObject({
      id: 'User',
      isSystem: true,
      isAdmin: true,
    });
    expect(schema.queryEntry).not.toBeNull();
    expect(schema.queryEntry).not.toBeUndefined();
    expect(schema).toMatchSnapshot();
    expect(schema.hooks.length).toBe(2);
  });

  it('override strings', () => {
    const schema = new MainSchema({});
    schema.build();
    expect(schema.queryEntry).not.toBeNull();
    expect(schema.queryEntry).not.toBeUndefined();
    expect(schema.queryEntry).toMatchObject(['override']);
  });

  it('remove items if needed', () => {
    const schema = new MainSchema({});
    schema.build();
    expect(schema.resolver.User.toBeRemoved).toBeNull();
  });

  it('remove any entiy if needed', () => {
    const schema = new MainSchema({});
    schema.build();
    expect(schema.viewerEntry.length).toBe(0);
  });
});

describe('override in module', () => {
  class UserHooks extends GQLModule {
    protected _name = 'UserHooks';
    protected _hooks = [
      {
        'RootMutation.createUser': 1,
        'RootMutation.updateUser': 1,
      },
    ];
  }

  class UserOriginal extends GQLModule {
    protected _name = 'User';
    protected _queryEntry = {
      queryEntry: [`original`],
    };
    protected _resolver = {
      User: {
        id: 'UserOriginal',
        isAdmin: true,
        toBeRemoved: true,
      },
    };
    protected _hooks = [
      {
        'RootMutation.createUser': true,
        'RootMutation.updateUser': true,
      },
    ];
  }

  class User extends GQLModule {
    protected _extend = [new UserOriginal({})];
    protected _composite = [new UserHooks({})];
    protected _name = 'User';
    protected _queryEntry = {
      queryEntry: [`override`],
    };
    protected _resolver = {
      User: {
        id: 'User',
        isSystem: true,
        toBeRemoved: null,
      },
    };
    protected _hooks = [
      {
        'RootMutation.createUser': false,
        'RootMutation.updateUser': true,
      },
    ];
  }

  it('override objects', () => {
    const schema = new User({});
    schema.build();
    expect(schema.resolver.User).not.toBeNull();
    expect(schema.resolver.User).not.toBeUndefined();
    expect(schema.resolver.User).toMatchObject({
      id: 'User',
      isSystem: true,
      isAdmin: true,
      toBeRemoved: null,
    });
    expect(schema.queryEntry).not.toBeNull();
    expect(schema.hooks.length).toBe(2);
    expect(schema).toMatchSnapshot();
  });

  it('override strings', () => {
    const schema = new User({});
    schema.build();
    expect(schema.queryEntry).not.toBeNull();
    expect(schema.queryEntry).not.toBeUndefined();
    expect(schema.queryEntry).toMatchObject(['override']);
  });

  it('remove items if needed', () => {
    const schema = new User({});
    schema.build();
    // expect(schema.resolver.User).toBeNull();
    expect(schema.resolver.User.toBeRemoved).toBeNull();
  });
});
