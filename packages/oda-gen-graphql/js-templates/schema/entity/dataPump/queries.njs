<#@ context 'entity' -#>
<#@ chunks '$$$main$$$' -#>
<#@ alias 'dataPump/queries' #>

<# chunkStart(`../../dataQueries/${entity.name}/create.graphql`); #>
# Create #{entity.name}
mutation create#{entity.name}($#{entity.ownerFieldName}: create#{entity.name}Input!){
  create#{entity.name}(input:$#{entity.ownerFieldName}){
    #{entity.ownerFieldName} {
      node {
        id
      }
    }
  }
}

<# chunkStart(`../../dataQueries/${entity.name}/update.graphql`); #>
# Update #{entity.name}
mutation update#{entity.name}($#{entity.ownerFieldName}: update#{entity.name}Input!){
  update#{entity.name}(input:$#{entity.ownerFieldName}){
    #{entity.ownerFieldName} {
      id
    }
  }
}

<# chunkStart(`../../dataQueries/${entity.name}/list.graphql`); #>
# List of #{entity.plural}
query #{entity.plural} {
  #{entity.name}: #{entity.dcPlural} @_(get: "edges"){
    edges @_(map: "node"){
      node{
        ...View#{entity.name}Full
      }
    }
  }
}

<# chunkStart(`../../dataQueries/${entity.name}/fragments.graphql`); #>
# fragments for single unique keys
<#- for (let f of entity.unique) {#>
fragment Embed#{entity.name}With#{f.cName} on #{entity.name} {
  #{f.name}
}
<#-}#>

<#-if(entity.complexUnique && entity.complexUnique.length > 0){#>
# fragments for complex unique keys
<#- for (let f of entity.complexUnique) {
  let findBy = f.fields.map(f=>f.uName).join('And');
  let loadArgs = `${f.fields.map(f=>`args.${f.name}`).join(', ')}`;
  let condArgs = `${f.fields.map(f=>`args.${f.name}`).join(' && ')}`;
#>
fragment Embed#{entity.name}With#{findBy} on #{entity.name} {
  <#- for(let fld of f.fields){ #>
  #{fld.name}
  <#-}#>
}
<#-}#>
<#-}#>

# fragments on entity
fragment View#{entity.name} on #{entity.name} {
  <#- for(let fld of entity.fields){ #>
  #{fld.name}
  <#-}#>
}

fragment View#{entity.name}Full on #{entity.name} {
  <#- for(let fld of entity.fields){ #>
  #{fld.name}
  <#-}#>
  <#- for(let fld of entity.relations){ #>
  #{fld.field} <#-if(fld.single){#>{
    ...Embed#{fld.ref.entity}WithId
  }
<#-} else {#>@_(get: "edges"){
    edges @_(map: "node"){
      node {
        ...Embed#{fld.ref.entity}WithId
      }
    }
  }
    <#-}#>
  <#-}#>
}

<#
//queries for single unique keys
#>
<#- for (let f of entity.unique) {#>
<# chunkStart(`../../dataQueries/${entity.name}/findBy${f.cName}.graphql`); #>
query find#{entity.name}By#{f.cName}( $#{f.name}: #{f.type}) {
  #{entity.ownerFieldName}(#{f.name}:$#{f.name}) {
    ...View#{entity.name}Full
  }
}
<#-}#>

<#-if(entity.complexUnique && entity.complexUnique.length > 0){#>
<#
// # queries for complex unique keys
#>
<#- for (let f of entity.complexUnique) {
  let findBy = f.fields.map(f=>f.uName).join('And');
  let loadArgs = `${f.fields.map(f=>`$${f.name}: ${f.type}`).join(', ')}`;
  let condArgs = `${f.fields.map(f=>`${f.name}: $${f.name}`).join(', ')}`;
#>
<# chunkStart(`../../dataQueries/${entity.name}/findBy${findBy}.graphql`); #>
query find#{entity.name}By#{findBy}(#{loadArgs}) {
  #{entity.ownerFieldName}(#{condArgs}){
    ...View#{entity.name}Full
  }
}
<#-}#>
<#-}#>