<#@ context 'entity' -#>

# Input types for basic CUD

# input type for #{entity.name}
input create#{entity.name}Input {
  clientMutationId: String
<#- for (let field of entity.create){#>
  #{field.name}: #{field.type}
<#-}#>
<#- for (let rel of entity.relations.filter(f=>f.persistent)){
const refName = rel.fields.length > 0 ? `embed${rel.ref.entity}CreateInto${entity.name}${rel.cField}Input` : `embed${rel.ref.entity}Input`;
#>
  #{rel.field}: <#if(!rel.single){#>[<#}#>#{refName}<#if(!rel.single){#>]<#}#>
<#-}#>
}

input embed#{entity.name}Input {
  clientMutationId: String
<#- for (let field of entity.update){#>
  #{field.name}: #{field.type}
<#-}#>
<#- for (let rel of entity.relations.filter(f=>f.persistent)){
const refName = rel.fields.length > 0 ? `embed${rel.ref.entity}UpdateInto${entity.name}${rel.cField}Input` : `embed${rel.ref.entity}Input`;
#>
  #{rel.field}: <#if(!rel.single){#>[<#}#>#{refName}<#if(!rel.single){#>]<#}#>
<#-}#>
}

<#- for (let rel of entity.relations.filter(f=>f.persistent && f.fields.length > 0)){
const createName = `embed${rel.ref.entity}CreateInto${entity.name}${rel.cField}Input`;
const updateName = `embed${rel.ref.entity}UpdateInto${entity.name}${rel.cField}Input`;
let eEntity = rel.ref.eEntity;
  let eRels = eEntity.relations;

#>

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
}

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
<#-}#>

# Payload type for #{entity.name}
type create#{entity.name}Payload {
  clientMutationId: String
  viewer: Viewer
  #{entity.payloadName}: #{entity.plural}Edge
}

# input type for #{entity.name}
input update#{entity.name}Input {
  clientMutationId: String
<#- for (let field of entity.update){#>
  #{field.name}: #{field.type}
<#-}#>
<#- for (let rel of entity.relations.filter(f=>f.persistent)){

const createName = rel.fields.length > 0 ? `embed${rel.ref.entity}CreateInto${entity.name}${rel.cField}Input` : `create${rel.ref.entity}Input`;
const updateName = rel.fields.length > 0 ? `embed${rel.ref.entity}UpdateInto${entity.name}${rel.cField}Input` : `embed${rel.ref.entity}Input`;
#>
  #{rel.field}: <#if(!rel.single){#>[<#}#>#{updateName}<#if(!rel.single){#>]<#}#>
  #{rel.field}Unlink: <#if(!rel.single){#>[<#}#>#{updateName}<#if(!rel.single){#>]<#}#>
  #{rel.field}Create: <#if(!rel.single){#>[<#}#>#{createName}<#if(!rel.single){#>]<#}#>
<#-}#>
}

# Payload type for #{entity.name}
type update#{entity.name}Payload {
  clientMutationId: String
  viewer: Viewer
  #{entity.payloadName}: #{entity.name}
}

# input type for #{entity.name}
input delete#{entity.name}Input {
  clientMutationId: String
<#- for (let field of entity.unique){#>
  #{field.name}: #{field.type}
<#-}#>
}

# Payload type for #{entity.name}
type delete#{entity.name}Payload {
  clientMutationId: String
  viewer: Viewer
  deletedItemId: ID
  #{entity.payloadName}: #{entity.name}
}
