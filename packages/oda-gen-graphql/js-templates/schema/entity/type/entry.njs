<#@ context 'entity'#>
<#@ alias 'type-entry'#>

type #{entity.name} <#-if(entity.implements.length > 0){#>
implements #{entity.implements.join(' & ')}
<#}-#>
{
<#- entity.fields.forEach(field => { -#>
<# if(field.description){#>
  # #{field.description}
<#- }#>
  #{field.name}#{field.args}: #{field.type}
<#-})-#>

<#- entity.relations.forEach(rel => { -#>
<# if(rel.description){#>
  # #{rel.description}
<#- }#>
  <#if(rel.embedded) {-#>
  #{rel.name}#{rel.args}: <#if(!rel.single){#>[<#}#>#{rel.type}<#if(!rel.single){#>]<#}#>
  <#-} else if(rel.single) {-#>

  #{rel.name}#{rel.args}: #{rel.type}

  <#-} else {-#>
  <#if(rel.derived){#>
  #{rel.name}(#{rel.args} ): #{rel.connectionName}
  <#} else {#>
  #{rel.name}(after: String, first: Int, before: String, last: Int, limit: Int, skip: Int, orderBy: [#{rel.entity}SortOrder], filter:#{rel.entity}ComplexFilter ): #{rel.connectionName}
  <#-}-#>
  <#-}-#>
<#-})#>
}