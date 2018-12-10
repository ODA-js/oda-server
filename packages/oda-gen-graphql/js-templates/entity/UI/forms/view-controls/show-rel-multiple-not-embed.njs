<#@ context "ctx" -#>
<#@ alias 'show-rel-multiple-not-embed' -#>
<#-
  const {entity, f} = ctx;
-#>
<#-if(f.inheritedFrom){-#>
  uix.#{f.inheritedFrom}.Fragments.#{f.name}.show({uix, source})
<#-} else {-#>
<uix.ReferenceManyField 
  key="resources.#{entity.name}.fields.#{f.name}"
  label="resources.#{entity.name}.fields.#{f.name}"
  reference="#{!(f.verb==='BelongsToMany' && f.ref.using)? f.ref.entity: f.ref.using.entity}"
  filter={{}}
  target="#{f.ref.opposite}"
>
  <uix.#{!(f.verb==='BelongsToMany' && f.ref.using)? f.ref.entity: f.ref.using.entity}.Grid  fields={'!#{f.ref.opposite}'} />
</uix.ReferenceManyField>
<#-}-#>