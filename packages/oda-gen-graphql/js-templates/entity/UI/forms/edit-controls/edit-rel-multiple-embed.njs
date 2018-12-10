<#@ context "ctx" -#>
<#@ alias 'edit-rel-multiple-embed' -#>
<#-
  const {entity, f} = ctx;
-#>
<#-if(f.inheritedFrom){-#>
  uix.#{f.inheritedFrom}.Fragments.#{f.name}.edit({uix, source})
<#-} else {-#>
<uix.ArrayInput 
  key="resources.#{entity.name}.fields.#{f.field}"
  label="resources.#{entity.name}.fields.#{f.field}"
  source={`${source}#{f.source}`}
  filter={{}}
  allowEmpty 
>
  <uix.SimpleFormIterator>
    {uix.#{f.ref.entity}.getFields({name:'all', uix, type: 'edit'})}
  </uix.SimpleFormIterator>
</uix.ArrayInput>
<#-}-#>
