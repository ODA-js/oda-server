<#@ chunks "$$$main$$$" -#>
<#@ alias 'connection-mutations-removeFrom-payload'#>
<#@ context 'ctx'#>

<#- 
const {entity, connection} = ctx;
chunkStart(`./connections/removeFrom${connection.name}Payload.ts`); -#>
<# slot('import-connection-index-slot',`removeFrom${connection.name}Payload`) #>
<# slot('export-connection-index-slot',`removeFrom${connection.name}Payload`) #>
import { Type } from '../../../common';
import gql from 'graphql-tag';

export default new Type({
  schema: gql`
    type removeFrom#{connection.name}Payload {
      #{entity.ownerFieldName}: #{entity.name}
    }
  `,
});
