<#@ context "ctx" -#>
<#@ alias 'edit-rel-single-not-embed' -#>
<#-
  const {entity, f} = ctx;
-#>
<#-if(f.inheritedFrom){-#>
  uix.#{f.inheritedFrom}.Fragments.#{f.name}.edit({uix, source})
<#-} else {-#>
<uix.ReferenceInput 
  key="resources.#{entity.name}.fields.#{f.name}"
  label="resources.#{entity.name}.fields.#{f.name}"
  source={`${source}#{f.source}`}
  filter={{}}
  reference="#{f.ref.entity}"
  <#- if (!f.required){#>
  allowEmpty<#} else {-#>
  validate={uix.required()}<#}#>
>
  <uix.SelectInput 
    optionText={<uix.#{f.ref.entity}.SelectTitle />} 
  />
</uix.ReferenceInput>
<#-}-#>