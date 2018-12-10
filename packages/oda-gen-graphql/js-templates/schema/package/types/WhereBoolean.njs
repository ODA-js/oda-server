<#@ alias 'types/WhereBoolean' #>
<#@ chunks "$$$main$$$" -#>
<#- chunkStart(`./_Types/WhereBoolean.ts`); -#>

import { Input } from '../common';
import gql from 'graphql-tag';

export default new Input({
  schema: gql`
    input WhereBoolean {
      eq: Boolean
      ne: Boolean
      exists: Boolean
    }
  `,
});
