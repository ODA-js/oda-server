<#@ context 'pack' -#>
@startuml #{pack.name}

<# for(let relation of pack.relations){-#>
  #{relation.src} <#if(relation.opposite){#>"#{relation.opposite}" <#}#>--<#if(!relation.opposite){#>><#}#> "#{relation.single ? '1':'*'} #{relation.field}" #{relation.dest}
<#if(relation.using){-#>
  (#{relation.src}, #{relation.dest}) . #{relation.using}
<#}#>
<#}#>

<#- for(let entity of pack.entities){-#>
  class #{entity.name} {
<#- for(let i = 0, len = entity.fields.length; i< len ;i++){
let field = entity.fields[i];
#>
    #{field.name}: #{field.type || 'ID'}
<#-}#>
<#- for(let i = 0, len = entity.queries.length; i< len ;i++){
let query = entity.queries[i];
#>
    #{query.type}#{query.single?'':'[]'} #{query.name}(#{query.args})
<#-}#>
  }

<#}-#>
@enduml