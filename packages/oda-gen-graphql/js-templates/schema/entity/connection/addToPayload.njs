<#@ chunks "$$$main$$$" -#>
<#@ alias 'connection-mutations-addTo-payload'#>
<#@ context 'ctx'#>

<#- 
const {entity, connection} = ctx;
chunkStart(`./connections/addTo${connection.name}Payload.ts`); -#>
<# slot('import-connection-index-slot',`addTo${connection.name}Payload`) #>
<# slot('export-connection-index-slot',`addTo${connection.name}Payload`) #>
import { Type } from '../../../common';
import gql from 'graphql-tag';

export default new Type({
  schema: gql`
    type addTo#{connection.name}Payload {
      #{entity.ownerFieldName}: #{entity.name}
    }
  `,
});
