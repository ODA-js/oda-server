<#@ alias 'types/WhereMutationKind' #>
<#@ chunks "$$$main$$$" -#>
<#- chunkStart(`./_Types/WhereMutationKind.ts`); -#>
import { Input } from '../common';
import gql from 'graphql-tag';

export default new Input({
  schema: gql`
    input WhereMutationKind {
      in: [MutationKind!]
    }
  `,
});
