<#@ context "ctx" -#>
<#@ alias 'show-rel-single-not-embed' -#>
<#-
  const {entity, f} = ctx;
-#>
<#-if(f.inheritedFrom){-#>
  uix.#{f.inheritedFrom}.ShowFragments.#{f.name}.show({uix, source})
<#-} else {-#>
<uix.ReferenceField
  key="resources.#{entity.name}.fields.#{f.name}" 
  label="resources.#{entity.name}.fields.#{f.name}" 
  source={`${source}#{f.source}`}
  filter={{}}
  reference="#{f.ref.entity}"
  linkType="show"
>
  <uix.#{f.ref.entity}.SelectTitle />
</uix.ReferenceField>
<#-}-#>