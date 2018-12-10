<#@ alias 'types/WhereFloat' #>
<#@ chunks "$$$main$$$" -#>
<#- chunkStart(`./_Types/WhereFloat.ts`); -#>
import { Input } from '../common';
import gql from 'graphql-tag';

export default new Input({
  schema: gql`
    input WhereFloat {
      eq: Float
      gt: Float
      gte: Float
      lt: Float
      lte: Float
      ne: Float
      in: [Float!]
      nin: [Float!]
      and: [WhereFloat!]
      or: [WhereFloat!]
      nor: [WhereFloat!]
      not: [WhereFloat!]
      exists: Boolean
    }
  `,
});
