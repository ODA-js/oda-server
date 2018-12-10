<#@ chunks "$$$main$$$" -#>
<#@ alias 'viewer' #>

<#- chunkStart(`./viewer.ts`); -#>
import gql from 'graphql-tag';
import {
  Type,
  Schema,
  Query,
  RegisterConnectors,
  getWithType,
} from './common';

export const Viewer = new Type({
  schema: gql`
    type Viewer {
      id: ID!
      _user: User
    }
  `,
  resolver: {
    id: ({ id }) => id,
    _user: async (
      owner: { id: string },
      args,
      context: { connectors: RegisterConnectors; user },
      info,
    ) => {
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

export const viewer = new Query({
  schema: gql`
    extend type RootQuery {
      viewer: Viewer
    }
  `,
});

export default new Schema({
  name: 'Viewer',
  items: [Viewer, viewer],
});
