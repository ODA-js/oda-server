<#@ alias 'types/WhereDate' #>
<#@ chunks "$$$main$$$" -#>
<#- chunkStart(`./_Types/WhereDate.ts`); -#>
import { Input } from '../common';
import gql from 'graphql-tag';

export default new Input({
  schema: gql`
    input WhereDate {
      eq: Date
      gt: Date
      gte: Date
      lt: Date
      lte: Date
      ne: Date
      in: [Date!]
      nin: [Date!]
      and: [WhereDate!]
      or: [WhereDate!]
      nor: [WhereDate!]
      not: [WhereDate!]
      exists: Boolean
      match: String
    }
  `,
});
