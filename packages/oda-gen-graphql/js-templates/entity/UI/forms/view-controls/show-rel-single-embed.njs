<#@ context "ctx" -#>
<#@ alias 'show-rel-single-embed' -#>
<#-
  const {entity, f} = ctx;
-#>
<#- let embededEntity = entity.UI.embedded[f.field]; -#>
<#-if(f.inheritedFrom){-#>
  uix.#{f.inheritedFrom}.Fragments.#{f.name}.show({uix, source})
<#-} else {-#>
uix.#{embededEntity}.getFields({name:'all', uix, type: 'show', source: `${source}#{f.source}`})
<#-}-#>

