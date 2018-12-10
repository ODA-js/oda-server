<#@ context "ctx" -#>
<#@ alias 'show-rel-multiple-embed' -#>
<#-
  const {entity, f} = ctx;
-#>
<#-if(f.inheritedFrom){-#>
  uix.#{f.inheritedFrom}.Fragments.#{f.name}.show({uix, source})
<#-} else {-#>
<uix.ArrayField 
  key="resources.#{entity.name}.fields.#{f.field}"
  label="resources.#{entity.name}.fields.#{f.field}"
  filter={{}}
  source={`${source}#{f.field}`}
  >
  < uix.#{f.ref.entity}.Grid fields={'!#{f.field}'}/>
</uix.ArrayField>
<#-}-#>