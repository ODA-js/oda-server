<#@ alias 'types/WhereInt' #>
<#@ chunks "$$$main$$$" -#>
<#- chunkStart(`./_Types/WhereInt.ts`); -#>
import { Input } from '../common';
import gql from 'graphql-tag';

export default new Input({
  schema: gql`
    input WhereInt {
      eq: Int
      gt: Int
      gte: Int
      lt: Int
      lte: Int
      ne: Int
      in: [Int!]
      nin: [Int!]
      and: [WhereInt!]
      or: [WhereInt!]
      nor: [WhereInt!]
      not: [WhereInt!]
      exists: Boolean
    }
  `,
});
