<#@ alias 'types/WhereID' #>
<#@ chunks "$$$main$$$" -#>
<#- chunkStart(`./_Types/WhereID.ts`); -#>
import { Input } from '../common';
import gql from 'graphql-tag';

export default new Input({
  schema: gql`
    input WhereID {
      eq: ID
      ne: ID
      in: [ID!]
      nin: [ID!]
      and: [WhereID!]
      or: [WhereID!]
      nor: [WhereID!]
      not: [WhereID!]
      exists: Boolean
    }
  `,
});
