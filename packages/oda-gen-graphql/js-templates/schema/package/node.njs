<#@ chunks "$$$main$$$" -#>
<#@ alias 'node-interface' #>

<#- chunkStart(`./node.ts`); -#>
import gql from 'graphql-tag';
import { Interface, Schema, Query, getWithType } from './common';

export const Node = new Interface({
  schema: gql`
    interface Node {
      id: ID!
    }
  `,
  resolver: (obj, context, info) => {
    if (obj && obj.__type__) {
      return info.schema.getType(obj.__type__);
    } else {
      return null;
    }
  },
});

export default new Schema({
  name: 'INode',
  items: [Node],
});
