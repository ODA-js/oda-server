<#@ context 'entity' -#>
<#-for ( let connection of entity.connections ) {#>
input addTo#{connection.name}Input {
  clientMutationId: String
  #{entity.ownerFieldName}:ID!
  #{connection.refFieldName}:ID!
  #additional Edge fields
<# connection.fields.forEach(f=>{-#>
  #{f.name}: #{f.type}
<# });-#>
}

type addTo#{connection.name}Payload {
  clientMutationId: String
  viewer: Viewer
  #{entity.ownerFieldName}: #{entity.name}
}

input removeFrom#{connection.name}Input {
  clientMutationId: String
  #{connection.refFieldName}:ID!
  #{entity.ownerFieldName}:ID!
}

type removeFrom#{connection.name}Payload {
  clientMutationId: String
  viewer: Viewer
  #{entity.ownerFieldName}: #{entity.name}
}
<# }-#>
