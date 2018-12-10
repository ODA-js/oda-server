<#@ context "ctx" -#>
<#@ alias 'show-rel-multiple-not-embed-stored' -#>
<#-
  const {entity, f} = ctx;
-#>
<#-if(f.inheritedFrom){-#>
  uix.#{f.inheritedFrom}.Fragments.#{f.name}.show({uix, source})
<#-} else {-#>
<uix.ReferenceArrayField 
  key="resources.#{entity.name}.fields.#{f.name}"
  label="resources.#{entity.name}.fields.#{f.name}"
  reference="#{!(f.verb==='BelongsToMany' && f.ref.using)? f.ref.entity: f.ref.using.entity}"
  filter={{}}
  source={`${source}#{f.source}`}
>
  <uix.#{!(f.verb==='BelongsToMany' && f.ref.using)? f.ref.entity: f.ref.using.entity}.Grid fields={'!#{f.source}'}/>
</uix.ReferenceArrayField>
<#-}-#>