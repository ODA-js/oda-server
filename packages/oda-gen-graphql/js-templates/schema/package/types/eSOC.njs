<#@ alias 'types/eSOC' #>
<#@ chunks "$$$main$$$" -#>
<#- chunkStart(`./_Types/eSOC.ts`); -#>
import { Enum } from '../common';
import gql from 'graphql-tag';

export default new Enum({
  schema: gql`
    enum eSOC {
      empty
      any
    }
  `,
});
