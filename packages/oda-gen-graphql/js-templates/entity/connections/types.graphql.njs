<#@ context 'entity' -#>

type #{entity.plural}Connection {
  pageInfo: PageInfo!
  edges: [#{entity.plural}Edge]
  # put here your additional connection fields
}

type #{entity.plural}Edge {
  node: #{entity.name}
  cursor: String!
  # put here your additiona edge fields
}

<#
if(entity.connections.length > 0){
  entity.connections.forEach(connection => {
#>

type #{connection.connectionName}Connection {
  pageInfo: PageInfo!
  edges: [#{connection.connectionName}Edge]
  # put here your additional connection fields
}

type #{connection.connectionName}Edge {
  node: #{connection.refType}
  cursor: String!
<#- if(connection.fields.length > 0){#>
  #additional Edge fields
<#
connection.fields.forEach(f=>{#>
<#-if(f.description){#>
  # #{f.description}
<#}-#>
  #{f.name}#{f.argsString}: #{f.type}
<#- });-#>
<#}#>
  # put here your additiona edge fields
}

<#-})
}-#>

