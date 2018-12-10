<#@ alias 'types/PageInfo' #>
<#@ chunks "$$$main$$$" -#>
<#- chunkStart(`./_Types/PageInfo.ts`); -#>

import { Type } from '../common';
import gql from 'graphql-tag';

export default new Type({
  schema: gql`
    type PageInfo {
      hasNextPage: Boolean!
      hasPreviousPage: Boolean!
      startCursor: String
      endCursor: String
      count: Int
    }
  `,
});
