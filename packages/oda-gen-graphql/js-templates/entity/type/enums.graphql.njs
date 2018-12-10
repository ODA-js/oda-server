<#@ context 'entity' -#>
enum #{entity.name}SortOrder {<#
  if(entity.fields.length > 0){
  for (let key of entity.fields){
#>
  #{key}Asc
  #{key}Desc
<#-
    }
  } else {
#>
  native
  <#}#>
}