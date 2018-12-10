<#@ chunks "$$$main$$$" -#>
<#@ alias 'mutations-delete-types'#>
<#@ context 'entity'#>

<#- chunkStart(`./mutations/delete/delete${entity.name}Input.ts`); -#>
import { Input } from '../../../../common';
import gql from 'graphql-tag';

export default new Input({
  schema: gql`
    input delete#{entity.name}Input {
<#- for (let field of entity.unique){#>
      #{field.name}: #{field.type}
<#-}#>
    } 
  `,
});

<#- chunkStart(`./mutations/delete/delete${entity.name}Payload.ts`); -#>

import { Type } from '../../../../common';
import gql from 'graphql-tag';

export default new Type({
  schema: gql`
    type delete#{entity.name}Payload {
      deletedItemId: ID
      #{entity.payloadName}: #{entity.name}
    }
  `,
});
