<#@ alias 'types/WhereJSON' #>
<#@ chunks "$$$main$$$" -#>
<#- chunkStart(`./_Types/WhereJSON.ts`); -#>
import { Input } from '../common';
import gql from 'graphql-tag';

export default new Input({
  schema: gql`
    input WhereJSON {
      query: JSON!
    }
  `,
});
