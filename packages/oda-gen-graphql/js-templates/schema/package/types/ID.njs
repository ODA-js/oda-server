<#@ alias 'types/ID' #>
<#@ chunks "$$$main$$$" -#>
<#- chunkStart(`./_Types/ID.ts`); -#>
import { Scalar } from '../common';
import gql from '../../../../node_modules/graphql-tag';
import { Kind } from 'graphql';

export default new Scalar({
  schema: gql`
    scalar ID
  `,
  resolver: {
    serialize: String,
    parseValue: String,
    parseLiteral: ast => {
      return ast.kind === Kind.STRING ? ast.value : null;
    },
  },
});
