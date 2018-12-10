<#@ context "ctx" -#>
<#@ alias 'edit-rel-single-not-embed-w-preview' -#>
<#-
  const {entity, f} = ctx;
-#>
<#-if(f.inheritedFrom){-#>
  uix.#{f.inheritedFrom}.Fragments.#{f.name}.edit({uix, source})
<#-} else {-#>
<uix.InputWithPreview 
  key="resources.#{entity.name}.fields.#{f.name}"
  label="resources.#{entity.name}.fields.#{f.name}"
  source={`${source}#{f.source}`}
  reference="#{f.ref.entity}"
  perPage={10000}
  filter={{}}
  Select={uix.SelectInput}
  <#- if (!f.required){#>
  allowEmpty<#} else {-#>
  validate={uix.required()}<#}#>
  optionText={<uix.#{f.ref.entity}.SelectTitle />}
  />
<#-}-#>
