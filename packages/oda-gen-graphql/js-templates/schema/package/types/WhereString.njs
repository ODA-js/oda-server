<#@ alias 'types/WhereString' #>
<#@ chunks "$$$main$$$" -#>
<#- chunkStart(`./_Types/WhereString.ts`); -#>
import { Input } from '../common';
import gql from 'graphql-tag';

export default new Input({
  schema: gql`
    input WhereString {
      eq: String
      ne: String
      in: [String!]
      nin: [String!]
      and: [WhereString!]
      or: [WhereString!]
      nor: [WhereString!]
      not: [WhereString!]
      exists: Boolean
      match: String
      imatch: String
    }
  `,
});
