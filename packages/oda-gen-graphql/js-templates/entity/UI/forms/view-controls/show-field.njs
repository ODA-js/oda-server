<#@ context "ctx" -#>
<#@ alias 'show-field' -#>
<#-
  const {entity, f} = ctx;
-#>
<#-if(f.inheritedFrom){-#>
  uix.#{f.inheritedFrom}.Fragments.#{f.name}.show({uix, source})
<#-} else {-#>
<uix.primitive.#{f.type}.field 
  key="resources.#{entity.name}.fields.#{f.name}" 
  label="resources.#{entity.name}.fields.#{f.name}" 
  source={`${source}#{f.source}`}
/>
<#-}-#>