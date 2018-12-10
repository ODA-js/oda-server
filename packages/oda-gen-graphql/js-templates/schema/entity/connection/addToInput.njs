<#@ chunks "$$$main$$$" -#>
<#@ alias 'connection-mutations-addTo-input'#>
<#@ context 'ctx'#>

<#- 
const {entity, connection} = ctx;
chunkStart(`./connections/addTo${connection.name}Input.ts`); -#>
<# slot('import-connection-index-slot',`addTo${connection.name}Input`) #>
<# slot('export-connection-index-slot',`addTo${connection.name}Input`) #>
import { Input } from '../../../common';
import gql from 'graphql-tag';

export default new Input({
  schema: gql`
    input addTo#{connection.name}Input {
      #{entity.ownerFieldName}:ID!
      #{connection.refFieldName}:#{connection.embedded ? 'create'+connection.entity+'Input' :'ID'}!
      #additional Edge fields
    <# connection.fields.forEach(f=>{-#>
      #{f.name}: #{f.type}
    <# });-#>
    }
  `,
});
