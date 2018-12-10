<#@ alias 'types/ImageSize' #>
<#@ chunks "$$$main$$$" -#>
<#- chunkStart(`./_Types/ImageSize.ts`); -#>
import { Enum } from '../common';
import gql from 'graphql-tag';

export default new Enum({
  schema: gql`
    enum ImageSize {
      small
      middle
      large
    }
  `,
});
