
import { passport } from 'oda-api-common';
import RegisterConnectors from '../../data/registerConnectors';
import { common } from 'oda-gen-graphql';

let { fillDefaults } = common.lib;

export class ViewerEntity extends common.types.GQLModule {
  protected _name = 'ViewerEntity';
  constructor(_args) {
    super(_args);

    this._resolver = fillDefaults(this._resolver, {
      Viewer: {
        id: ({ id }) => id,
      },
    });

    this._query = fillDefaults(this._query, {
      viewer: async (owner,
        args,
        context: { connectors: RegisterConnectors, user, db },
        info) => {
        return {
          id: context.user ? context.user.id : null,
        };
      },
    });

    this._viewer = fillDefaults(this._viewer, {
      Viewer: {
        _user: async (owner: { id: string }, args,
          context: { connectors: RegisterConnectors, user },
          info) => {
          if (owner.id !== undefined && owner.id !== null) {
            let result = await context.connectors.User.findOneById(owner.id);
            if (!result) {
              result = {
                ...context.user,
              };
              result.id = result.id;
            } else {
              result.id = result.id;
            }
            return {
              ...context.user,
              ...result,
              id: result.id,
            };
          } else {
            return null;
          }
        },
      },
    });

    this._queryEntry = fillDefaults(this._queryEntry, {
      'queryEntry': [`
        viewer: Viewer
      `],
    });

    this._viewerEntry = fillDefaults(this._viewerEntry, {
      'viewerEntry': [`
        # current User
        _user: User
      `],
    });
  }
}
