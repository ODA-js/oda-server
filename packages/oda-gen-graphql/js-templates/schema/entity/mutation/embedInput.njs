<#@ chunks "$$$main$$$" -#>
<#@ alias 'mutations-embed'#>
<#@ context 'entity'#>

<#- chunkStart(`./mutations/embed${entity.name}Input.ts`); -#>
import { Input } from '../../../common';
import gql from 'graphql-tag';

export default new Input({
  schema: gql`
    input embed#{entity.name}Input {
<#- for (let field of entity.update){#>
      #{field.name}: #{field.type}
<#-}#>
<#- for (let rel of entity.relations.filter(f=>f.persistent)){
const refName = rel.fields.length > 0 ? `embed${rel.ref.entity}UpdateInto${entity.name}${rel.cField}Input` : `embed${rel.ref.entity}Input`;
#>
      #{rel.field}: <#if(!rel.single){#>[<#}#>#{refName}<#if(!rel.single){#>]<#}#>
<#-}#>
    }
  `,
});
