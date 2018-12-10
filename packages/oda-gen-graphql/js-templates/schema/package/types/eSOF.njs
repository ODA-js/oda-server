<#@ alias 'types/eSOF' #>
<#@ chunks "$$$main$$$" -#>
<#- chunkStart(`./_Types/eSOF.ts`); -#>
import { Enum } from '../common';
import gql from 'graphql-tag';

export default new Enum({
  schema: gql`
    enum eSOF {
      assigned
      void
    }
  `,
});
