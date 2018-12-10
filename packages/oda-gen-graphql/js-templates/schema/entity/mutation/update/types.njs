<#@ chunks "$$$main$$$" -#>
<#@ alias 'mutations-update-types'#>
<#@ context 'entity'#>

<#- chunkStart(`./mutations/update/update${entity.name}Input.ts`); -#>
import { Input } from '../../../../common';
import gql from 'graphql-tag';

export default new Input({
  schema: gql`
    input update#{entity.name}Input {
    <#- for (let field of entity.update){#>
      #{field.name}: #{field.type}
    <#-}#>
    <#- for (let rel of entity.relations.filter(f=>f.persistent)){

    const createName = rel.fields.length > 0 ? `embed${rel.ref.entity}CreateInto${entity.name}${rel.cField}Input` : `create${rel.ref.entity}Input`;
    const updateName = rel.fields.length > 0 ? `embed${rel.ref.entity}UpdateInto${entity.name}${rel.cField}Input` : `embed${rel.ref.entity}Input`;
    #>
      #{rel.field}: <#if(!rel.single){#>[<#}#>#{updateName}<#if(!rel.single){#>]<#}#>
<#- if(!rel.embedded){#>
      #{rel.field}Unlink: <#if(!rel.single){#>[<#}#>#{updateName}<#if(!rel.single){#>]<#}#>
      #{rel.field}Create: <#if(!rel.single){#>[<#}#>#{createName}<#if(!rel.single){#>]<#}#>
<#-}#>
    <#-}#>
    }
  `,
});

<#- chunkEnd(); -#>

<#- for (let rel of entity.relations.filter(f=>f.persistent && f.fields.length > 0)){
const createName = `embed${rel.ref.entity}CreateInto${entity.name}${rel.cField}Input`;
const updateName = `embed${rel.ref.entity}UpdateInto${entity.name}${rel.cField}Input`;
let eEntity = rel.ref.eEntity;
  let eRels = eEntity.relations;
#>

<#- chunkStart(`./mutations/create/${createName}.ts`); -#>
<# slot('import-embed-entity-create-rel-mutation-types', createName) #>
<# slot('use-embed-entity-create-rel-mutation-types', createName) #>
import { Input } from '../../../../common';
import gql from 'graphql-tag';

export default new Input({
  schema: gql`
input #{createName} {
<#- for (let field of eEntity.create){#>
  #{field.name}: #{field.type}
<#-}#>
<#- for (let field of rel.fields){#>
  #{field.name}: #{field.type}
<#-}#>
<#-
 for (let eRel of eRels.filter(f=>f.persistent)){
const refName = eRel.fields.length > 0 ? `embed${eRel.ref.entity}UpdateInto${eEntity}${eRel.cField}Input` : `embed${eRel.ref.entity}Input`;
#>
  #{eRel.field}: <#if(!eRel.single){#>[<#}#>#{refName}<#if(!eRel.single){#>]<#}#>
<#-}#>
}`
});

<#- chunkEnd(); -#>
<#- chunkStart(`./mutations/update/${updateName}.ts`); -#>
<# slot('import-embed-entity-update-rel-mutation-types', updateName) #>
<# slot('use-embed-entity-update-rel-mutation-types', updateName) #>

import { Input } from '../../../../common';
import gql from 'graphql-tag';

export default new Input({
  schema: gql`
input #{updateName} {
<#- for (let field of eEntity.update){#>
  #{field.name}: #{field.type}
<#-}#>
<#- for (let field of rel.fields){#>
  #{field.name}: #{field.type}
<#-}#>
<#-
 for (let eRel of eRels.filter(f=>f.persistent)){
const refName = eRel.fields.length > 0 ? `embed${eRel.ref.entity}UpdateInto${eEntity}${eRel.cField}Input` : `embed${eRel.ref.entity}Input`;
#>
  #{eRel.field}: <#if(!eRel.single){#>[<#}#>#{refName}<#if(!eRel.single){#>]<#}#>
<#-}#>
}
`});
<#- chunkEnd(); -#>

<#-}#>


<#- chunkStart(`./mutations/update/update${entity.name}Payload.ts`); -#>

import { Type } from '../../../../common';
import gql from 'graphql-tag';

export default new Type({
  schema: gql`
    type update#{entity.name}Payload {
      #{entity.payloadName}: #{entity.name}
    }
  `,
});
