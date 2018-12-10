<#@ chunks "$$$main$$$" -#>
<#@ alias 'connection-mutations-removeFrom-input'#>
<#@ context 'ctx'#>

<#- 
const {entity, connection} = ctx;
chunkStart(`./connections/removeFrom${connection.name}Input.ts`); -#>
<# slot('import-connection-index-slot',`removeFrom${connection.name}Input`) #>
<# slot('export-connection-index-slot',`removeFrom${connection.name}Input`) #>
import { Input } from '../../../common';
import gql from 'graphql-tag';

export default new Input({
  schema: gql`
    input removeFrom#{connection.name}Input {
      #{connection.refFieldName}:ID!
<#if(!connection.embedded){-#>
      #{entity.ownerFieldName}:ID!
<#-}#>
    }
  `,
});
